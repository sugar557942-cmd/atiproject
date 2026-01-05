
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export async function POST(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const meeting = await prisma.meeting.create({
            data: {
                projectId: body.projectId,
                date: body.date,
                attendees: body.attendees,
                agenda: body.agenda,
                decisions: body.decisions,
                actionItems: body.actionItems,
                transcript: body.transcript
            }
        });
        return NextResponse.json(meeting);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
