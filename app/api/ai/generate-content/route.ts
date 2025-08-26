import { NextRequest, NextResponse } from 'next/server';
import { generateProductContent, ContentGenerationRequest } from '@/lib/ai/gemini';
import { z } from 'zod';

const generateContentSchema = z.object({
  productTitle: z.string().optional(),
  productDescription: z.string().min(10, 'Product description must be at least 10 characters'),
  category: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'technical']).optional(),
  generateOptions: z.object({
    features: z.boolean().optional(),
    specifications: z.boolean().optional(),
    seoKeywords: z.boolean().optional(),
    metaDescription: z.boolean().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = generateContentSchema.parse(body);
    
    // Generate content using Gemini AI
    const generatedContent = await generateProductContent(validatedData);
    
    return NextResponse.json({
      success: true,
      data: generatedContent,
    });
    
  } catch (error) {
    console.error('Error in generate-content API:', error);
    
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
        error: 'Failed to generate content',
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