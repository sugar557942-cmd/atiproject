import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = "nodejs"; // Required for file processing in some environments

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'Missing GOOGLE_API_KEY environment variable' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Convert File to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');

        // 2. Upload to Gemini (Directly using generateContent with inline data for simplicity if small, 
        //    or use File API for larger. For this demo, let's assume inline < 20MB)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Please analyze this meeting recording.
            Return a JSON object with the following fields:
            - transcript: A cleaned up transcript of the meeting.
            - summary: A summary of the key decisions made, separated by topics.
            - actionItems: A list of action items/to-dos extracted from the meeting.
            
            Format the response as pure JSON without Markdown code blocks.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: file.type || 'audio/mp3',
                    data: base64Audio
                }
            }
        ]);

        const text = result.response.text();

        // Cleanup JSON if needed (sometimes Gemini wraps in ```json ... ```)
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return NextResponse.json({
            success: true,
            transcript: data.transcript,
            summary: data.summary,
            actionItems: data.actionItems
        });

    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
