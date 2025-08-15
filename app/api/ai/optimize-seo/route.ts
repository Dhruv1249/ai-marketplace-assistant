import { NextRequest, NextResponse } from 'next/server';
import { optimizeForSEO } from '@/lib/ai/gemini';
import { z } from 'zod';

const optimizeSEOSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = optimizeSEOSchema.parse(body);
    
    // Optimize content for SEO using Gemini AI
    const optimizedContent = await optimizeForSEO(
      validatedData.title,
      validatedData.description,
      validatedData.category
    );
    
    return NextResponse.json({
      success: true,
      data: optimizedContent,
    });
    
  } catch (error) {
    console.error('Error in optimize-seo API:', error);
    
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
        error: 'Failed to optimize content for SEO',
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