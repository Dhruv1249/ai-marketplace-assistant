import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { field, context, currentValue } = await request.json();

    if (!field) {
      return NextResponse.json(
        { success: false, error: 'Field is required' },
        { status: 400 }
      );
    }

    let prompt = '';
    
    switch (field) {
      case 'productTitle':
        prompt = `Generate a compelling product title based on the following context:

Current title: "${currentValue || 'None provided'}"
Product Description: "${context.productDescription || 'Not provided'}"
Category: "${context.category || 'Not specified'}"
Target Audience: "${context.targetAudience || 'Not specified'}"
Tone: "${context.tone || 'professional'}"

Generate a catchy, SEO-friendly product title that:
- Is under 60 characters for SEO optimization
- Highlights the main benefit or feature
- Appeals to the target audience
- Uses the specified tone
- Is memorable and clickable

Return only the product title text, no additional formatting or labels.`;
        break;

      case 'productDescription':
        prompt = `Generate a detailed product description based on the following context:
        
Current description: "${currentValue || 'None provided'}"
Product Title: "${context.productTitle || 'Not specified'}"
Category: "${context.category || 'Not specified'}"
Target Audience: "${context.targetAudience || 'Not specified'}"
Tone: "${context.tone || 'professional'}"

Generate a compelling, detailed product description that:
- Is 2-3 paragraphs long
- Highlights key benefits and features
- Appeals to the target audience
- Uses the specified tone
- Is engaging and persuasive

Return only the product description text, no additional formatting or labels.`;
        break;

      case 'category':
        prompt = `Based on the following product information, suggest the most appropriate product category:

Product Description: "${context.productDescription || 'Not provided'}"
Current Category: "${currentValue || 'None'}"
Target Audience: "${context.targetAudience || 'Not specified'}"

Suggest a specific, accurate product category that would be suitable for e-commerce platforms. Consider categories like:
- Electronics (with subcategories like Smartphones, Laptops, Audio, etc.)
- Clothing & Fashion
- Home & Garden
- Sports & Fitness
- Beauty & Personal Care
- Books & Media
- Toys & Games
- Automotive
- Health & Wellness

Return only the category name, be specific but concise (e.g., "Electronics > Audio > Headphones" or just "Wireless Headphones").`;
        break;

      case 'targetAudience':
        prompt = `Based on the following product information, identify the most suitable target audience:

Product Description: "${context.productDescription || 'Not provided'}"
Category: "${context.category || 'Not specified'}"
Current Target Audience: "${currentValue || 'None'}"

Identify the primary target audience for this product. Consider demographics, interests, and use cases. Examples:
- Tech enthusiasts
- Fitness enthusiasts
- Parents with young children
- Professional gamers
- Small business owners
- College students
- Home cooks
- Outdoor adventurers

Return only the target audience description, be specific and concise (e.g., "Tech-savvy professionals" or "Fitness enthusiasts and athletes").`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid field specified' },
          { status: 400 }
        );
    }

    const model = 'gemini-2.5-flash-lite';
    const config = {};
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullResponse = '';
    for await (const chunk of response) {
      const chunkText = chunk.text || '';
      fullResponse += chunkText;
    }

    const generatedText = fullResponse.trim();

    return NextResponse.json({
      success: true,
      data: generatedText
    });

  } catch (error) {
    console.error('AI field generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate field content' },
      { status: 500 }
    );
  }
}