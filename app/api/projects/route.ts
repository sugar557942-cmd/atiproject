import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

type JwtUser = {
    id: string; // username
    role?: string;
    name?: string;
};

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

async function getDbUserIdByUsername(username: string): Promise<string | null> {
    const dbUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });
    return dbUser?.id ?? null;
}

// GET: List Projects (filtered)
export async function GET(_request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        let projects;

        if (user.role === 'admin') {
            projects = await prisma.project.findMany({
                include: {
                    members: { include: { user: true } },
                    tasks: true,
                    meetings: true,
                    groups: { orderBy: { order: 'asc' } }
                }
            });
        } else {
            const dbUserId = await getDbUserIdByUsername(user.id);
            if (!dbUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

            projects = await prisma.project.findMany({
                where: {
                    members: { some: { userId: dbUserId } }
                },
                include: {
                    members: { include: { user: true } },
                    tasks: true,
                    meetings: true,
                    groups: { orderBy: { order: 'asc' } }
                }
            });
        }

        const formattedProjects = projects.map(p => ({
            ...p,
            members: p.members.map(pm => ({
                id: pm.user.id,
                name: pm.user.name,
                role: pm.user.role || 'Member',
                projectRole: pm.projectRole,
                avatar: pm.user.avatar || '#ccc',
                email: pm.user.email
            })),
            rnrItems: p.tasks.map(t => ({
                ...t
            }))
        }));

        return NextResponse.json(formattedProjects);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

// POST: Create Project
export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { name, department, startDate, endDate, category } = body;

        console.log(`[API] Create Project Request: ${JSON.stringify(body)}`);
        console.log(`[API] User ID from Token (username): ${user.id}`);

        const dbUserId = await getDbUserIdByUsername(user.id);
        if (!dbUserId) {
            console.error(`[API] DB User ID not found for username: ${user.id}`);
            return NextResponse.json({ error: 'Unauthorized: User not found in DB' }, { status: 401 });
        }
        console.log(`[API] Resolved DB UUID: ${dbUserId}`);

        const project = await prisma.project.create({
            data: {
                name,
                department,
                status: 'Planning',
                startDate,
                endDate,
                category,
                groups: {
                    create: [
                        { name: '할 일', order: 0 },
                        { name: '완료됨', order: 1 }
                    ]
                },
                members: {
                    create: {
                        userId: dbUserId,
                        projectRole: 'manager'
                    }
                }
            },
            include: {
                members: { include: { user: true } },
                groups: true
            }
        });

        const formattedProject = {
            ...project,
            members: project.members.map(pm => ({
                id: pm.user.id,
                name: pm.user.name,
                role: pm.user.role,
                projectRole: pm.projectRole,
                avatar: pm.user.avatar || '#ccc',
                email: pm.user.email
            })),
            rnrItems: [],
            meetings: []
        };

        return NextResponse.json(formattedProject);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
