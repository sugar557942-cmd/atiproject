
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming lib/prisma exists, otherwise will check imports
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

// Helper to get user
async function getUser() {
    const token = cookies().get('ati_token')?.value;
    if (!token) return null;
    return verifyJWT(token);
}

// GET: List Projects (filtered)
export async function GET(request: Request) {
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
            projects = await prisma.project.findMany({
                where: {
                    members: { some: { userId: user.id } }
                },
                include: {
                    members: { include: { user: true } },
                    tasks: true,
                    meetings: true,
                    groups: { orderBy: { order: 'asc' } }
                }
            });
        }

        // Transform Members to match frontend structure if needed
        // Frontend expects: members: { id, name, role... }
        // DB returns: members: { userId, user: { name... }, projectRole }
        const formattedProjects = projects.map(p => ({
            ...p,
            members: p.members.map(pm => ({
                id: pm.user.id,
                name: pm.user.name,
                role: pm.user.role || 'Member', // User global role
                projectRole: pm.projectRole,
                avatar: pm.user.avatar || '#ccc',
                email: pm.user.email
            })),
            rnrItems: p.tasks.map(t => ({
                ...t,
                // Ensure fields match
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

        const project = await prisma.project.create({
            data: {
                name,
                department,
                status: 'Planning',
                startDate,
                endDate,
                category,
                groups: {
                    create: [{ name: '할 일', order: 0 }, { name: '완료됨', order: 1 }]
                },
                members: {
                    create: {
                        userId: user.id,
                        projectRole: 'manager'
                    }
                }
            },
            include: {
                members: { include: { user: true } },
                groups: true
            }
        });

        // Format return
        const formattedProject = {
            ...project,
            members: project.members.map(pm => ({
                id: pm.user.id,
                name: pm.user.name,
                role: pm.user.role,
                projectRole: pm.projectRole,
                avatar: pm.user.avatar,
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
