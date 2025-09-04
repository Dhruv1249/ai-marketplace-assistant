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
          text: `You are an advanced JSON template modification AI with comprehensive feature support based on the Enhanced JSON Model Renderer. Transform templates based on user requests with full creative freedom.

User Request: "${prompt}"

Current Template (with actual user data filled in):
${JSON.stringify(currentTemplate, null, 2)}

User's Actual Content:
${JSON.stringify(actualContent, null, 2)}

User's Images:
${JSON.stringify(actualImages, null, 2)}

🚀 ENHANCED JSON MODEL RENDERER CAPABILITIES:

📋 BASIC STRUCTURE:
Every template must follow this structure:
{
  "metadata": {
    "name": "Template Name",
    "description": "Template description", 
    "template": "template-type",
    "version": "1.0",
    "features": ["feature1", "feature2"]
  },
  "styleVariables": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "backgroundColor": "#ffffff",
    "textColor": "#111827",
    "accentColor": "#60a5fa",
    "gradientStart": "#3b82f6",
    "gradientEnd": "#1d4ed8",
    "fontFamily": "'Inter', sans-serif",
    "borderRadius": "8px",
    "shadowColor": "rgba(0, 0, 0, 0.1)"
  },
  "animations": {
    "fadeInUp": {
      "keyframes": {
        "0%": { "opacity": "0", "transform": "translateY(30px)" },
        "100%": { "opacity": "1", "transform": "translateY(0)" }
      },
      "duration": "0.8s",
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  },
  "component": { /* component tree */ }
}

🎨 STYLE VARIABLES & CUSTOM ANIMATIONS:
- Define CSS custom properties in styleVariables
- Create custom animations with keyframes, duration, easing
- Use animations with animate-{animationName} classes
- Support for complex animations: float, rotate, pulse, twinkle

🧩 COMPONENT TYPES:
- All HTML elements: div, section, h1-h6, p, span, a, img, button, input, form, etc.
- Special components: BeforeAfterSlider
- Properties: id, type, props, children, editable, if, unless, show

🔄 DYNAMIC CONTENT & TEMPLATES:
Template expressions with double curly braces:
- Basic: {{content.name}}
- Fallback: {{content.name || 'Default Name'}}
- Ternary: {{content.isActive ? 'Active' : 'Inactive'}}
- String methods: {{content.name.charAt(0).toUpperCase()}}
- Array access: {{content.photos[0].url}}
- Complex: {{(content.firstName || content.name) + ' - ' + content.title}}

Content paths available:
- content.basics.name, content.basics.category, content.basics.value
- content.story.origin, content.story.solution, content.story.unique
- content.process.creation, content.process.materials, content.process.time
- content.impact.metrics, content.impact.testimonials
- content.contact.email, content.contact.phone
- images[0], images[1], images[2], images[3]
- state.componentActive, formData.email

⚡ CONDITIONAL RENDERING:
- "if": "content.showSection" - shows only if true
- "unless": "content.hideSection" - shows only if false  
- "show": "content.isVisible && content.hasData" - complex visibility logic

🎮 INTERACTIVE COMPONENTS:
Event handlers:
- "onClick": "{handleClick}"
- "onSubmit": "{handleFormSubmit}"
- "onChange": "{handleInputChange}"
- "onToggle": "{handleToggle}"

State management:
- Components maintain state through renderer
- Access with {{state.menuOpen ? 'menu-open' : 'menu-closed'}}

✨ PARTICLES & EFFECTS:
Create particle systems with positioned divs:
{
  "id": "hero-particles",
  "type": "div", 
  "props": {
    "className": "absolute inset-0 opacity-30"
  },
  "children": [
    {
      "id": "particle-1",
      "type": "div",
      "props": {
        "className": "absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"
      }
    }
  ]
}

Built-in animation classes:
- animate-float, animate-pulse-slow, animate-bounce-slow
- hover-lift, hover-scale
- fade-in-up, slide-in-left, scale-in

🖼️ GALLERY COMPONENTS:
Special gallery tokens that auto-generate image galleries:
- "children": "HERO_GALLERY" - Hero image gallery
- "children": "PROCESS_GALLERY" - Process step gallery  
- "children": "BEFORE_AFTER_GALLERY" - Before/after sliders
- "children": "LIFESTYLE_GALLERY" - Lifestyle images
- "children": "SPECIALTIES_ARRAY" - Specialty items
- "children": "ACHIEVEMENTS_ARRAY" - Achievement items
- "children": "TESTIMONIALS_ARRAY" - Testimonial cards
- "children": "METRICS_ARRAY" - Metric cards

📝 FORM HANDLING:
The renderer automatically handles:
- Email validation, required field validation
- Error display, form state management
- Real-time form data binding

Example form:
{
  "id": "contact-form",
  "type": "form",
  "props": {
    "className": "space-y-4",
    "onSubmit": "{handleFormSubmit}"
  },
  "children": [
    {
      "id": "name-input",
      "type": "input",
      "props": {
        "type": "text",
        "name": "name", 
        "placeholder": "Your Name",
        "className": "w-full px-4 py-2 border rounded-lg",
        "onChange": "{handleInputChange}"
      }
    }
  ]
}

🎯 BEST PRACTICES:
1. Use semantic HTML elements
2. Apply responsive design: text-sm md:text-base lg:text-lg
3. Include accessibility: alt attributes, proper labels
4. Use consistent naming conventions
5. Group related components logically

🎨 ADVANCED STYLING:
- Full Tailwind CSS support
- Gradients: bg-gradient-to-r from-blue-500 to-purple-600
- Shadows: shadow-lg, shadow-xl, shadow-blue-500/50
- Backdrop effects: backdrop-blur-sm
- Responsive: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Hover effects: hover:scale-105, hover:rotate-1
- Transitions: transition-all duration-300

🚀 CREATIVE THEMES:

Sci-fi Theme:
- Colors: {"primaryColor": "#06b6d4", "backgroundColor": "#0f172a", "accentColor": "#64ffda"}
- Effects: Neon glows, dark backgrounds, particles
- Animations: Glow, pulse, twinkle effects
- Classes: backdrop-blur, shadow-cyan-500/50

Elegant Theme:  
- Colors: {"primaryColor": "#d97706", "backgroundColor": "#fefbf3", "accentColor": "#f59e0b"}
- Effects: Gold accents, serif fonts, subtle shadows
- Animations: Smooth transitions, gentle hover
- Classes: shadow-amber-500/30, font-serif

Modern Minimal:
- Colors: {"primaryColor": "#3b82f6", "backgroundColor": "#ffffff", "accentColor": "#6b7280"}  
- Effects: Clean lines, subtle shadows, whitespace
- Animations: Scale effects, smooth transitions
- Classes: shadow-lg, rounded-xl, space-y-8

🔧 TECHNICAL REQUIREMENTS:
1. Always include unique "id" for each component
2. Use proper HTML structure (no div in tbody)
3. Use Tailwind classes in className props
4. Use hex values in styleVariables
5. Include animations with animate-* classes
6. Add transition classes for smooth effects
7. Use conditional rendering with "if" property
8. Make interactive elements with event handlers

RESPONSE FORMAT:
{
  "hasChanges": true/false,
  "explanation": "Detailed explanation of changes and features used",
  "styleVariables": {
    "primaryColor": "#8b5cf6",
    "backgroundColor": "#111827", 
    "fontFamily": "'Inter', sans-serif"
  },
  "metadata": {
    "name": "Creative Theme Name",
    "description": "Theme description with features"
  },
  "component": {
    // Rich interactive template using multiple renderer features
    // Include particles, animations, galleries, forms, conditionals
    // Use actual user content and images from the provided data
    // Create engaging, responsive, accessible designs
  }
}

Be CREATIVE and leverage the full power of the Enhanced JSON Model Renderer!`,
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