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
          text: `You are a creative template modification AI. Transform templates based on user requests with full creative freedom.

User Request: "${prompt}"

Current Template:
${JSON.stringify(currentTemplate, null, 2)}

User's Actual Content:
${JSON.stringify(actualContent, null, 2)}

User's Images:
${JSON.stringify(actualImages, null, 2)}

CREATIVE FREEDOM RULES:
1. Use standard Tailwind CSS classes for styling (bg-blue-500, text-white, etc.)
2. You can add animations, effects, gradients, shadows
3. You can restructure layouts, add sections, modify components
4. You can add background effects, overlays, decorative elements
5. Be creative with themes: sci-fi, modern, elegant, playful, etc.
6. Use styleVariables for hex color values: {"primaryColor": "#8b5cf6"}
7. Use className props for Tailwind classes: "bg-purple-500 text-white"

Available Tailwind features you can use:
- Gradients: bg-gradient-to-r from-blue-500 to-purple-600
- Animations: animate-pulse, animate-bounce, animate-spin
- Shadows: shadow-lg, shadow-xl, shadow-2xl, shadow-blue-500/50
- Transforms: hover:scale-105, transform, transition-all
- Backdrop effects: backdrop-blur-sm, backdrop-filter
- Borders: border-2, border-purple-500, rounded-xl
- Spacing: p-8, m-6, space-y-4, gap-8
- Typography: text-4xl, font-bold, font-serif, tracking-wide

Creative themes you can implement:
- Sci-fi: Dark backgrounds, neon colors, glowing effects
- Modern: Clean lines, subtle shadows, minimalist
- Elegant: Serif fonts, gold accents, sophisticated spacing
- Playful: Bright colors, rounded corners, fun animations
- Corporate: Professional blues, clean typography
- Nature: Green themes, organic shapes, earth tones

You can modify:
1. styleVariables - Use hex values: {"primaryColor": "#8b5cf6", "backgroundColor": "#111827"}
2. component structure - Add/remove/modify any components
3. metadata - Update template info
4. Add creative elements like backgrounds, overlays, animations

Respond with creative JSON:

{
  "hasChanges": true/false,
  "explanation": "Detailed explanation of your creative changes",
  "styleVariables": {
    "primaryColor": "#8b5cf6",     // Hex values for colors
    "backgroundColor": "#111827",   // Theme colors
    "fontFamily": "'Inter', sans-serif"  // Typography
  },
  "metadata": {
    "name": "Creative Theme Name",
    "description": "Theme description"
  },
  "component": {
    // Full creative freedom - add animations, effects, restructure
    // Use Tailwind classes in className props
  }
}

Examples of creative modifications:
- "sci-fi theme" → Dark backgrounds, neon glows, futuristic fonts, animations
- "elegant design" → Serif fonts, gold accents, subtle shadows, refined spacing
- "playful style" → Bright colors, rounded corners, bounce animations
- "modern minimal" → Clean lines, subtle effects, lots of whitespace

Be CREATIVE and INNOVATIVE! Transform the template to match the user's vision.`,
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
    
    // Fallback to creative modifications
    return generateCreativeModifications(prompt, currentTemplate);
  }
}

function generateCreativeModifications(prompt: string, currentTemplate: any) {
  const lower = prompt.toLowerCase();
  let modifications: any = { hasChanges: false, explanation: '' };

  if (lower.includes('sci-fi') || lower.includes('futuristic') || lower.includes('space')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied a futuristic sci-fi theme with dark backgrounds, neon accents, and glowing effects.",
      styleVariables: {
        primaryColor: '#60a5fa',      // blue-400
        secondaryColor: '#8b5cf6',    // purple-500
        backgroundColor: '#0f172a',   // slate-900
        textColor: '#e2e8f0',         // slate-200
        accentColor: '#06b6d4'        // cyan-500
      },
      metadata: {
        name: "Sci-Fi Futuristic Theme",
        description: "Dark space theme with neon accents and futuristic styling"
      }
    };
  } else if (lower.includes('elegant') || lower.includes('luxury') || lower.includes('premium')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied an elegant luxury theme with gold accents and sophisticated typography.",
      styleVariables: {
        primaryColor: '#d97706',      // amber-600
        secondaryColor: '#92400e',    // amber-700
        backgroundColor: '#fefbf3',   // warm white
        textColor: '#1c1917',         // stone-900
        accentColor: '#f59e0b'        // amber-500
      },
      metadata: {
        name: "Elegant Luxury Theme",
        description: "Sophisticated design with gold accents and premium feel"
      }
    };
  } else if (lower.includes('modern') || lower.includes('minimal') || lower.includes('clean')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied a modern minimal theme with clean lines and subtle effects.",
      styleVariables: {
        primaryColor: '#3b82f6',      // blue-500
        secondaryColor: '#1e40af',    // blue-800
        backgroundColor: '#ffffff',   // white
        textColor: '#111827',         // gray-900
        accentColor: '#6b7280'        // gray-500
      },
      metadata: {
        name: "Modern Minimal Theme",
        description: "Clean and minimal design with subtle blue accents"
      }
    };
  } else {
    modifications = {
      hasChanges: false,
      explanation: `I can create amazing themes for you! Try asking for:

• "sci-fi theme" - Futuristic dark theme with neon effects
• "elegant design" - Luxury theme with gold accents
• "modern minimal" - Clean and sophisticated
• "playful style" - Bright and fun with animations
• "dark theme" - Professional dark mode
• "nature theme" - Green and organic styling

What creative theme would you like?`
    };
  }

  return modifications;
}