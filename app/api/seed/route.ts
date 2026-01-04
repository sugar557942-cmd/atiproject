import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// WARNING: This route should be disabled or protected in production
export async function GET(request: Request) {
    try {
        const id = 'kim';
        const pw = '1234';

        const existing = await prisma.user.findUnique({
            where: { username: id }
        });

        if (existing) {
            return NextResponse.json({ message: 'Admin user already exists' });
        }

        const hashedPassword = await bcrypt.hash(pw, 10);

        await prisma.user.create({
            data: {
                username: id,
                password: hashedPassword,
                name: '김철수',
                email: 'kim@ati.com',
                department: 'Product',
                role: 'admin',
                status: 'APPROVED',
                avatar: '#579bfc'
            }
        });

        return NextResponse.json({ message: 'Admin user created: kim / 1234' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
