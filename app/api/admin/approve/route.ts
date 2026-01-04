import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, action } = await request.json(); // id: username, action: 'approve' | 'reject'

    if (action === 'approve') {
        await prisma.user.update({
            where: { username: id },
            data: { status: 'APPROVED' }
        });
    } else if (action === 'reject') {
        // Option 1: Delete
        await prisma.user.delete({
            where: { username: id }
        });
        // Option 2: Set status REJECTED (if we want to keep record)
    }

    return NextResponse.json({ success: true });
}
