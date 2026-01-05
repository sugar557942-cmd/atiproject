
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

// Helper to get user
async function getUser() {
    const token = cookies().get('ati_token')?.value;
    if (!token) return null;
    return verifyJWT(token);
}

// PUT: Update Project
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    // TODO: Verify user is manager/sub-manager or admin
    // For now assuming simple member check or manager check
    // Check membership
    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId: id, userId: user.id }
        }
    });

    if (!membership && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        // Handle Project Info updates
        const updated = await prisma.project.update({
            where: { id },
            data: body // Assuming body matches schema fields or subset
        });
        return NextResponse.json(updated);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE: Delete Project
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    // Check membership (Manager only)
    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId: id, userId: user.id }
        }
    });

    if ((!membership || membership.projectRole !== 'manager') && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        await prisma.project.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
