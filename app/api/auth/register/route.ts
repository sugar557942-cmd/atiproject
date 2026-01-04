import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, pw, name, birthDate, department, email } = body;

        // Check duplicate
        const existing = await prisma.user.findUnique({
            where: { username: id }
        });
        if (existing) {
            return NextResponse.json({ error: '이미 존재하는 아이디입니다.' }, { status: 409 });
        }

        // Hash PW
        const hashedPassword = await bcrypt.hash(pw, 10);

        // Create User (PENDING)
        await prisma.user.create({
            data: {
                username: id,
                password: hashedPassword,
                name,
                birthDate,
                department,
                email,
                role: 'user', // Default
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
