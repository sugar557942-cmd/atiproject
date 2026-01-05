import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJWT } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, pw } = body;

        console.log(`[Login Attempt] User: ${id}`);

        if (!id || !pw) {
            return NextResponse.json({ error: '아이디와 비밀번호를 입력해주세요.' }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { username: id }
        });

        if (!user) {
            console.log(`[Login Failed] User not found: ${id}`);
            return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
        }

        // Check password
        const isMatch = await bcrypt.compare(pw, user.password);
        if (!isMatch) {
            console.log(`[Login Failed] Invalid password: ${id}`);
            return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
        }

        // Check status
        if (user.status !== 'APPROVED') {
            console.log(`[Login Failed] Status not approved: ${id}, Status: ${user.status}`);
            const msg = user.status === 'PENDING' ? '승인 대기 중인 계정입니다.' : '가입이 거절된 계정입니다.';
            return NextResponse.json({ error: msg }, { status: 403 });
        }

        // Create Token
        const token = await signJWT({
            id: user.username,
            role: user.role,
            name: user.name
        });

        // Return user info and set cookie
        const response = NextResponse.json({
            user: {
                id: user.username,
                name: user.name,
                role: user.role,
                avatar: '#579bfc', // Placeholder
                department: user.department,
                email: user.email
            }
        });

        response.cookies.set('ati_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from strict to lax for better compatibility
            maxAge: 60 * 60 * 24 // 1 day
        });

        return response;

    } catch (error: any) {
        console.error('[Login Error]', error);
        // Return actual error message for debugging
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
