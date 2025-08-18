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
  const MAX_RETRIES = 5;

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

IMPORTANT: Respond ONLY with valid JSON in this exact format. Do not include any other text, explanations, or markdown formatting:

{
  "title": "Product title (max 60 chars)",
  "description": "Detailed description (2-3 paragraphs)",
  "features": ["feature1", "feature2", "feature3", "feature4", "feature5"],
  "specifications": {"spec1": "value1", "spec2": "value2", "spec3": "value3"},
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
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
    console.log('Raw AI response:', fullResponse);
    return fullResponse;
  }

  console.log('Starting AI generation with request:', request);
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_RETRIES}`);
      
      const fullResponse = await callAI();

      // Check if we got an empty response
      if (!fullResponse || fullResponse.trim() === '') {
        console.log(`Attempt ${attempt}: Empty response from AI`);
        if (attempt === MAX_RETRIES) {
          throw new Error('Failed to generate content after 5 attempts. The AI returned empty responses. Please try again.');
        }
        continue; // Try again
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

      console.log(`Attempt ${attempt}: Cleaned text:`, cleanedText);

      // If still no valid JSON, try again
      if (!cleanedText || cleanedText.length < 10) {
        console.log(`Attempt ${attempt}: No valid JSON found`);
        if (attempt === MAX_RETRIES) {
          throw new Error('Failed to generate content after 5 attempts. The AI did not return valid JSON. Please try again.');
        }
        continue; // Try again
      }

      try {
        const parsedResult = JSON.parse(cleanedText);
        console.log(`Attempt ${attempt}: Successfully parsed JSON:`, parsedResult);
        
        // Validate the parsed result has required fields
        if (!parsedResult.title || !parsedResult.description || !parsedResult.features) {
          console.log(`Attempt ${attempt}: Parsed JSON missing required fields`);
          if (attempt === MAX_RETRIES) {
            throw new Error('Failed to generate content after 5 attempts. The AI response was missing required fields. Please try again.');
          }
          continue; // Try again
        }
        
        // Success! Return the parsed result
        return parsedResult;
        
      } catch (parseError) {
        console.error(`Attempt ${attempt}: JSON parse error:`, parseError);
        console.error('Raw response:', fullResponse);
        console.error('Cleaned text that failed to parse:', cleanedText);

        if (attempt === MAX_RETRIES) {
          throw new Error('Failed to generate content after 5 attempts. The AI response could not be parsed as valid JSON. Please try again.');
        }
        continue; // Try again
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error generating content:`, error);
      
      if (attempt === MAX_RETRIES) {
        // If it's already our custom error message, re-throw it
        if (error instanceof Error && error.message.includes('Failed to generate content after 5 attempts')) {
          throw error;
        }
        // Otherwise, throw a generic error
        throw new Error('Failed to generate content after 5 attempts due to technical issues. Please try again.');
      }
      continue; // Try again
    }
  }

  // This should never be reached, but just in case
  throw new Error('Failed to generate content after 5 attempts. Please try again.');
}

export async function generateProductContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  return generateContentWithStreaming(request);
}

export async function generateFeatureExplanations(
  request: FeatureExplanationRequest
): Promise<Record<string, string>> {
  const MAX_RETRIES = 5;

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

  console.log('Starting feature explanations generation with request:', request);
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Feature explanations attempt ${attempt}/${MAX_RETRIES}`);
      
      const fullResponse = await callAI();
      console.log(`Attempt ${attempt}: Raw AI response:`, fullResponse);

      // Check if we got an empty response
      if (!fullResponse || fullResponse.trim() === '') {
        console.log(`Attempt ${attempt}: Empty response from AI`);
        if (attempt === MAX_RETRIES) {
          throw new Error('Failed to generate feature explanations after 5 attempts. The AI returned empty responses. Please try again.');
        }
        continue; // Try again
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

      console.log(`Attempt ${attempt}: Cleaned feature explanations text:`, cleanedText);

      // If still no valid JSON, try again
      if (!cleanedText || cleanedText.length < 10) {
        console.log(`Attempt ${attempt}: No valid JSON found`);
        if (attempt === MAX_RETRIES) {
          throw new Error('Failed to generate feature explanations after 5 attempts. The AI did not return valid JSON. Please try again.');
        }
        continue; // Try again
      }

      try {
        const parsedResult = JSON.parse(cleanedText);
        console.log(`Attempt ${attempt}: Successfully parsed feature explanations JSON:`, parsedResult);
        
        // Validate that we have explanations for all features
        const validatedResult: Record<string, string> = {};
        let missingFeatures = 0;
        
        request.features.forEach(feature => {
          if (parsedResult[feature]) {
            validatedResult[feature] = parsedResult[feature];
          } else {
            missingFeatures++;
          }
        });
        
        // If too many features are missing, try again
        if (missingFeatures > request.features.length / 2) {
          console.log(`Attempt ${attempt}: Too many missing feature explanations (${missingFeatures}/${request.features.length})`);
          if (attempt === MAX_RETRIES) {
            throw new Error('Failed to generate feature explanations after 5 attempts. The AI response was missing explanations for most features. Please try again.');
          }
          continue; // Try again
        }
        
        // Fill in any missing features with a generic explanation
        request.features.forEach(feature => {
          if (!validatedResult[feature]) {
            validatedResult[feature] = `This ${feature.toLowerCase()} enhances the product's functionality and provides excellent value for users.`;
          }
        });
        
        // Success! Return the validated result
        return validatedResult;
        
      } catch (parseError) {
        console.error(`Attempt ${attempt}: JSON parse error for feature explanations:`, parseError);
        console.error('Cleaned text that failed to parse:', cleanedText);

        if (attempt === MAX_RETRIES) {
          throw new Error('Failed to generate feature explanations after 5 attempts. The AI response could not be parsed as valid JSON. Please try again.');
        }
        continue; // Try again
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error generating feature explanations:`, error);
      
      if (attempt === MAX_RETRIES) {
        // If it's already our custom error message, re-throw it
        if (error instanceof Error && error.message.includes('Failed to generate feature explanations after 5 attempts')) {
          throw error;
        }
        // Otherwise, throw a generic error
        throw new Error('Failed to generate feature explanations after 5 attempts due to technical issues. Please try again.');
      }
      continue; // Try again
    }
  }

  // This should never be reached, but just in case
  throw new Error('Failed to generate feature explanations after 5 attempts. Please try again.');
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