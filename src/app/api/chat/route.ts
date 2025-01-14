import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_KEY) {
    throw new Error('GEMINI_KEY is not defined');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
    try {
        const { transcript, question } = await req.json();

        const prompt = `You are a chatbot tasked with providing informative and concise answers to users based on context and a specific question provided.

                Always base your response on the video transcript provided in the context.
        Begin your reply with "This video" or "From the video" instead of "this document".
    Ensure that your responses are concise and do not exceed five lines.
               Format:
                 Context: ${transcript}
                 Question: ${question}`

        const ans = await model.generateContent(prompt);
        const answer = ans.response.text();

        return NextResponse.json({ answer });
    }
    catch (e) {
        console.error(e); // Better error logging
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}