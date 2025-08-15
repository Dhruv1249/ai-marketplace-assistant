import { NextRequest, NextResponse } from 'next/server';
import { suggestLayoutOptions } from '@/lib/ai/gemini';
import { z } from 'zod';

const suggestLayoutSchema = z.object({
  productType: z.string().min(1, 'Product type is required'),
  contentLength: z.enum(['short', 'medium', 'long']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = suggestLayoutSchema.parse(body);
    
    // Generate layout suggestions using Gemini AI
    const layoutOptions = await suggestLayoutOptions(
      validatedData.productType,
      validatedData.contentLength
    );
    
    return NextResponse.json({
      success: true,
      data: layoutOptions,
    });
    
  } catch (error) {
    console.error('Error in suggest-layout API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to suggest layout options',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
    },
    { status: 405 }
  );
}