import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: List Departments
export async function GET(request: Request) {
    try {
        const departments = await prisma.department.findMany();
        return NextResponse.json({ departments });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// POST: Create Department
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
                color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color
            }
        });
        return NextResponse.json({ department: dept });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
    }
}

// DELETE: Remove Department
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
