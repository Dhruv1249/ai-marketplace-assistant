import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

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
          text: `You are an advanced template modification AI with comprehensive feature support. Transform templates based on user requests with full creative freedom.

User Request: "${prompt}"

Current Template:
${JSON.stringify(currentTemplate, null, 2)}

User's Actual Content:
${JSON.stringify(actualContent, null, 2)}

User's Images:
${JSON.stringify(actualImages, null, 2)}

🚀 COMPREHENSIVE FEATURE SUPPORT:

📊 STATE MANAGEMENT:
- Use "if": "state.componentId_active" for conditional rendering
- Access state with {{state.buttonName_active}} in template strings
- Buttons with onClick: "handleToggle" automatically manage state
- Dynamic styling based on state: {{state.active ? 'bg-green-500' : 'bg-gray-500'}}

📝 FORM HANDLING:
- Form elements with name="fieldName" automatically bind to formData
- Access form data with {{formData.fieldName}} 
- Forms with onSubmit automatically validate and show success states
- Error handling and validation built-in
- Real-time form data display: {{formData.name || 'Enter name'}}

🎭 ANIMATIONS & EFFECTS:
- Tailwind animations: animate-pulse, animate-bounce, animate-spin
- Custom animations: animate-fadeInUp, animate-fadeInLeft, animate-fadeInRight, animate-slideIn, animate-glow
- Hover effects: hover:scale-105, hover:rotate-1, hover:-translate-y-1
- Transitions: transition-all duration-300, transition-colors duration-200
- Transform effects: transform hover:scale-110

🎨 STYLING SYSTEM:
- Full Tailwind CSS support: bg-blue-500, text-white, p-4, m-2, etc.
- Gradients: bg-gradient-to-r from-blue-500 to-purple-600
- Shadows: shadow-lg, shadow-xl, shadow-blue-500/50 (colored shadows)
- Backdrop effects: backdrop-blur-sm, backdrop-filter
- Custom colors via styleVariables: {"primaryColor": "#8b5cf6"}
- Responsive design: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

🧠 TEMPLATE EXPRESSIONS:
- Content access: {{content.title}}, {{content.description}}
- Image access: {{images[0]}}, {{images[1]}}
- State access: {{state.componentId_active}}
- Form data: {{formData.fieldName}}
- Conditionals: {{state.active ? '🟢 ON' : '🔴 OFF'}}
- Fallbacks: {{formData.name || 'Enter name above'}}

🎪 INTERACTIVE FEATURES:
- onClick: "handleToggle" - toggles component state
- onClick: "handleClick" - handles click events
- Conditional rendering with "if": "state.condition"
- Dynamic styling based on state
- Form validation and error display
- Hover animations and effects

📱 LAYOUT & COMPONENTS:
- Responsive grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Flexbox layouts: flex, justify-between, items-center
- Custom components: ImageGallery for image sections
- Table structures: table, tbody, tr, td (auto-detects context)
- Proper HTML nesting (no hydration errors)
- Card layouts with hover effects

🎯 ADVANCED FEATURES:
- Dynamic content generation: {{content.features.map}} for feature lists
- Specifications tables: {{content.specifications.entries}}
- Gallery integration: automatic image gallery rendering
- Text editing in edit mode (contentEditable support)
- Event handling with proper propagation

⚡ SYNTAX EXAMPLES:

Interactive Button with State:
{
  "id": "toggle-button",
  "type": "button",
  "props": {
    "className": "px-4 py-2 bg-blue-500 hover:bg-blue-600 hover:scale-105 text-white rounded-lg transition-all duration-200 transform",
    "onClick": "handleToggle"
  },
  "children": ["Toggle State"]
}

Conditional Content:
{
  "id": "conditional-message",
  "type": "div",
  "if": "state.toggle-button_active",
  "props": {
    "className": "p-4 bg-green-100 border border-green-500 rounded-lg animate-fadeInUp"
  },
  "children": ["✅ State is active! Conditional rendering works!"]
}

Form with Real-time Display:
{
  "id": "name-input",
  "type": "input",
  "props": {
    "type": "text",
    "name": "name",
    "placeholder": "Enter your name",
    "className": "w-full px-3 py-2 border rounded-lg focus:border-blue-500 hover:border-gray-400 transition-colors"
  }
},
{
  "id": "live-display",
  "type": "p",
  "props": {
    "className": "text-gray-600"
  },
  "children": ["Hello {{formData.name || 'Anonymous'}}!"]
}

Animated Hover Card:
{
  "id": "feature-card",
  "type": "div",
  "props": {
    "className": "p-6 bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer"
  },
  "children": [
    {
      "id": "card-title",
      "type": "h3",
      "props": {
        "className": "text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
      },
      "children": ["Hover Me!"]
    }
  ]
}

🎨 CREATIVE THEMES YOU CAN IMPLEMENT:

Sci-fi Theme:
- Colors: {"primaryColor": "#06b6d4", "backgroundColor": "#0f172a", "accentColor": "#64ffda"}
- Effects: Neon glows, dark backgrounds, futuristic fonts
- Animations: Glow effects, pulse animations
- Styling: backdrop-blur, shadow-cyan-500/50, animate-glow

Elegant Theme:
- Colors: {"primaryColor": "#d97706", "backgroundColor": "#fefbf3", "accentColor": "#f59e0b"}
- Effects: Gold accents, serif fonts, subtle shadows
- Animations: Smooth transitions, gentle hover effects
- Styling: shadow-amber-500/30, font-serif, tracking-wide

Modern Minimal:
- Colors: {"primaryColor": "#3b82f6", "backgroundColor": "#ffffff", "accentColor": "#6b7280"}
- Effects: Clean lines, subtle shadows, lots of whitespace
- Animations: Scale effects, smooth transitions
- Styling: shadow-lg, rounded-xl, space-y-8

Playful Theme:
- Colors: {"primaryColor": "#ec4899", "backgroundColor": "#fdf2f8", "accentColor": "#f472b6"}
- Effects: Bright colors, rounded corners, fun animations
- Animations: Bounce, spin, scale effects
- Styling: animate-bounce, rounded-full, bg-gradient-to-r

🔧 TECHNICAL RULES:
1. Keep template expressions simple: {{content.title}}, {{state.active}}, {{formData.name}}
2. Use proper HTML structure (no <div> in <tbody>)
3. Use Tailwind classes in className props
4. Use hex values in styleVariables: {"primaryColor": "#8b5cf6"}
5. Add animations with animate-* classes and hover: prefixes
6. Include transition classes for smooth effects
7. Use conditional rendering with "if" property
8. Make buttons interactive with onClick: "handleToggle"

RESPONSE FORMAT:
{
  "hasChanges": true/false,
  "explanation": "Detailed explanation of creative changes and features used",
  "styleVariables": {
    "primaryColor": "#8b5cf6",
    "backgroundColor": "#111827",
    "fontFamily": "'Inter', sans-serif"
  },
  "metadata": {
    "name": "Creative Theme Name",
    "description": "Theme description with features used"
  },
  "component": {
    // Use multiple features: state management, animations, forms, conditionals
    // Create rich, interactive templates with hover effects and animations
    // Include buttons with onClick: "handleToggle" for interactivity
    // Add conditional content with "if": "state.condition"
    // Use form inputs with real-time data display
  }
}

Be CREATIVE and combine multiple features for rich, interactive templates!`,
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

    // Save AI output to file for debugging
    try {
      const debugDir = path.join(process.cwd(), 'debug');
      
      // Create debug directory if it doesn't exist
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      
      const debugFile = path.join(debugDir, 'ai-template-output.json');
      const debugData = {
        timestamp: new Date().toISOString(),
        prompt: prompt,
        rawResponse: fullResponse,
        cleanedResponse: cleanedText,
        parsedResult: parsedResult
      };
      
      fs.writeFileSync(debugFile, JSON.stringify(debugData, null, 2));
      console.log('🐛 AI output saved to:', debugFile);
    } catch (saveError) {
      console.warn('Could not save debug file:', saveError);
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
      explanation: "Applied a futuristic sci-fi theme with dark backgrounds, neon accents, glowing effects, and interactive animations.",
      styleVariables: {
        primaryColor: '#06b6d4',      // cyan-500
        secondaryColor: '#8b5cf6',    // purple-500
        backgroundColor: '#0f172a',   // slate-900
        textColor: '#e2e8f0',         // slate-200
        accentColor: '#64ffda'        // cyan-300
      },
      metadata: {
        name: "Sci-Fi Interactive Theme",
        description: "Dark space theme with neon accents, animations, and interactive elements"
      }
    };
  } else if (lower.includes('elegant') || lower.includes('luxury') || lower.includes('premium')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied an elegant luxury theme with gold accents, sophisticated typography, and smooth hover animations.",
      styleVariables: {
        primaryColor: '#d97706',      // amber-600
        secondaryColor: '#92400e',    // amber-700
        backgroundColor: '#fefbf3',   // warm white
        textColor: '#1c1917',         // stone-900
        accentColor: '#f59e0b'        // amber-500
      },
      metadata: {
        name: "Elegant Luxury Theme",
        description: "Sophisticated design with gold accents, premium feel, and interactive elements"
      }
    };
  } else if (lower.includes('modern') || lower.includes('minimal') || lower.includes('clean')) {
    modifications = {
      hasChanges: true,
      explanation: "Applied a modern minimal theme with clean lines, subtle effects, and interactive hover animations.",
      styleVariables: {
        primaryColor: '#3b82f6',      // blue-500
        secondaryColor: '#1e40af',    // blue-800
        backgroundColor: '#ffffff',   // white
        textColor: '#111827',         // gray-900
        accentColor: '#6b7280'        // gray-500
      },
      metadata: {
        name: "Modern Interactive Theme",
        description: "Clean minimal design with subtle blue accents and smooth animations"
      }
    };
  } else {
    modifications = {
      hasChanges: false,
      explanation: `I can create amazing interactive themes with animations, state management, and forms! Try asking for:

🚀 INTERACTIVE THEMES:
• "sci-fi theme" - Dark theme with neon effects, animations, and interactive buttons
• "elegant design" - Luxury theme with gold accents and smooth hover effects
• "modern minimal" - Clean design with subtle animations and interactions
• "playful style" - Bright colors with bounce animations and fun interactions

🎪 INTERACTIVE FEATURES I CAN ADD:
• Toggle buttons that change state and show/hide content
• Forms with real-time data display and validation
• Hover animations (scale, rotate, glow effects)
• Conditional content that appears based on user actions
• Animated cards and interactive elements

🎭 ANIMATION EFFECTS:
• Pulse, bounce, spin animations
• Hover scale and transform effects
• Fade-in animations for new content
• Smooth color transitions

What creative interactive theme would you like?`
    };
  }

  return modifications;
}