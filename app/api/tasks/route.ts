
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

// POST: Create Task
export async function POST(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        // body: { projectId, level, parentId, group, ... }

        // TODO: Validate user permission (member of project)

        // Find group or create? In this model group is string name.
        // We need to map `group` name to a valid state. 
        // Or simpler: just store what frontend sends.

        const newTask = await prisma.task.create({
            data: {
                projectId: body.projectId,
                level: body.level,
                parentId: body.parentId,
                name: body.name || '새로운 업무',
                assignee: body.assignee,
                roleDescription: body.roleDescription,
                scope: body.scope,
                startDate: body.startDate,
                endDate: body.endDate,
                group: body.group,
                status: body.status || 'Empty',
                priority: body.priority || 'Empty',
                budget: body.budget || 0,
                memo: body.memo || ''
                // files: []
            }
        });

        return NextResponse.json(newTask);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// PUT: Batch or Single Update?
// Let's make a [id] route for single updates
