import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// Initialize storage
// Assumes GOOGLE_APPLICATION_CREDENTIALS or env vars are set
// Ideally: process.env.GOOGLE_CLIENT_EMAIL, PRIVATE_KEY, etc.
// For Vercel, we often use specific env vars to instantiate.

const storage = new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCS_BUCKET_NAME || 'ati-project-uploads';

export async function POST(request: Request) {
    const token = cookies().get('ati_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Optional: Check if user is valid
    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { contentType, fileName } = await request.json();

        const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName}`;
        const options = {
            version: 'v4' as const,
            action: 'write' as const,
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: contentType,
        };

        const [url] = await storage
            .bucket(bucketName)
            .file(uniqueFilename)
            .getSignedUrl(options);

        // Public URL (assuming bucket is not public, accessed via signed URL or worker, but we might store this)
        // Or pure object key
        const objectKey = uniqueFilename;
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`; // If public
        // Better: store the GCS URI or just the name to generate read URLs later.
        // For processing, we just need the bucket/file name.

        return NextResponse.json({
            signedUrl: url,
            objectKey: objectKey,
            fileUrl: publicUrl // Return this for DB save
        });
    } catch (error: any) {
        console.error('GCS Signed URL Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
