import { NextRequest, NextResponse } from 'next/server';
import { generateFeatureExplanations } from '@/lib/ai/gemini';
import { z } from 'zod';

const generateFeatureExplanationsSchema = z.object({
  features: z.array(z.string().min(1, 'Feature cannot be empty')),
  productTitle: z.string().min(1, 'Product title is required'),
  productDescription: z.string().min(1, 'Product description is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = generateFeatureExplanationsSchema.parse(body);
    
    // Generate feature explanations using Gemini AI
    const explanations = await generateFeatureExplanations(validatedData);
    
    return NextResponse.json({
      success: true,
      data: explanations,
    });
    
  } catch (error) {
    console.error('Error in generate-feature-explanations API:', error);
    
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
        error: 'Failed to generate feature explanations',
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