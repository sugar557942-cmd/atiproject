import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// Force Node.js runtime for Google Cloud Storage
export const runtime = 'nodejs';

export async function POST(request: Request) {
    // 1. Auth Check
    const token = cookies().get('ati_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyJWT(token);
    if (!payload) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    // 2. Load Env
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const bucketName = process.env.GCS_BUCKET;

    if (!serviceAccountJson || !bucketName) {
        console.error('Missing GCS Env Vars');
        return NextResponse.json({ error: 'Server Misconfiguration (GCS)' }, { status: 500 });
    }

    try {
        const { path, contentType } = await request.json();

        // 3. Validate Path
        const allowedPrefixes = ['meetings/', 'attachments/', 'reports/'];
        if (!path || !allowedPrefixes.some(prefix => path.startsWith(prefix))) {
            return NextResponse.json({ error: 'Invalid path. Must start with meetings/, attachments/, or reports/.' }, { status: 400 });
        }

        // 4. Initialize Storage
        const credentials = JSON.parse(serviceAccountJson);
        const storage = new Storage({
            projectId: credentials.project_id,
            credentials,
        });

        // 5. Generate Signed URL
        const options = {
            version: 'v4' as const,
            action: 'write' as const,
            expires: Date.now() + 10 * 60 * 1000, // 10 minutes
            contentType: contentType,
        };

        const [url] = await storage
            .bucket(bucketName)
            .file(path)
            .getSignedUrl(options);

        // 6. Return Response
        return NextResponse.json({
            url,
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
            },
        });

    } catch (e) {
        console.error('GCS Signed URL Error:', e);
        return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }
}
