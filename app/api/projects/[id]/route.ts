import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

/**
 * JWT payload 타입
 * 로그인 코드(signJWT)에서 { id: username, role, name } 형태로 넣고 있으므로
 * 여기서 user.id는 "DB의 uuid"가 아니라 "username"이다.
 */
type JwtUser = {
    id: string; // username
    role?: string;
    name?: string;
};

/**
 * 쿠키에서 토큰을 읽고 JWT를 검증해 "username 기반" 유저 정보를 반환
 * verifyJWT의 반환 타입이 unknown일 수 있으므로 여기서 타입 가드로 확정한다.
 */
async function getUser(): Promise<JwtUser | null> {
    const token = cookies().get('ati_token')?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);

    if (
        payload &&
        typeof payload === 'object' &&
        typeof (payload as any).id === 'string'
    ) {
        return payload as JwtUser;
    }

    return null;
}

/**
 * username -> DB User.id(uuid)로 변환
 * ProjectMember.userId는 DB의 User.id를 참조하므로 반드시 변환해서 써야 한다.
 */
async function getDbUserIdByUsername(username: string): Promise<string | null> {
    const dbUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    return dbUser?.id ?? null;
}

// PUT: Update Project
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = params;

        // JWT의 user.id는 username이므로 DB uuid로 변환
        const dbUserId = await getDbUserIdByUsername(user.id);
        if (!dbUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 멤버십 체크
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: { projectId: projectId, userId: dbUserId }
            }
        });

        if (!membership && user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: body
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE: Delete Project
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = params;

        // JWT의 user.id는 username이므로 DB uuid로 변환
        const dbUserId = await getDbUserIdByUsername(user.id);
        if (!dbUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 멤버십 체크 (Manager only)
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: { projectId: projectId, userId: dbUserId }
            }
        });

        if ((!membership || membership.projectRole !== 'manager') && user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.project.delete({ where: { id: projectId } });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
