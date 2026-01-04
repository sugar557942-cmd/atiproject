import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) {
        return NextResponse.json({ user: null });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
        return NextResponse.json({ user: null });
    }

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
        where: { username: payload.id as string }
    });

    if (!user) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({
        user: {
            id: user.username,
            name: user.name,
            role: user.role,
            avatar: '#579bfc',
            department: user.department,
            email: user.email
        }
    });
}
