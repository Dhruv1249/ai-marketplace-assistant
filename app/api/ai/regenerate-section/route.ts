import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { section, context, currentContent } = await request.json();

    if (!section || !context) {
      return NextResponse.json(
        { success: false, error: 'Section and context are required' },
        { status: 400 }
      );
    }

    let prompt = '';
    
    switch (section) {
      case 'title':
        prompt = `Generate a compelling product title based on the following context:
        
Product Description: ${context.description}
Category: ${context.category}
Target Audience: ${context.targetAudience}
Tone: ${context.tone}

Current Title: ${currentContent}

Generate a new, improved product title that is:
- Catchy and memorable
- SEO-friendly
- Appeals to the target audience
- Reflects the product category
- Uses ${context.tone} tone

Return only the title, no additional text.`;
        break;

      case 'description':
        prompt = `Generate an improved product description based on the following context:
        
Product Title: ${context.title}
Category: ${context.category}
Target Audience: ${context.targetAudience}
Tone: ${context.tone}

Current Description: ${currentContent}

Generate a new, improved product description that is:
- Engaging and informative
- Highlights key benefits
- Appeals to ${context.targetAudience}
- Uses ${context.tone} tone
- 2-3 paragraphs long

Return only the description, no additional text.`;
        break;

      case 'features':
        prompt = `Generate improved key features based on the following context:
        
Product Title: ${context.title}
Product Description: ${context.description}
Category: ${context.category}
Target Audience: ${context.targetAudience}
Tone: ${context.tone}

Current Features: ${Array.isArray(currentContent) ? currentContent.join(', ') : currentContent}

Generate 4-6 new key features that are:
- Specific and benefit-focused
- Relevant to ${context.targetAudience}
- Highlight unique selling points
- Use ${context.tone} tone

Return as a JSON array of strings, no additional text.`;
        break;

      case 'specifications':
        prompt = `Generate improved technical specifications based on the following context:
        
Product Title: ${context.title}
Product Description: ${context.description}
Category: ${context.category}
Target Audience: ${context.targetAudience}

Current Specifications: ${JSON.stringify(currentContent)}

Generate 5-8 relevant technical specifications for this ${context.category} product that would be important to ${context.targetAudience}.

Return as a JSON object with specification names as keys and values as strings, no additional text.`;
        break;

      case 'seoKeywords':
        prompt = `Generate improved SEO keywords based on the following context:
        
Product Title: ${context.title}
Product Description: ${context.description}
Category: ${context.category}
Target Audience: ${context.targetAudience}

Current Keywords: ${Array.isArray(currentContent) ? currentContent.join(', ') : currentContent}

Generate 8-12 SEO keywords that are:
- Relevant to the product and category
- Target audience focused
- Mix of short and long-tail keywords
- Include product-specific terms

Return as a JSON array of strings, no additional text.`;
        break;

      case 'metaDescription':
        prompt = `Generate an improved meta description based on the following context:
        
Product Title: ${context.title}
Product Description: ${context.description}
Category: ${context.category}
Target Audience: ${context.targetAudience}

Current Meta Description: ${currentContent}

Generate a new meta description that is:
- Under 160 characters
- Includes primary keywords
- Compelling and click-worthy
- Appeals to ${context.targetAudience}
- Summarizes key benefits

Return only the meta description, no additional text.`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid section specified' },
          { status: 400 }
        );
    }

    const config = {};
    const model = 'gemini-2.5-flash-lite';
    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let generatedContent = '';
    for await (const chunk of response) {
      const chunkText = chunk.text || '';
      generatedContent += chunkText;
    }

    generatedContent = generatedContent.trim();

    // Parse JSON responses for array/object sections
    if (['features', 'specifications', 'seoKeywords'].includes(section)) {
      try {
        // Clean and parse the response (remove markdown code blocks)
        let cleanedText = generatedContent
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();

        // Extract JSON object/array
        const jsonMatch = cleanedText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }

        generatedContent = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Raw response:', generatedContent);
        return NextResponse.json(
          { success: false, error: 'Failed to parse AI response' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: generatedContent
    });

  } catch (error) {
    console.error('Error regenerating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate content' },
      { status: 500 }
    );
  }
}