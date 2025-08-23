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

  const config = {};
  const model = 'gemini-2.5-flash-lite';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `You are a JSON template editor AI. You need to modify the entire JSON template structure based on user requests.

User Request: "${prompt}"

Current Template JSON:
${JSON.stringify(currentTemplate, null, 2)}

Your task is to modify this JSON template to fulfill the user's request. You can:
1. Change styleVariables (colors, fonts, spacing)
2. Modify component structure (add/remove sections, change layouts)
3. Update metadata (name, description, tags)
4. Change CSS classes in component props
5. Add new sections or remove existing ones

Respond ONLY with valid JSON in this exact format:

{
  "hasChanges": true/false,
  "explanation": "Brief explanation of what was changed",
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

Examples of what you can do:
- Color changes: Update styleVariables.primaryColor, secondaryColor, etc.
- Dark theme: Update backgroundColor to dark, textColor to light
- Layout changes: Modify component structure, add/remove sections
- Font changes: Update fontFamily in styleVariables
- Add sections: Add new components to the component.children array
- Remove sections: Remove components from component.children array
- Change styling: Update className properties in component props

Important:
- Only include the properties you're actually changing
- If you're not changing styleVariables, don't include it
- If you're not changing component structure, don't include it
- Keep explanations brief and user-friendly
- Ensure all JSON is valid and properly formatted`,
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
        ...currentTemplate.styleVariables,
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
        ...currentTemplate.styleVariables,
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
        ...currentTemplate.styleVariables,
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
        ...currentTemplate.styleVariables,
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
        ...currentTemplate.styleVariables,
        backgroundColor: '#1f2937',
        textColor: '#f9fafb',
        primaryColor: '#3b82f6'
      }
    };
  } else if (lower.includes('serif')) {
    modifications = {
      hasChanges: true,
      explanation: "Changed typography to serif fonts for a classic look.",
      styleVariables: {
        ...currentTemplate.styleVariables,
        fontFamily: 'Georgia, serif',
        headingFont: 'Georgia, serif'
      }
    };
  } else if (lower.includes('modern') || lower.includes('sans')) {
    modifications = {
      hasChanges: true,
      explanation: "Updated to modern sans-serif fonts.",
      styleVariables: {
        ...currentTemplate.styleVariables,
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
          ...currentTemplate.styleVariables,
          spacing: '2rem'
        }
      };
    } else if (lower.includes('less') || lower.includes('compact')) {
      modifications = {
        hasChanges: true,
        explanation: "Reduced spacing for a more compact layout.",
        styleVariables: {
          ...currentTemplate.styleVariables,
          spacing: '1rem'
        }
      };
    }
  }
  
  // Add testimonials section
  else if (lower.includes('testimonial') || lower.includes('review')) {
    const updatedComponent = JSON.parse(JSON.stringify(currentTemplate.component));
    
    // Find container and add testimonials section
    const container = findContainerInComponent(updatedComponent);
    if (container && container.children) {
      const testimonialsSection = {
        id: 'testimonials-section',
        type: 'div',
        sectionType: 'testimonials',
        editable: {
          moveable: true,
          removeable: true,
          duplicatable: false,
          styleEditable: true,
          contentEditable: true
        },
        editingMeta: {
          name: 'Testimonials',
          description: 'Customer reviews and testimonials',
          icon: 'quote',
          category: 'social'
        },
        props: {
          className: 'bg-gray-50 py-12 px-4'
        },
        children: [
          {
            id: 'testimonials-title',
            type: 'h2',
            props: {
              className: 'text-2xl font-bold text-center mb-8'
            },
            children: ['What Our Customers Say']
          },
          {
            id: 'testimonials-grid',
            type: 'div',
            props: {
              className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'
            },
            children: [
              {
                id: 'testimonial-1',
                type: 'div',
                props: {
                  className: 'bg-white p-6 rounded-lg shadow-sm'
                },
                children: [
                  {
                    id: 'testimonial-1-text',
                    type: 'p',
                    props: { className: 'text-gray-600 mb-4' },
                    children: ['"This product exceeded my expectations. Highly recommended!"']
                  },
                  {
                    id: 'testimonial-1-author',
                    type: 'p',
                    props: { className: 'font-semibold text-gray-900' },
                    children: ['- Sarah Johnson']
                  }
                ]
              }
            ]
          }
        ]
      };

      // Insert before the last element (usually CTA)
      const insertIndex = container.children.length - 1;
      container.children.splice(insertIndex, 0, testimonialsSection);
    }

    modifications = {
      hasChanges: true,
      explanation: "Added a testimonials section with customer reviews.",
      component: updatedComponent,
      metadata: {
        ...currentTemplate.metadata,
        sections: [...(currentTemplate.metadata?.sections || []), 'testimonials']
      }
    };
  }
  
  // Default response
  else {
    modifications = {
      hasChanges: false,
      explanation: `I can help you modify your template. Try asking me to:

• Change colors: "make it blue", "dark theme", "green colors"
• Adjust fonts: "serif fonts", "modern typography"  
• Modify spacing: "more spacing", "compact layout"
• Add sections: "add testimonials", "add contact form"

What would you like to change?`
    };
  }

  return modifications;
}

function findContainerInComponent(component: any): any {
  if (component.id === 'container') {
    return component;
  }
  
  if (component.children && Array.isArray(component.children)) {
    for (const child of component.children) {
      if (typeof child === 'object' && child !== null) {
        const found = findContainerInComponent(child);
        if (found) return found;
      }
    }
  }
  
  return null;
}