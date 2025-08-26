import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export interface ContentGenerationRequest {
  productTitle?: string;
  productDescription: string;
  category?: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'technical';
  generateOptions?: {
    features?: boolean;
    specifications?: boolean;
    seoKeywords?: boolean;
    metaDescription?: boolean;
  };
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
  const MAX_RETRIES = 1;

  // Default generate options if not provided
  const options = {
    features: true,
    specifications: true,
    seoKeywords: true,
    metaDescription: true,
    ...request.generateOptions
  };

  async function callAI(): Promise<string> {
    const config = {};
    const model = 'gemini-2.5-flash-lite';
    
    // Build the JSON structure based on selected options only (no title/description)
    let jsonFields = [];

    if (options.features) {
      jsonFields.push(`  "features": ["feature1", "feature2", "feature3", "feature4", "feature5"]`);
    }

    if (options.specifications) {
      jsonFields.push(`  "specifications": {"spec1": "value1", "spec2": "value2", "spec3": "value3"}`);
    }

    if (options.seoKeywords) {
      jsonFields.push(`  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]`);
    }

    if (options.metaDescription) {
      jsonFields.push(`  "metaDescription": "SEO description (max 160 chars)"`);
    }

    // If no sections selected, return empty content
    if (jsonFields.length === 0) {
      return '{}';
    }

    let jsonStructure = `{\n${jsonFields.join(',\n')}\n}`;

    // Build sections list for prompt
    let sectionsToGenerate = [];

    if (options.features) {
      sectionsToGenerate.push('- Key Features (4-6 items)');
    }
    if (options.specifications) {
      sectionsToGenerate.push('- Technical Specifications (5-8 items)');
    }
    if (options.seoKeywords) {
      sectionsToGenerate.push('- SEO Keywords (8-12 items)');
    }
    if (options.metaDescription) {
      sectionsToGenerate.push('- Meta Description (under 160 chars)');
    }

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Generate e-commerce product content for: ${request.productDescription}
            
Product Title: ${request.productTitle || ''}
Category: ${request.category || 'General'}
Target Audience: ${request.targetAudience || 'General consumers'}
Tone: ${request.tone || 'professional'}

Generate ONLY the following content sections:
${sectionsToGenerate.join('\n')}

IMPORTANT: Respond ONLY with valid JSON in this exact format. Do not include any other text, explanations, or markdown formatting:

${jsonStructure}`,
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
  console.log('Generate options:', options);
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
        
        // Create the final result - use provided title/description, only AI-generated optional content
        const finalResult: GeneratedContent = {
          title: request.productTitle || 'Product Title',
          description: request.productDescription,
          features: options.features ? (parsedResult.features || []) : [],
          specifications: options.specifications ? (parsedResult.specifications || {}) : {},
          seoKeywords: options.seoKeywords ? (parsedResult.seoKeywords || []) : [],
          metaDescription: options.metaDescription ? (parsedResult.metaDescription || '') : ''
        };
        
        // Validate the parsed result has required fields
        if (!finalResult.title || !finalResult.description) {
          console.log(`Attempt ${attempt}: Parsed JSON missing required fields`);
          if (attempt === MAX_RETRIES) {
            throw new Error('Failed to generate content after 5 attempts. The AI response was missing required fields. Please try again.');
          }
          continue; // Try again
        }
        
        // Success! Return the final result
        return finalResult;
        
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
  const MAX_RETRIES = 3; // Reduce retries since the AI is working

  async function callAI(): Promise<string> {
    const config = {};
    const model = 'gemini-2.5-flash-lite';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Generate detailed explanations for the following product features. Each explanation should be 1-2 sentences and help customers understand the benefit and value of the feature.

Product: ${request.productTitle}
Product Description: ${request.productDescription}

Features to explain:
${request.features.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

Return a JSON object with feature names as keys and explanations as values. Example:
{
  "Feature Name": "Explanation of the feature and its benefits."
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
    }
    return fullResponse;
  }

  console.log('Starting feature explanations generation with request:', request);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Feature explanations attempt ${attempt}/${MAX_RETRIES}`);
      
      const fullResponse = await callAI();
      console.log(`Attempt ${attempt}: Raw AI response:`, fullResponse);

      // Check if we got an empty response
      if (!fullResponse || fullResponse.trim() === '') {
        console.log(`Attempt ${attempt}: Empty response from AI`);
        if (attempt === MAX_RETRIES) {
          // Return generic explanations instead of failing
          const genericResult: Record<string, string> = {};
          request.features.forEach(feature => {
            genericResult[feature] = `This ${feature.toLowerCase()} enhances the product's functionality and provides excellent value for users.`;
          });
          return genericResult;
        }
        continue;
      }

      // Extract JSON from response
      let cleanedText = fullResponse.trim();
      
      // Remove markdown code blocks
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      console.log(`Attempt ${attempt}: Cleaned text:`, cleanedText);

      try {
        const parsedResult = JSON.parse(cleanedText);
        console.log(`Attempt ${attempt}: Successfully parsed JSON:`, parsedResult);
        
        // Create result with all requested features
        const validatedResult: Record<string, string> = {};
        
        request.features.forEach(feature => {
          if (parsedResult[feature]) {
            validatedResult[feature] = parsedResult[feature];
          } else {
            // Provide generic explanation for missing features
            validatedResult[feature] = `This ${feature.toLowerCase()} enhances the product's functionality and provides excellent value for users.`;
          }
        });
        
        return validatedResult;
        
      } catch (parseError) {
        console.error(`Attempt ${attempt}: JSON parse error:`, parseError);
        console.error('Text that failed to parse:', cleanedText);

        if (attempt === MAX_RETRIES) {
          // Return generic explanations instead of failing
          const genericResult: Record<string, string> = {};
          request.features.forEach(feature => {
            genericResult[feature] = `This ${feature.toLowerCase()} enhances the product's functionality and provides excellent value for users.`;
          });
          return genericResult;
        }
        continue;
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error generating feature explanations:`, error);
      
      if (attempt === MAX_RETRIES) {
        // Return generic explanations instead of failing
        const genericResult: Record<string, string> = {};
        request.features.forEach(feature => {
          genericResult[feature] = `This ${feature.toLowerCase()} enhances the product's functionality and provides excellent value for users.`;
        });
        return genericResult;
      }
      continue;
    }
  }

  // Fallback - should never reach here
  const fallbackResult: Record<string, string> = {};
  request.features.forEach(feature => {
    fallbackResult[feature] = `This ${feature.toLowerCase()} enhances the product's functionality and provides excellent value for users.`;
  });
  return fallbackResult;
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