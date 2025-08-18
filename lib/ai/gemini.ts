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

export interface FeatureExplanationRequest {
  features: string[];
  productTitle: string;
  productDescription: string;
}

export async function generateContentWithStreaming(
  request: ContentGenerationRequest,
  onChunk?: (chunk: string) => void
): Promise<GeneratedContent> {
  async function callAI(): Promise<string> {
    const config = {};
    const model = 'gemini-1.5-flash';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Generate comprehensive e-commerce product content for: ${request.productDescription}
            
Category: ${request.category || 'General'}
Target Audience: ${request.targetAudience || 'General consumers'}
Tone: ${request.tone || 'professional'}

Respond with valid JSON:
{
  "title": "Product title (max 60 chars)",
  "description": "Detailed description (2-3 paragraphs)",
  "features": ["feature1", "feature2", "feature3"],
  "specifications": {"spec1": "value1", "spec2": "value2"},
  "seoKeywords": ["keyword1", "keyword2", "keyword3"],
  "metaDescription": "SEO description (max 160 chars)"
}`,
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
      if (onChunk && chunkText) onChunk(chunkText);
    }
    return fullResponse;
  }

  try {
    console.log('Starting AI generation with request:', request);
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

    let fullResponse = await callAI();

    // If we got an empty response from the experimental model, try again
    if (!fullResponse || fullResponse.trim() === '') {
      console.log('Empty response from AI, retrying...');
      fullResponse = await callAI();
    }

    // Clean the response to ensure it's valid JSON
    const cleanedText = fullResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Cleaned text:', cleanedText);

    try {
      const parsedResult = JSON.parse(cleanedText);
      console.log('Successfully parsed JSON:', parsedResult);
      return parsedResult;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', fullResponse);

      // Try one more time to get a valid response from the AI
      console.log('Retrying AI call due to JSON parse error...');
      const retryResponse = await callAI();
      const retryCleaned = retryResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const retryParsed = JSON.parse(retryCleaned);
      return retryParsed;
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw error; // Let the error propagate
  }
}

export async function generateProductContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  return generateContentWithStreaming(request);
}

export async function generateFeatureExplanations(
  request: FeatureExplanationRequest
): Promise<Record<string, string>> {
  async function callAI(): Promise<string> {
  const config = {};
  const model = 'gemini-1.5-flash'; // Use more stable model
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Generate detailed explanations for the following product features. Each explanation should be 1-5 lines and help customers understand the benefit and value of the feature.

Product: ${request.productTitle}
Product Description: ${request.productDescription}

Features to explain:
${request.features.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
${request.features.map(feature => `  "${feature}": "Brief 1-5 line explanation of benefits and value"`).join(',\n')}
}

Do not include any other text, markdown formatting, or code blocks. Just the JSON object.`,
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
    return fullResponse;
  }

  try {
    console.log('Starting feature explanations generation with request:', request);
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

    let fullResponse = await callAI();
    console.log('Raw AI response:', fullResponse);

    // If we got an empty response, try again with fallback
    if (!fullResponse || fullResponse.trim() === '') {
      console.log('Empty response from AI, retrying...');
      fullResponse = await callAI();
    }

    // Still empty? Return fallback explanations
    if (!fullResponse || fullResponse.trim() === '') {
      console.log('Still empty response, using fallback explanations');
      const fallbackExplanations: Record<string, string> = {};
      request.features.forEach(feature => {
        fallbackExplanations[feature] = `This feature provides enhanced functionality and improved user experience. It offers reliable performance and adds significant value to the overall product quality.`;
      });
      return fallbackExplanations;
    }

    // Clean the response to ensure it's valid JSON
    let cleanedText = fullResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^[^{]*/, '') // Remove any text before the first {
      .replace(/[^}]*$/, '') // Remove any text after the last }
      .trim();

    // If still no valid JSON structure, try to extract it
    if (!cleanedText.startsWith('{')) {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
    }

    console.log('Cleaned feature explanations text:', cleanedText);

    try {
      const parsedResult = JSON.parse(cleanedText);
      console.log('Successfully parsed feature explanations JSON:', parsedResult);
      
      // Validate that we have explanations for all features
      const validatedResult: Record<string, string> = {};
      request.features.forEach(feature => {
        validatedResult[feature] = parsedResult[feature] || `This ${feature.toLowerCase()} enhances the product's functionality and provides excellent value for users.`;
      });
      
      return validatedResult;
    } catch (parseError) {
      console.error('JSON parse error for feature explanations:', parseError);
      console.error('Cleaned text that failed to parse:', cleanedText);

      // Return fallback explanations instead of throwing error
      const fallbackExplanations: Record<string, string> = {};
      request.features.forEach(feature => {
        fallbackExplanations[feature] = `This feature enhances product performance and delivers exceptional value. It's designed to meet user needs and provide reliable, long-lasting benefits.`;
      });
      return fallbackExplanations;
    }
  } catch (error) {
    console.error('Error generating feature explanations:', error);
    
    // Return fallback explanations instead of throwing error
    const fallbackExplanations: Record<string, string> = {};
    request.features.forEach(feature => {
      fallbackExplanations[feature] = `This feature provides enhanced functionality and improved user experience for optimal product performance.`;
    });
    return fallbackExplanations;
  }
}

export async function suggestLayoutOptions(
  productType: string,
  contentLength: 'short' | 'medium' | 'long'
): Promise<string[]> {
  return ["gallery-focused", "feature-blocks", "single-column", "comparison-table"];
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
  return {
    optimizedTitle: title,
    optimizedDescription: description,
    keywords: [category, "quality", "premium", "best"],
    metaDescription: description.substring(0, 160)
  };
}

export default ai;