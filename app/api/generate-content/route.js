import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate content using Pollinations AI
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a professional copywriter specializing in creating compelling professional profiles and bios. Always respond with well-structured, engaging content that sounds authentic and professional.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nContext: ${context || ''}`
          }
        ],
        model: 'openai',
        private: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const generatedText = await response.text();

    return NextResponse.json({
      success: true,
      content: generatedText.trim(),
      prompt
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to generate content' },
    { status: 405 }
  );
}