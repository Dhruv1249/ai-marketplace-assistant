import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { adminStorage } from '@/app/login/firebase-admin';
import crypto from 'crypto';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const photos = formData.getAll('photos');
    const productName = formData.get('productName') || 'Product';
    const productCategory = formData.get('productCategory') || 'General';
    const userPrompt = formData.get('userPrompt') || '';

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'At least one photo is required' },
        { status: 400 }
      );
    }

    if (photos.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 photos allowed' },
        { status: 400 }
      );
    }

    // Step 1: Convert photos to base64 and upload to Firebase
    console.log('📤 Processing and uploading photos to Firebase Storage...');
    const photoDataList = [];
    const firebaseUrls = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        // Convert to buffer
        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = photo.type || 'image/jpeg';
        
        // Add to Gemini data list
        photoDataList.push({
          inlineData: {
            data: base64,
            mimeType: mimeType
          }
        });

        // Upload to Firebase
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        const fileName = `ai-photos/${Date.now()}_${hash}_${photo.name}`;
        const fileRef = adminStorage.bucket().file(fileName);

        await fileRef.save(buffer, {
          metadata: {
            contentType: mimeType,
            metadata: {
              uploadedAt: new Date().toISOString(),
              originalName: photo.name
            }
          }
        });

        const [signedUrl] = await fileRef.getSignedUrl({
          action: 'read',
          expires: Date.now() + 365 * 24 * 60 * 60 * 1000
        });

        firebaseUrls.push(signedUrl);
        console.log(`✅ Processed and uploaded photo ${i + 1}: ${photo.name}`);
      } catch (error) {
        console.error(`❌ Failed to process photo ${i + 1}:`, error);
        throw new Error(`Failed to process photo ${i + 1}: ${error.message}`);
      }
    }

    console.log(`✅ All ${firebaseUrls.length} photos uploaded to Firebase`);

    // Step 2: Build prompt for Gemini to generate ENTIRE template JSON
    const templatePrompt = `You are an expert web designer and product storyteller. Analyze these ${photos.length} product photos and generate a COMPLETE, PRODUCTION-READY template JSON for a product story page.

Product Name: ${productName}
Category: ${productCategory}
User's Page Description: ${userPrompt}
Firebase Photo URLs: ${firebaseUrls.join(', ')}

Generate a COMPLETE template JSON that follows this structure. The template should be creative, unique, and tailored to the product shown in the photos:

{🚀 ENHANCED JSON MODEL RENDERER CAPABILITIES:

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

Be CREATIVE and leverage the full power of the Enhanced JSON Model Renderer!

Be creative, be bold, make it compelling. Return ONLY valid JSON.`;

    const contentResponse = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            ...photoDataList,
            {
              text: contentPrompt
            }
          ]
        }
      ]
    });

    let contentText = contentResponse.text || '';
    let contentCleanedText = contentText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '')
      .trim();

    let productStoryData;
    try {
      productStoryData = JSON.parse(contentCleanedText);
    } catch (e) {
      console.warn('Failed to parse content data, using minimal defaults');
      productStoryData = {
        name: productName,
        category: productCategory,
        description: userPrompt
      };
    }

    console.log('✅ Content data generated successfully');
    console.log('Generated content keys:', Object.keys(productStoryData));
    return NextResponse.json({
      success: true,
      templateJSON: templateJSON,
      productStoryData: productStoryData,
      photoCount: photos.length,
      firebaseUrls: firebaseUrls,
      message: 'Complete product template generated successfully from photos'
    });

  } catch (error) {
    console.error('Error generating template from photos:', error);
    return NextResponse.json(
      { error: 'Failed to generate template from photos: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to generate template from photos' },
    { status: 405 }
  );
}
