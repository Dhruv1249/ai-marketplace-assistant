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

{
  "colors": {
    "brand-primary": "#HEX_COLOR",
    "brand-secondary": "#HEX_COLOR",
    "brand-accent": "#HEX_COLOR",
    "brand-text-primary": "#HEX_COLOR",
    "brand-text-secondary": "#HEX_COLOR",
    "brand-background": "#HEX_COLOR",
    "brand-highlight": "#HEX_COLOR"
  },
  "styleVariables": {
    "brandPrimary": "#HEX_COLOR",
    "brandSecondary": "#HEX_COLOR",
    "brandAccent": "#HEX_COLOR",
    "brandTextPrimary": "#HEX_COLOR",
    "brandTextSecondary": "#HEX_COLOR",
    "brandBackground": "#HEX_COLOR",
    "brandHighlight": "#HEX_COLOR",
    "fontFamilySerif": "'Font Name', serif",
    "fontFamilyDisplay": "'Font Name', serif"
  },
  "metadata": {
    "name": "Product Story Name",
    "description": "Brief description",
    "template": "ai-generated-story",
    "version": "1.0",
    "features": ["animations", "interactive", "gradients", "special-components"]
  },
  "animations": {
    "animationName": {
      "keyframes": {
        "0%": { "property": "value" },
        "100%": { "property": "value" }
      },
      "duration": "0.8s",
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
      "fillMode": "both"
    }
  },
  "component": {
    "id": "root",
    "type": "div",
    "props": {
      "className": "tailwind classes",
      "style": { "CSS": "properties" }
    },
    "children": [
      {
        "id": "unique-id",
        "type": "section|div|h1|p|img|button|etc",
        "props": {
          "className": "tailwind classes",
          "style": { "CSS": "properties" }
        },
        "children": ["text content or nested components"],
        "contentKey": "path.to.content.field (optional)",
        "editable": { "contentEditable": true } (optional)
      }
    ]
  }
}

REQUIREMENTS:
1. Create a UNIQUE, CREATIVE template design based on the product photos
2. Use appropriate color scheme based on product aesthetics
3. Include multiple sections: hero, story, features/process, gallery, testimonials/impact, CTA
4. Use animations (fadeInUp, slideInLeft, slideInRight, etc.)
5. Include gradient backgrounds and advanced CSS
6. Make sections responsive with grid/flex layouts
7. Use Tailwind CSS classes for styling
8. Include contentKey and editable properties for user-editable fields
9. Use the Firebase URLs provided for gallery images
10. Create compelling copy that matches the product
11. Return ONLY valid JSON, no markdown or explanations
12. Make it production-ready and visually stunning

IMPORTANT NOTES:
- Use var(--brandPrimary), var(--brandAccent), etc. for colors
- Use var(--fontFamilySerif), var(--fontFamilyDisplay) for fonts
- Create custom animations that fit the product
- Make the design responsive and modern
- Include hover effects and transitions
- Use proper semantic HTML structure
- Make it editable with contentKey properties`;

    // Step 3: Call Gemini API to generate entire template
    console.log('🤖 Calling Gemini API to generate complete template...');
    const model = 'gemini-2.0-flash';
    
    const contents = [
      {
        role: 'user',
        parts: [
          ...photoDataList,
          {
            text: templatePrompt
          }
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
    });

    let generatedText = response.text || '';
    
    // Step 4: Clean and parse JSON
    let cleanedText = generatedText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '')
      .trim();

    if (!cleanedText.startsWith('{')) {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
    }

    let templateJSON;
    try {
      templateJSON = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini template response:', parseError);
      console.error('Raw response:', generatedText);
      return NextResponse.json(
        { error: 'Failed to parse AI-generated template. Please try again.' },
        { status: 500 }
      );
    }

    // Validate template structure
    if (!templateJSON.component || !templateJSON.metadata || !templateJSON.colors) {
      console.error('Template missing required fields:', Object.keys(templateJSON));
      return NextResponse.json(
        { error: 'AI-generated template missing required fields' },
        { status: 500 }
      );
    }

    console.log('✅ Complete template generated successfully');
    console.log('Template structure:', {
      hasComponent: !!templateJSON.component,
      hasMetadata: !!templateJSON.metadata,
      hasColors: !!templateJSON.colors,
      hasAnimations: !!templateJSON.animations,
      hasStyleVariables: !!templateJSON.styleVariables
    });

    // Step 5: Generate content data - let AI go wild with whatever it wants
    const contentPrompt = `Based on these product photos and description, generate ANY content data that would be useful for this product page. Be creative and generate whatever you think would make this page amazing.

Product: ${productName}
Category: ${productCategory}
Description: ${userPrompt}
Firebase URLs: ${firebaseUrls.join(', ')}

Generate a JSON object with whatever content you think is best. You can include:
- Product information
- Stories and narratives
- Features and benefits
- Testimonials and reviews
- Statistics and metrics
- Call-to-actions
- Sections and layouts
- Anything else that would enhance this product page

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
