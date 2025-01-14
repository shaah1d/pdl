import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure GEMINI_KEY is defined
if (!process.env.GEMINI_KEY) {
  throw new Error('GEMINI_KEY is not defined');
}

// Initialize Google Generative AI
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
    console.log(`Fetching transcript for video: ${videoId}`);
    
    // Fetch YouTube transcript
    const transcript: TranscriptEntry[] = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: 'No transcript available' }, { status: 404 });
    }

    // Combine transcript text
    const transcriptText = transcript.map(entry => entry.text).join(" ");

    // Generate content using Gemini API
    console.log('Calling Gemini API for summary...');
    const prompt = `
      You are an advanced AI designed to interpret video transcripts and generate detailed summaries. 
      Do not use any markdown syntax; instead, write headings plainly, e.g., "Introduction".
      
      Task Instructions:
      - Review the video transcript.
      - Craft a 4-5 paragraph summary including purpose, highlights, and insights.
      
      Transcript: ${transcriptText}
    `;

    const summaryResult = await model.generateContent(prompt);
    const summary = await summaryResult.response.text();

    return NextResponse.json({
      summary,
      transcript: transcriptText,
    });

  } catch (error: any) {
    console.error('Error occurred:', {
      videoId,
      message: error.message,
      name: error.name,
      stack: error.stack,
      isGeminiError: error.name === 'GoogleGenerativeAIError',
    });

    if (error.name === 'GoogleGenerativeAIError') {
      return NextResponse.json({ error: `Gemini API error: ${error.message}` }, { status: 500 });
    }

    if (error.message.includes('Could not get transcripts')) {
      return NextResponse.json({ error: 'Transcript not available for this video' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
