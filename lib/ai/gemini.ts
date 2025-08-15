import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export interface ContentGenerationRequest {
  productDescription: string;
  category?: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'technical';
}

export interface GeneratedContent {
  title: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  seoKeywords: string[];
  metaDescription: string;
}

export async function generateProductContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  try {
    const model = 'learnlm-2.0-flash-experimental';
    
    const prompt = `
      You are an expert e-commerce copywriter. Generate comprehensive product page content based on the following description:
      
      Product Description: ${request.productDescription}
      Category: ${request.category || 'General'}
      Target Audience: ${request.targetAudience || 'General consumers'}
      Tone: ${request.tone || 'professional'}
      
      Please provide a JSON response with the following structure:
      {
        "title": "Compelling product title (max 60 characters)",
        "description": "Detailed product description (2-3 paragraphs)",
        "features": ["feature1", "feature2", "feature3"],
        "specifications": {"spec1": "value1", "spec2": "value2"},
        "seoKeywords": ["keyword1", "keyword2", "keyword3"],
        "metaDescription": "SEO meta description (max 160 characters)"
      }
      
      Make sure the response is valid JSON only, without any additional text or formatting.
    `;

    const config = {
      temperature: 0.7,
      maxOutputTokens: 1000,
    };

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
      fullResponse += chunk.text || '';
    }

    // Clean the response to ensure it's valid JSON
    const cleanedText = fullResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', fullResponse);
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate product content');
  }
}

export async function suggestLayoutOptions(
  productType: string,
  contentLength: 'short' | 'medium' | 'long'
): Promise<string[]> {
  try {
    const model = 'learnlm-2.0-flash-experimental';

    const prompt = `
      You are a UX designer specializing in e-commerce product pages.
      Suggest 3-4 optimal layout options for a ${productType} product page with ${contentLength} content.
      Return only a JSON array of layout names like: ["gallery-focused", "feature-blocks", "single-column", "comparison-table"]
      
      Make sure the response is valid JSON only, without any additional text or formatting.
    `;

    const config = {
      temperature: 0.5,
      maxOutputTokens: 200,
    };

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
      fullResponse += chunk.text || '';
    }

    // Clean the response to ensure it's valid JSON
    const cleanedText = fullResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', fullResponse);
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    console.error('Error suggesting layouts:', error);
    throw new Error('Failed to suggest layout options');
  }
}

export async function optimizeForSEO(
  title: string,
  description: string,
  category: string
): Promise<{
  optimizedTitle: string;
  optimizedDescription: string;
  keywords: string[];
  metaDescription: string;
}> {
  try {
    const model = 'learnlm-2.0-flash-experimental';

    const prompt = `
      You are an SEO expert. Optimize the following product information for SEO:
      
      Title: ${title}
      Description: ${description}
      Category: ${category}
      
      Please provide a JSON response with the following structure:
      {
        "optimizedTitle": "SEO-optimized title (max 60 characters)",
        "optimizedDescription": "SEO-optimized description",
        "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
        "metaDescription": "SEO meta description (max 160 characters)"
      }
      
      Make sure the response is valid JSON only, without any additional text or formatting.
    `;

    const config = {
      temperature: 0.3,
      maxOutputTokens: 800,
    };

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
      fullResponse += chunk.text || '';
    }

    // Clean the response to ensure it's valid JSON
    const cleanedText = fullResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', fullResponse);
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    console.error('Error optimizing for SEO:', error);
    throw new Error('Failed to optimize content for SEO');
  }
}

export async function generateContentWithStreaming(
  request: ContentGenerationRequest,
  onChunk?: (chunk: string) => void
): Promise<GeneratedContent> {
  try {
    const model = 'learnlm-2.0-flash-experimental';
    
    const prompt = `
      You are an expert e-commerce copywriter. Generate comprehensive product page content based on the following description:
      
      Product Description: ${request.productDescription}
      Category: ${request.category || 'General'}
      Target Audience: ${request.targetAudience || 'General consumers'}
      Tone: ${request.tone || 'professional'}
      
      Please provide a JSON response with the following structure:
      {
        "title": "Compelling product title (max 60 characters)",
        "description": "Detailed product description (2-3 paragraphs)",
        "features": ["feature1", "feature2", "feature3"],
        "specifications": {"spec1": "value1", "spec2": "value2"},
        "seoKeywords": ["keyword1", "keyword2", "keyword3"],
        "metaDescription": "SEO meta description (max 160 characters)"
      }
      
      Make sure the response is valid JSON only, without any additional text or formatting.
    `;

    const config = {
      temperature: 0.7,
      maxOutputTokens: 1000,
    };

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
      
      // Call the onChunk callback if provided
      if (onChunk && chunkText) {
        onChunk(chunkText);
      }
    }

    // Clean the response to ensure it's valid JSON
    const cleanedText = fullResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', fullResponse);
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate product content');
  }
}

export default ai;