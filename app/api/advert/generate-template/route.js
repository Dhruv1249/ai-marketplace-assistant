import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

const TEMPLATE_SCHEMA = `
You must return a valid JSON object with this exact structure:
{
  "template": {
    "id": "ai-generated",
    "name": "AI Generated Template",
    "layout": "multi-column",
    "sections": [
      {
        "id": "unique-id",
        "type": "header|text|features|testimonials|gallery|stats|cta|highlights",
        "title": "Section Title (optional)",
        "content": "Text content (optional)",
        "items": [],
        "backgroundColor": "#hexcolor",
        "textColor": "#hexcolor",
        "editable": true
      }
    ],
    "colors": {
      "primary": "#hexcolor",
      "secondary": "#hexcolor",
      "background": "#hexcolor",
      "text": "#hexcolor"
    },
    "fonts": {
      "heading": "font-name",
      "body": "font-name"
    }
  }
}

Section types:
- header: title, subtitle, backgroundColor, textColor
- text: content, backgroundColor
- features: items array with {title, description}
- testimonials: items array with {text, author}
- gallery: items array with {image, caption}
- stats: items array with {number, label}
- cta: text, backgroundColor, textColor
- highlights: items array with {icon, title, description}

Return ONLY valid JSON, no markdown, no explanations.
`;

async function callAI(prompt) {
  const config = {};
  const model = 'gemini-2.5-flash-lite';

  const fullPrompt = `${TEMPLATE_SCHEMA}

User Request: ${prompt}

Create a professional advertisement template based on the user's request. Include 4-6 sections that make sense for their product/service. Use appropriate colors and fonts. Make it visually appealing and conversion-focused.`;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: fullPrompt,
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

  console.log('Raw AI response:', fullResponse);
  return fullResponse;
}

export async function POST(request) {
  const MAX_RETRIES = 3;

  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }

    console.log('Starting template generation with prompt:', prompt);
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${MAX_RETRIES}`);

        const fullResponse = await callAI(prompt);

        // Check if we got an empty response
        if (!fullResponse || fullResponse.trim() === '') {
          console.log(`Attempt ${attempt}: Empty response from AI`);
          if (attempt === MAX_RETRIES) {
            throw new Error('Failed to generate template after 3 attempts. The AI returned empty responses. Please try again.');
          }
          continue;
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

        console.log(`Attempt ${attempt}: Cleaned text:`, cleanedText.substring(0, 200));

        // If still no valid JSON, try again
        if (!cleanedText || cleanedText.length < 10) {
          console.log(`Attempt ${attempt}: No valid JSON found`);
          if (attempt === MAX_RETRIES) {
            throw new Error('Failed to generate template after 3 attempts. The AI did not return valid JSON. Please try again.');
          }
          continue;
        }

        try {
          const parsedResult = JSON.parse(cleanedText);
          console.log(`Attempt ${attempt}: Successfully parsed JSON`);

          // Validate template structure
          if (!parsedResult.template || !parsedResult.template.sections) {
            console.log(`Attempt ${attempt}: Invalid template structure`);
            if (attempt === MAX_RETRIES) {
              throw new Error('Failed to generate template after 3 attempts. Invalid template structure. Please try again.');
            }
            continue;
          }

          return Response.json(parsedResult);
        } catch (parseError) {
          console.error(`Attempt ${attempt}: JSON parse error:`, parseError);
          console.error('Raw response:', fullResponse);
          console.error('Cleaned text that failed to parse:', cleanedText);

          if (attempt === MAX_RETRIES) {
            throw new Error('Failed to generate template after 3 attempts. The AI response could not be parsed as valid JSON. Please try again.');
          }
          continue;
        }
      } catch (error) {
        console.error(`Attempt ${attempt}: Error generating template:`, error);

        if (attempt === MAX_RETRIES) {
          // If it's already our custom error message, re-throw it
          if (error instanceof Error && error.message.includes('Failed to generate template after 3 attempts')) {
            throw error;
          }
          // Otherwise, throw a generic error
          throw new Error('Failed to generate template after 3 attempts due to technical issues. Please try again.');
        }
        continue;
      }
    }

    // This should never be reached, but just in case
    throw new Error('Failed to generate template after 3 attempts. Please try again.');
  } catch (error) {
    console.error('Error in template generation:', error);
    return Response.json(
      { error: error.message || 'Failed to generate template' },
      { status: 500 }
    );
  }
}
