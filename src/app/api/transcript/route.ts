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
    console.log(`Attempting to fetch transcript for video: ${videoId}`);
    
    const transcript: TranscriptEntry[] = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) {
      console.error('Empty transcript received');
      return NextResponse.json({ error: 'No transcript available' }, { status: 404 });
    }

    const texts = transcript.map((entry) => entry.text);
    const para = texts.join(" ");

    // Log before Gemini API call
    console.log('About to call Gemini API');
    
    const prompt = `You are an advanced AI designed to interpret video transcripts and generate detailed summaries. Your task is to provide a comprehensive explanation of the video content based on its transcript and the user-supplied context.
 please do not use any markdown syntax just write Introduction instead of **introduction**
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
    const summaryResult = await model.generateContent(prompt);
    const summary = summaryResult.response.text();



    
    return NextResponse.json({
      summary,
      transcript: para,
    });

  } catch (error: any) {
    // Detailed error logging
    console.error('Full error details:', {
      videoId,
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
      isGeminiError: error.name === 'GoogleGenerativeAIError',
      fullError: JSON.stringify(error)
    });

    // Specific error handling
    if (error.name === 'GoogleGenerativeAIError') {
      return NextResponse.json(
        { error: 'AI processing failed: ' + error.message },
        { status: 500 }
      );
    }

    if (error.message.includes('Could not get transcripts')) {
      return NextResponse.json(
        { error: 'Transcript not available for this video' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Server error',
        details: error.message,
        type: error.name 
      },
      { status: 500 }
    );
  }
}
