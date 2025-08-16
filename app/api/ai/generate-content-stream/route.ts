import { NextRequest } from 'next/server';
import { generateContentWithStreaming, ContentGenerationRequest } from '@/lib/ai/gemini';
import { z } from 'zod';

const generateContentSchema = z.object({
  productDescription: z.string().min(10, 'Product description must be at least 10 characters'),
  category: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'technical']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    // Validate request body
    const validatedData = generateContentSchema.parse(body);
    console.log('Validated data:', validatedData);
    
    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('Starting content generation with data:', validatedData);
          console.log('API Key available:', !!process.env.GEMINI_API_KEY);
          
          let chunks: string[] = [];
          
          const generatedContent = await generateContentWithStreaming(
            validatedData,
            (chunk: string) => {
              console.log('Received chunk:', chunk);
              // Send each chunk as it arrives
              chunks.push(chunk);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk, type: 'chunk' })}\n\n`)
              );
            }
          );
          
          console.log('Generated content:', generatedContent);
          
          // Send the final result
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              data: generatedContent, 
              type: 'complete' 
            })}\n\n`)
          );
          
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              type: 'error' 
            })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('Error in generate-content-stream API:', error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: error.errors,
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate content',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Method not allowed',
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}