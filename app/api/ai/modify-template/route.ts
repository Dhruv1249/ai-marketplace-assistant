import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

const ModifyTemplateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  templateData: z.object({
    model: z.object({
      metadata: z.object({
        template: z.string().optional(),
        name: z.string().optional(),
      }).optional(),
      styleVariables: z.record(z.any()).optional(),
      component: z.any().optional(),
    }),
    content: z.any().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Modify template request:', body);

    const validatedData = ModifyTemplateRequestSchema.parse(body);
    const { prompt, templateData } = validatedData;

    // Generate template modifications using Gemini AI
    const modifications = await generateTemplateModifications(prompt, templateData);

    return NextResponse.json({
      success: true,
      modifications,
      explanation: modifications.explanation,
      hasChanges: modifications.hasChanges,
    });

  } catch (error) {
    console.error('Error in modify-template API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to modify template', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generateTemplateModifications(prompt: string, templateData: any) {
  const currentTemplate = templateData.model;
  const templateType = currentTemplate?.metadata?.template || 'unknown';
  const actualContent = templateData.content || {};
  const actualImages = templateData.images || [];

  const config = {};
  const model = 'gemini-2.5-flash-lite';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `You are a template modification AI. Modify the template based on the user's request.

User Request: "${prompt}"

Current Template:
${JSON.stringify(currentTemplate, null, 2)}

User's Actual Content:
${JSON.stringify(actualContent, null, 2)}

User's Images:
${JSON.stringify(actualImages, null, 2)}

You can modify:
1. styleVariables - colors, fonts, spacing, themes
2. component structure - add/remove sections, change layouts
3. metadata - template info

Respond with valid JSON:

{
  "hasChanges": true/false,
  "explanation": "What you changed",
  "styleVariables": {
    // Updated style variables if needed
  },
  "metadata": {
    // Updated metadata if needed  
  },
  "component": {
    // Updated component structure if needed
  }
}

Examples:
- "make it blue" → update styleVariables.primaryColor
- "dark theme" → update backgroundColor, textColor
- "serif fonts" → update fontFamily
- "add testimonials" → add testimonials section to component
- "larger text" → update fontSize in styleVariables`,
        },
      ],
    },
  ];

  try {
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

    // Clean and parse the response
    let cleanedText = fullResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Extract JSON object
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const parsedResult = JSON.parse(cleanedText);
    
    // Validate the result
    if (typeof parsedResult.hasChanges !== 'boolean') {
      throw new Error('Invalid response format');
    }

    return parsedResult;

  } catch (error) {
    console.error('Error generating template modifications:', error);
    
    // Fallback to rule-based modifications
    return generateFallbackModifications(prompt, currentTemplate);
  }
}

function generateFallbackModifications(prompt: string, currentTemplate: any) {
  const lower = prompt.toLowerCase();
  let modifications: any = { hasChanges: false, explanation: '' };

  // Color modifications
  if (lower.includes('blue')) {
    modifications = {
      hasChanges: true,
      explanation: "Updated the color scheme to use blue tones.",
      styleVariables: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#60a5fa'
      }
    };
  } else if (lower.includes('green')) {
    modifications = {
      hasChanges: true,
      explanation: "Changed the color palette to green.",
      styleVariables: {
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        accentColor: '#34d399'
      }
    };
  } else if (lower.includes('red')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied a red color scheme.",
      styleVariables: {
        primaryColor: '#ef4444',
        secondaryColor: '#dc2626',
        accentColor: '#f87171'
      }
    };
  } else if (lower.includes('purple')) {
    modifications = {
      hasChanges: true,
      explanation: "Changed to a purple color theme.",
      styleVariables: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#7c3aed',
        accentColor: '#a78bfa'
      }
    };
  } else if (lower.includes('dark')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied a dark theme with light text.",
      styleVariables: {
        backgroundColor: '#1f2937',
        textColor: '#f9fafb',
        primaryColor: '#3b82f6'
      }
    };
  } else if (lower.includes('light')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied a light theme.",
      styleVariables: {
        backgroundColor: '#ffffff',
        textColor: '#111827'
      }
    };
  } else if (lower.includes('serif')) {
    modifications = {
      hasChanges: true,
      explanation: "Changed typography to serif fonts for a classic look.",
      styleVariables: {
        fontFamily: 'Georgia, serif',
        headingFont: 'Georgia, serif'
      }
    };
  } else if (lower.includes('modern') || lower.includes('sans')) {
    modifications = {
      hasChanges: true,
      explanation: "Updated to modern sans-serif fonts.",
      styleVariables: {
        fontFamily: 'Inter, sans-serif',
        headingFont: 'Inter, sans-serif'
      }
    };
  } else if (lower.includes('spacing')) {
    if (lower.includes('more') || lower.includes('increase')) {
      modifications = {
        hasChanges: true,
        explanation: "Increased spacing for a more open design.",
        styleVariables: {
          spacing: '2rem'
        }
      };
    } else if (lower.includes('less') || lower.includes('compact')) {
      modifications = {
        hasChanges: true,
        explanation: "Reduced spacing for a more compact layout.",
        styleVariables: {
          spacing: '1rem'
        }
      };
    }
  } else if (lower.includes('larger') || lower.includes('bigger')) {
    modifications = {
      hasChanges: true,
      explanation: "Increased text size for better readability.",
      styleVariables: {
        fontSize: '1.1rem',
        headingSize: '2.5rem'
      }
    };
  } else if (lower.includes('smaller')) {
    modifications = {
      hasChanges: true,
      explanation: "Reduced text size for a more compact look.",
      styleVariables: {
        fontSize: '0.9rem',
        headingSize: '1.8rem'
      }
    };
  } else {
    modifications = {
      hasChanges: false,
      explanation: `I can help you modify your template. Try asking me to:

• Change colors: "make it blue", "dark theme", "green colors"
• Adjust fonts: "serif fonts", "modern typography"  
• Modify spacing: "more spacing", "compact layout"
• Change text size: "larger text", "smaller text"

What would you like to change?`
    };
  }

  return modifications;
}