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

    // Step 1: Upload photos to Firebase
    console.log('📤 Processing and uploading photos to Firebase Storage...');
    const photoDataList = [];
    const firebaseUrls = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = photo.type || 'image/jpeg';
        
        photoDataList.push({
          inlineData: {
            data: base64,
            mimeType: mimeType
          }
        });

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
        console.log(`✅ Uploaded photo ${i + 1}: ${photo.name}`);
      } catch (error) {
        console.error(`❌ Failed to process photo ${i + 1}:`, error);
        throw new Error(`Failed to process photo ${i + 1}: ${error.message}`);
      }
    }

    console.log(`✅ All ${firebaseUrls.length} photos uploaded to Firebase`);

    // Step 2: Generate template with simpler, more reliable prompt
    const prompt = `Generate a complete product page template JSON. Make it LARGE with 8+ sections.

CRITICAL: Return ONLY valid JSON. No markdown, no errors, no extra text.

Use this exact structure:
{
  "metadata": {
    "name": "Product Page",
    "description": "A product showcase page",
    "template": "product-page",
    "version": "1.0",
    "features": ["hero", "features", "gallery", "testimonials", "cta"]
  },
  "styleVariables": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "backgroundColor": "#ffffff",
    "textColor": "#111827",
    "accentColor": "#60a5fa",
    "fontFamily": "'Inter', sans-serif",
    "borderRadius": "8px"
  },
  "animations": {
    "fadeInUp": {
      "keyframes": {"0%": {"opacity": "0"}, "100%": {"opacity": "1"}},
      "duration": "0.8s",
      "easing": "ease-out"
    }
  },
  "component": {
    "id": "root",
    "type": "div",
    "props": {"className": "min-h-screen bg-white"},
    "children": [
      {
        "id": "hero",
        "type": "section",
        "props": {"className": "py-20 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white"},
        "children": [
          {"id": "hero-title", "type": "h1", "props": {"className": "text-5xl font-bold mb-4"}, "children": ["${productName}"]},
          {"id": "hero-desc", "type": "p", "props": {"className": "text-xl mb-8"}, "children": ["${userPrompt}"]},
          {"id": "hero-btn", "type": "button", "props": {"className": "px-8 py-3 bg-white text-blue-600 font-bold rounded hover:bg-gray-100"}, "children": ["Explore Now"]}
        ]
      },
      {
        "id": "features",
        "type": "section",
        "props": {"className": "py-20 px-4"},
        "children": [
          {"id": "features-title", "type": "h2", "props": {"className": "text-4xl font-bold mb-12 text-center"}, "children": ["Key Features"]},
          {"id": "features-grid", "type": "div", "props": {"className": "grid grid-cols-1 md:grid-cols-3 gap-8"}, "children": [
            {"id": "feature-1", "type": "div", "props": {"className": "p-6 bg-gray-50 rounded-lg"}, "children": [{"id": "f1-title", "type": "h3", "props": {"className": "text-xl font-bold mb-2"}, "children": ["Feature 1"]}, {"id": "f1-desc", "type": "p", "props": {"className": "text-gray-600"}, "children": ["High quality and reliable"]}]},
            {"id": "feature-2", "type": "div", "props": {"className": "p-6 bg-gray-50 rounded-lg"}, "children": [{"id": "f2-title", "type": "h3", "props": {"className": "text-xl font-bold mb-2"}, "children": ["Feature 2"]}, {"id": "f2-desc", "type": "p", "props": {"className": "text-gray-600"}, "children": ["Easy to use interface"]}]},
            {"id": "feature-3", "type": "div", "props": {"className": "p-6 bg-gray-50 rounded-lg"}, "children": [{"id": "f3-title", "type": "h3", "props": {"className": "text-xl font-bold mb-2"}, "children": ["Feature 3"]}, {"id": "f3-desc", "type": "p", "props": {"className": "text-gray-600"}, "children": ["24/7 Support"]}]}
          ]}
        ]
      },
      {
        "id": "gallery",
        "type": "section",
        "props": {"className": "py-20 px-4 bg-gray-50"},
        "children": [
          {"id": "gallery-title", "type": "h2", "props": {"className": "text-4xl font-bold mb-12 text-center"}, "children": ["Gallery"]},
          {"id": "gallery-grid", "type": "div", "props": {"className": "grid grid-cols-1 md:grid-cols-2 gap-8"}, "children": [
            {"id": "img-1", "type": "img", "props": {"src": "${firebaseUrls[0] || 'https://via.placeholder.com/400x300'}", "alt": "Product 1", "className": "w-full h-64 object-cover rounded-lg"}},
            {"id": "img-2", "type": "img", "props": {"src": "${firebaseUrls[1] || 'https://via.placeholder.com/400x300'}", "alt": "Product 2", "className": "w-full h-64 object-cover rounded-lg"}},
            {"id": "img-3", "type": "img", "props": {"src": "${firebaseUrls[2] || 'https://via.placeholder.com/400x300'}", "alt": "Product 3", "className": "w-full h-64 object-cover rounded-lg"}},
            {"id": "img-4", "type": "img", "props": {"src": "${firebaseUrls[3] || 'https://via.placeholder.com/400x300'}", "alt": "Product 4", "className": "w-full h-64 object-cover rounded-lg"}}
          ]}
        ]
      },
      {
        "id": "testimonials",
        "type": "section",
        "props": {"className": "py-20 px-4"},
        "children": [
          {"id": "testimonials-title", "type": "h2", "props": {"className": "text-4xl font-bold mb-12 text-center"}, "children": ["What Customers Say"]},
          {"id": "testimonials-grid", "type": "div", "props": {"className": "grid grid-cols-1 md:grid-cols-3 gap-8"}, "children": [
            {"id": "testimonial-1", "type": "div", "props": {"className": "p-6 bg-white border border-gray-200 rounded-lg"}, "children": [{"id": "t1-text", "type": "p", "props": {"className": "text-gray-700 mb-4"}, "children": ["Amazing product! Highly recommended."]}, {"id": "t1-author", "type": "p", "props": {"className": "font-bold text-gray-900"}, "children": ["John Doe"]}]},
            {"id": "testimonial-2", "type": "div", "props": {"className": "p-6 bg-white border border-gray-200 rounded-lg"}, "children": [{"id": "t2-text", "type": "p", "props": {"className": "text-gray-700 mb-4"}, "children": ["Best purchase ever made."]}, {"id": "t2-author", "type": "p", "props": {"className": "font-bold text-gray-900"}, "children": ["Jane Smith"]}]},
            {"id": "testimonial-3", "type": "div", "props": {"className": "p-6 bg-white border border-gray-200 rounded-lg"}, "children": [{"id": "t3-text", "type": "p", "props": {"className": "text-gray-700 mb-4"}, "children": ["Exceeded my expectations."]}, {"id": "t3-author", "type": "p", "props": {"className": "font-bold text-gray-900"}, "children": ["Mike Johnson"]}]}
          ]}
        ]
      },
      {
        "id": "stats",
        "type": "section",
        "props": {"className": "py-20 px-4 bg-blue-600 text-white"},
        "children": [
          {"id": "stats-grid", "type": "div", "props": {"className": "grid grid-cols-1 md:grid-cols-4 gap-8 text-center"}, "children": [
            {"id": "stat-1", "type": "div", "props": {}, "children": [{"id": "s1-num", "type": "h3", "props": {"className": "text-4xl font-bold"}, "children": ["10K+"]}, {"id": "s1-label", "type": "p", "props": {"className": "text-lg"}, "children": ["Happy Customers"]}]},
            {"id": "stat-2", "type": "div", "props": {}, "children": [{"id": "s2-num", "type": "h3", "props": {"className": "text-4xl font-bold"}, "children": ["5★"]}, {"id": "s2-label", "type": "p", "props": {"className": "text-lg"}, "children": ["Average Rating"]}]},
            {"id": "stat-3", "type": "div", "props": {}, "children": [{"id": "s3-num", "type": "h3", "props": {"className": "text-4xl font-bold"}, "children": ["100%"]}, {"id": "s3-label", "type": "p", "props": {"className": "text-lg"}, "children": ["Satisfaction"]}]},
            {"id": "stat-4", "type": "div", "props": {}, "children": [{"id": "s4-num", "type": "h3", "props": {"className": "text-4xl font-bold"}, "children": ["24/7"]}, {"id": "s4-label", "type": "p", "props": {"className": "text-lg"}, "children": ["Support"]}]}
          ]}
        ]
      },
      {
        "id": "cta",
        "type": "section",
        "props": {"className": "py-20 px-4 bg-gray-900 text-white text-center"},
        "children": [
          {"id": "cta-title", "type": "h2", "props": {"className": "text-4xl font-bold mb-6"}, "children": ["Ready to Get Started?"]},
          {"id": "cta-desc", "type": "p", "props": {"className": "text-xl mb-8 text-gray-300"}, "children": ["Join thousands of satisfied customers today"]},
          {"id": "cta-btn", "type": "button", "props": {"className": "px-10 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-lg"}, "children": ["Get Started Now"]}
        ]
      },
      {
        "id": "footer",
        "type": "footer",
        "props": {"className": "py-12 px-4 bg-gray-100 border-t"},
        "children": [
          {"id": "footer-content", "type": "div", "props": {"className": "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8"}, "children": [
            {"id": "footer-col-1", "type": "div", "props": {}, "children": [{"id": "fc1-title", "type": "h4", "props": {"className": "font-bold mb-4"}, "children": ["Product"]}, {"id": "fc1-link1", "type": "p", "props": {"className": "text-gray-600 mb-2"}, "children": ["Features"]}, {"id": "fc1-link2", "type": "p", "props": {"className": "text-gray-600"}, "children": ["Pricing"]}]},
            {"id": "footer-col-2", "type": "div", "props": {}, "children": [{"id": "fc2-title", "type": "h4", "props": {"className": "font-bold mb-4"}, "children": ["Company"]}, {"id": "fc2-link1", "type": "p", "props": {"className": "text-gray-600 mb-2"}, "children": ["About"]}, {"id": "fc2-link2", "type": "p", "props": {"className": "text-gray-600"}, "children": ["Contact"]}]},
            {"id": "footer-col-3", "type": "div", "props": {}, "children": [{"id": "fc3-title", "type": "h4", "props": {"className": "font-bold mb-4"}, "children": ["Support"]}, {"id": "fc3-link1", "type": "p", "props": {"className": "text-gray-600 mb-2"}, "children": ["Help Center"]}, {"id": "fc3-link2", "type": "p", "props": {"className": "text-gray-600"}, "children": ["FAQ"]}]},
            {"id": "footer-col-4", "type": "div", "props": {}, "children": [{"id": "fc4-title", "type": "h4", "props": {"className": "font-bold mb-4"}, "children": ["Legal"]}, {"id": "fc4-link1", "type": "p", "props": {"className": "text-gray-600 mb-2"}, "children": ["Privacy"]}, {"id": "fc4-link2", "type": "p", "props": {"className": "text-gray-600"}, "children": ["Terms"]}]}
          ]},
          {"id": "footer-bottom", "type": "div", "props": {"className": "mt-8 pt-8 border-t text-center text-gray-600"}, "children": [{"id": "footer-copy", "type": "p", "props": {}, "children": ["Copyright 2024. All rights reserved."]}]}
        ]
      }
    ]
  }
}`;

    console.log('🤖 Calling Gemini API...');
    const model = 'gemini-2.0-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            ...photoDataList,
            {
              text: prompt
            }
          ]
        }
      ]
    });

    let generatedText = response.text || '';
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

    let result;
    let parseAttempt = 0;
    const maxAttempts = 3;

    while (parseAttempt < maxAttempts) {
      try {
        result = JSON.parse(cleanedText);
        
        if (!result.component || !result.metadata) {
          throw new Error('Template missing required fields');
        }

        console.log('✅ Generated successfully');
        break;
      } catch (parseError) {
        parseAttempt++;
        console.warn(`❌ Attempt ${parseAttempt} failed:`, parseError.message);

        if (parseAttempt < maxAttempts) {
          console.log(`🔄 Retrying (attempt ${parseAttempt + 1}/${maxAttempts})...`);
          
          const retryResponse = await ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  ...photoDataList,
                  {
                    text: prompt + '\n\nIMPORTANT: Return ONLY valid JSON. Check all quotes, commas, brackets. No syntax errors.'
                  }
                ]
              }
            ]
          });

          let retryText = retryResponse.text || '';
          cleanedText = retryText
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
        } else {
          return NextResponse.json(
            { error: `Failed after ${maxAttempts} attempts: ${parseError.message}` },
            { status: 500 }
          );
        }
      }
    }

    console.log('✅ Template structure:', {
      hasMetadata: !!result.metadata,
      hasComponent: !!result.component,
      componentChildrenCount: result.component?.children?.length || 0,
      totalSize: JSON.stringify(result).length + ' bytes'
    });
    
    return NextResponse.json({
      success: true,
      templateJSON: result,
      photoCount: photos.length,
      firebaseUrls: firebaseUrls,
      message: 'Template generated successfully from photos'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate: ' + error.message },
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
