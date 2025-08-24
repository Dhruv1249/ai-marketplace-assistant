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

CRITICAL RULES:
1. For component className props: Use ONLY standard Tailwind CSS classes (bg-blue-500, text-white, etc.)
2. For styleVariables: Use hex color values (#3b82f6, #ffffff, etc.) - NOT Tailwind classes
3. DO NOT mix these up!

Standard Tailwind classes for component className:
- Blue: bg-blue-500, bg-blue-600, text-blue-500, text-blue-600, border-blue-500
- Purple: bg-purple-500, bg-purple-600, text-purple-400, text-purple-500, border-purple-500
- Dark: bg-gray-900, bg-black, text-white, text-gray-100, text-gray-200
- Light: bg-white, bg-gray-50, text-gray-900, text-black

Hex values for styleVariables:
- Blue: "#3b82f6" (blue-500), "#2563eb" (blue-600), "#60a5fa" (blue-400)
- Purple: "#8b5cf6" (purple-500), "#7c3aed" (purple-600), "#a78bfa" (purple-400)
- Dark: "#111827" (gray-900), "#000000" (black), "#ffffff" (white)

You can modify:
1. styleVariables - Use HEX VALUES only: {"primaryColor": "#3b82f6", "backgroundColor": "#111827"}
2. component structure - Use TAILWIND CLASSES in className props: "bg-blue-500 text-white"
3. metadata - template info

Respond with valid JSON:

{
  "hasChanges": true/false,
  "explanation": "What you changed",
  "styleVariables": {
    "primaryColor": "#8b5cf6",     // HEX VALUE for purple-500
    "backgroundColor": "#111827",   // HEX VALUE for gray-900
    "textColor": "#ffffff"         // HEX VALUE for white
  },
  "component": {
    // Component with Tailwind CLASSES in className props
    "props": {
      "className": "bg-gray-900 text-white border-purple-500"  // TAILWIND CLASSES
    }
  }
}

WRONG Examples (DON'T do this):
- styleVariables: {"primaryColor": "text-purple-400"} ❌ (Tailwind class in styleVariables)
- styleVariables: {"backgroundColor": "bg-black"} ❌ (Tailwind class in styleVariables)

CORRECT Examples:
- styleVariables: {"primaryColor": "#a78bfa"} ✅ (hex value)
- component className: "text-purple-400 bg-black" ✅ (Tailwind classes)

Remember: styleVariables = HEX VALUES, className = TAILWIND CLASSES!`,
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
    
    // Fallback to rule-based modifications with proper format
    return generateFallbackModifications(prompt, currentTemplate);
  }
}

function generateFallbackModifications(prompt: string, currentTemplate: any) {
  const lower = prompt.toLowerCase();
  let modifications: any = { hasChanges: false, explanation: '' };

  // Color modifications with proper hex values for styleVariables
  if (lower.includes('blue')) {
    modifications = {
      hasChanges: true,
      explanation: "Updated the color scheme to use blue tones.",
      styleVariables: {
        primaryColor: '#3b82f6',    // blue-500
        secondaryColor: '#2563eb',  // blue-600
        accentColor: '#60a5fa'      // blue-400
      }
    };
  } else if (lower.includes('purple')) {
    modifications = {
      hasChanges: true,
      explanation: "Changed to a purple color theme.",
      styleVariables: {
        primaryColor: '#8b5cf6',    // purple-500
        secondaryColor: '#7c3aed',  // purple-600
        accentColor: '#a78bfa'      // purple-400
      }
    };
  } else if (lower.includes('dark')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied a dark theme.",
      styleVariables: {
        backgroundColor: '#111827',  // gray-900
        textColor: '#ffffff',       // white
        primaryColor: '#8b5cf6'     // purple-500
      }
    };
  } else if (lower.includes('light')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied a light theme.",
      styleVariables: {
        backgroundColor: '#ffffff',  // white
        textColor: '#111827'        // gray-900
      }
    };
  } else {
    modifications = {
      hasChanges: false,
      explanation: `I can help you modify your template. Try asking me to:

• Change colors: "make it blue", "purple theme", "dark theme"
• Adjust fonts: "serif fonts", "modern typography"  
• Modify spacing: "more spacing", "compact layout"
• Change text size: "larger text", "smaller text"

What would you like to change?`
    };
  }

  return modifications;
}