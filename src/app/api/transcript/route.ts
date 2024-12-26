import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import {GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_KEY) {
  throw new Error('GEMINI_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface TranscriptEntry {
  offset: number;
  duration: number;
  text: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  try {
    const transcript: TranscriptEntry[] = await YoutubeTranscript.fetchTranscript(videoId);
    const texts = transcript.map((entry) => entry.text);
    const para = texts.join(" ");
 
    const prompt = `You are an advanced AI designed to interpret video transcripts and generate detailed summaries. Your task is to provide a comprehensive explanation of the video content based on its transcript and the user-supplied context.

Task Instructions:

Review the video transcript provided by the user.
Combine the key points and dialogue in the transcript with the context to craft an explanation in 4-5 paragraphs.
Create a concise and engaging summary that includes the purpose, highlights, and key insights from the video.
Tailor your explanation to match the user’s specified goals, such as education, storytelling, or professional analysis.
Example Input Format:

Transcript: [Include the transcript text or key excerpts from the video.]
Context: [User's context, e.g., "For an educational presentation about marine biology aimed at high school students."]
Example Output Structure:

Introduction: Summarize the main theme or subject of the video based on the transcript.
Details: Highlight key points, quotes, or ideas from the transcript that support the main theme.
Insights: Discuss the tone, intent, or deeper implications of the content.
Conclusion: Wrap up with how the content addresses the purpose and offers value based on the context provided.

Here is the transcript: ${para}`;
    const result = await model.generateContent(prompt);
    const output = result.response.text();
   console.log(result.response.text());
    return NextResponse.json(output);

   
  
  } catch (error: any) {
    console.log(error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}
