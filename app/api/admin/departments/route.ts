import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: List Departments (Public for Registration)
export async function GET(request: Request) {
    // No auth check needed for reading departments (used in Registration)
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json({ departments });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// POST: Create Department (Single - Keep for compatibility if needed, but primarily using PUT for batch)
export async function POST(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { name } = await request.json();
        const dept = await prisma.department.create({
            data: {
                name,
                color: '#' + Math.floor(Math.random() * 16777215).toString(16)
            }
        });
        return NextResponse.json({ department: dept });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

// PUT: Batch Save Departments
export async function PUT(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { departments } = await request.json(); // Expecting string[] of names

        // 1. Delete all existing (Simple approach for sync)
        // Or better: Find diff. For simplicity in this "Save" logic, we can wipe and recreate or upsert.
        // Wiping tables with FK might be risky if we link valid users to them.
        // Users link by String (department name) currently? Let's check schema.
        // User model: department String? -> It's just a string, not a relation.
        // So wiping Department table is safe-ish, but let's be smarter.

        // Actually, let's keep it simple: Ensure these exist.
        // We will transact:
        // 1. Get current DB depts.
        // 2. Identify to add and to delete.

        const currentData = await prisma.department.findMany();
        const currentNames = currentData.map(d => d.name);
        const newNames = departments as string[];

        const toAdd = newNames.filter(n => !currentNames.includes(n));
        const toDelete = currentNames.filter(n => !newNames.includes(n));

        await prisma.$transaction([
            prisma.department.deleteMany({
                where: { name: { in: toDelete } }
            }),
            prisma.department.createMany({
                data: toAdd.map(name => ({
                    name,
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16)
                }))
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to save departments' }, { status: 500 });
    }
}

// DELETE: Remove Department (Single)
export async function DELETE(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.department.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
