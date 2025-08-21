import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate a unique seed for variation
    const seed = Math.floor(Math.random() * 1000000);
    const width = 512;
    const height = 512;
    const model = 'flux';

    // Create the image URL using Pollinations AI
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;

    // Test if the image URL is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      seed
    });

  } catch (error) {
    console.error('Error generating photo:', error);
    return NextResponse.json(
      { error: 'Failed to generate photo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to generate photos' },
    { status: 405 }
  );
}