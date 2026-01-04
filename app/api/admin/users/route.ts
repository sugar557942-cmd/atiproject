import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch Pending Users
    const pendingUsers = await prisma.user.findMany({
        where: { status: 'PENDING' }
    });

    return NextResponse.json({
        users: pendingUsers.map((u: any) => ({
            id: u.username,
            name: u.name,
            role: u.role,
            avatar: '#ccc',
            department: u.department,
            email: u.email,
            birthDate: u.birthDate
        }))
    });
}
