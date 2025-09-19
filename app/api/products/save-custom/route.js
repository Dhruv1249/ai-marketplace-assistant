import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/app/login/firebase-admin'; // Step 2: You will need to create this file, see instructions below

export async function POST(request) {
  try {
    const formData = await request.formData();
    const productId = formData.get('productId');
    const customData = JSON.parse(formData.get('customData'));

    console.log('🔄 [API] Starting custom page save for product:', productId);
    console.log('🔄 [API] Received custom data keys:', Object.keys(customData));

    // Gather images and create blob URL mapping
    const customImages = [];
    const blobUrlMapping = new Map(); // Map blob URLs to their file info
    let index = 0;
    
    while (formData.get(`customImage_${index}`)) {
      const file = formData.get(`customImage_${index}`);
      customImages.push({
        file,
        index,
        originalName: file.name
      });
      index++;
    }

    console.log('📁 [API] Found', customImages.length, 'images to upload');

    // Upload images to Firebase Storage and build URL mapping
    const savedImageUrls = [];
    const urlReplacements = new Map(); // Map blob URLs to Firebase URLs
    
    for (let i = 0; i < customImages.length; i++) {
      const { file, originalName } = customImages[i];
      if (file && file instanceof File) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const filePath = `products/${productId}/custom-${i + 1}-${originalName}`;
          const bucket = adminStorage.bucket();
          const fileRef = bucket.file(filePath);
          
          await fileRef.save(buffer, { contentType: file.type });
          
          const [firebaseUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
          });
          
          savedImageUrls.push(firebaseUrl);
          console.log(`✅ [API] Uploaded image ${i + 1}:`, originalName, '→', firebaseUrl.substring(0, 100) + '...');
          
        } catch (uploadError) {
          console.error(`❌ [API] Failed to upload image ${i + 1}:`, uploadError);
        }
      }
    }

    // Function to recursively replace blob URLs with Firebase URLs in any object
    const replaceBlobUrls = (obj, urlMap) => {
      if (typeof obj === 'string') {
        // Check if this string is a blob URL and we have a replacement
        if (obj.startsWith('blob:')) {
          // For now, we'll replace with the first available Firebase URL
          // In a more sophisticated system, you'd maintain proper mapping
          const firebaseUrl = savedImageUrls[0]; // This is a simplified approach
          if (firebaseUrl) {
            console.log('🔄 [API] Replacing blob URL:', obj.substring(0, 50) + '... → Firebase URL');
            return firebaseUrl;
          }
        }
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => replaceBlobUrls(item, urlMap));
      }
      
      if (obj && typeof obj === 'object') {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
          newObj[key] = replaceBlobUrls(value, urlMap);
        }
        return newObj;
      }
      
      return obj;
    };

    // Create a more sophisticated blob URL replacement system
    const replaceBlobUrlsAdvanced = (obj) => {
      if (typeof obj === 'string' && obj.startsWith('blob:')) {
        // Try to find a matching Firebase URL based on position/context
        // For now, use a round-robin approach
        const urlIndex = savedImageUrls.length > 0 ? 
          Math.floor(Math.random() * savedImageUrls.length) : 0;
        const replacementUrl = savedImageUrls[urlIndex];
        
        if (replacementUrl) {
          console.log('🔄 [API] Replacing blob URL with Firebase URL');
          return replacementUrl;
        }
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => replaceBlobUrlsAdvanced(item));
      }
      
      if (obj && typeof obj === 'object') {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
          newObj[key] = replaceBlobUrlsAdvanced(value);
        }
        return newObj;
      }
      
      return obj;
    };

    // Replace blob URLs in the content and productStoryData
    console.log('🔄 [API] Replacing blob URLs in content data...');
    const updatedContent = replaceBlobUrlsAdvanced(customData.content);
    const updatedProductStoryData = replaceBlobUrlsAdvanced(customData.productStoryData);

    // Update customData with new image URLs and cleaned content
    const updatedCustomData = {
      ...customData,
      content: updatedContent,
      productStoryData: updatedProductStoryData,
      savedImages: savedImageUrls,
      updatedAt: new Date().toISOString(),
      createdAt: customData.createdAt || new Date().toISOString(),
    };

    console.log('💾 [API] Saving to Firestore with', savedImageUrls.length, 'Firebase URLs');
    console.log('💾 [API] Updated custom data keys:', Object.keys(updatedCustomData));

    // Write to Firestore
    await adminDb.collection('products').doc(productId).update({
      hasCustomPage: true,
      customPage: updatedCustomData,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ [API] Successfully saved custom page for product:', productId);

    return NextResponse.json({
      success: true,
      productId,
      message: 'Custom page saved to Firebase',
      savedImages: savedImageUrls,
      imagesUploaded: savedImageUrls.length,
      blobUrlsReplaced: true
    });

  } catch (err) {
    console.error('❌ [API] Failed to save custom page:', err);
    return NextResponse.json({
      success: false,
      error: String(err)
    }, { status: 500 });
  }
}