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
        
        const prompt = `You are a chatbot and you have to give an informative answer to the user, I will provide you with context and the question below. Do not hallucinate
                 context: ${transcript},
                 question: ${question}`

        const ans = await model.generateContent(prompt);
        const answer = ans.response.text();

        return NextResponse.json({ answer });
    }
    catch(e) {
        console.error(e); // Better error logging
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}