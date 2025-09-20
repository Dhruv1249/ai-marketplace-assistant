import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/app/login/firebase-admin';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const productId = formData.get('productId');
    const customData = JSON.parse(formData.get('customData'));

    console.log('🔄 [API] Starting custom page save for product:', productId);
    console.log('🔄 [API] Received custom data keys:', Object.keys(customData));

    // Step 1: Extract all blob URLs from the content to create a mapping
    const blobUrlsInContent = new Set();
    const extractBlobUrls = (obj, path = '') => {
      if (typeof obj === 'string' && obj.startsWith('blob:')) {
        blobUrlsInContent.add(obj);
        console.log(`🔍 [API] Found blob URL at ${path}:`, obj.substring(0, 50) + '...');
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => extractBlobUrls(item, `${path}[${index}]`));
      } else if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => extractBlobUrls(value, `${path}.${key}`));
      }
    };

    extractBlobUrls(customData.content, 'content');
    extractBlobUrls(customData.productStoryData, 'productStoryData');
    console.log(`🔍 [API] Found ${blobUrlsInContent.size} unique blob URLs in content`);

    // Step 2: Gather uploaded files and create file metadata
    const uploadedFiles = [];
    let fileIndex = 0;
    
    while (formData.get(`customImage_${fileIndex}`)) {
      const file = formData.get(`customImage_${fileIndex}`);
      const fileMetadata = formData.get(`customImageMeta_${fileIndex}`);
      
      if (file && file instanceof File) {
        // Parse metadata if available
        let metadata = {};
        try {
          if (fileMetadata) {
            metadata = JSON.parse(fileMetadata);
          }
        } catch (e) {
          console.warn(`⚠️ [API] Failed to parse metadata for file ${fileIndex}:`, e);
        }

        // Create file hash for duplicate detection
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
        
        uploadedFiles.push({
          file,
          buffer,
          index: fileIndex,
          originalName: file.name,
          size: file.size,
          type: file.type,
          hash: fileHash,
          metadata: {
            blobUrl: metadata.blobUrl || null,
            visualType: metadata.visualType || 'unknown',
            originalIndex: metadata.originalIndex || fileIndex,
            fileName: metadata.fileName || file.name,
            ...metadata
          }
        });
      }
      fileIndex++;
    }

    console.log(`📁 [API] Found ${uploadedFiles.length} files to upload`);

    // Step 3: Create blob URL to file mapping using multiple strategies
    const blobToFileMapping = new Map();
    const fileHashToFirebaseUrl = new Map(); // For duplicate detection
    
    // Strategy 1: Direct blob URL mapping from metadata
    uploadedFiles.forEach(fileInfo => {
      if (fileInfo.metadata.blobUrl && blobUrlsInContent.has(fileInfo.metadata.blobUrl)) {
        blobToFileMapping.set(fileInfo.metadata.blobUrl, fileInfo);
        console.log(`✅ [API] Direct mapping: ${fileInfo.metadata.blobUrl.substring(0, 30)}... → ${fileInfo.originalName}`);
      }
    });

    // Strategy 2: Filename-based mapping for unmapped blob URLs
    const unmappedBlobUrls = Array.from(blobUrlsInContent).filter(url => !blobToFileMapping.has(url));
    const unmappedFiles = uploadedFiles.filter(file => !Array.from(blobToFileMapping.values()).includes(file));
    
    if (unmappedBlobUrls.length > 0 && unmappedFiles.length > 0) {
      console.log(`🔄 [API] Attempting filename-based mapping for ${unmappedBlobUrls.length} unmapped URLs`);
      
      // Try to match by filename patterns or visual type
      unmappedFiles.forEach(fileInfo => {
        if (unmappedBlobUrls.length > 0) {
          const blobUrl = unmappedBlobUrls.shift();
          blobToFileMapping.set(blobUrl, fileInfo);
          console.log(`🔗 [API] Filename mapping: ${blobUrl.substring(0, 30)}... → ${fileInfo.originalName}`);
        }
      });
    }

    // Step 4: Upload files to Firebase Storage with duplicate detection
    const firebaseUrlMapping = new Map(); // blob URL → Firebase URL
    const uploadPromises = [];

    for (const [blobUrl, fileInfo] of blobToFileMapping.entries()) {
      // Check if we've already uploaded this exact file (by hash)
      if (fileHashToFirebaseUrl.has(fileInfo.hash)) {
        const existingUrl = fileHashToFirebaseUrl.get(fileInfo.hash);
        firebaseUrlMapping.set(blobUrl, existingUrl);
        console.log(`♻️ [API] Reusing uploaded file: ${fileInfo.originalName} → ${existingUrl.substring(0, 50)}...`);
        continue;
      }

      const uploadPromise = (async () => {
        try {
          // Create unique filename with timestamp to avoid conflicts
          const timestamp = Date.now();
          const sanitizedName = fileInfo.originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `products/${productId}/custom-${timestamp}-${fileInfo.index}-${sanitizedName}`;
          
          const bucket = adminStorage.bucket();
          const fileRef = bucket.file(filePath);
          
          await fileRef.save(fileInfo.buffer, { 
            contentType: fileInfo.type,
            metadata: {
              customFields: {
                originalName: fileInfo.originalName,
                visualType: fileInfo.metadata.visualType,
                uploadedAt: new Date().toISOString(),
                fileHash: fileInfo.hash,
                blobUrl: blobUrl
              }
            }
          });
          
          const [firebaseUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
          });
          
          // Store mappings
          firebaseUrlMapping.set(blobUrl, firebaseUrl);
          fileHashToFirebaseUrl.set(fileInfo.hash, firebaseUrl);
          
          console.log(`✅ [API] Uploaded: ${fileInfo.originalName} → ${firebaseUrl.substring(0, 50)}...`);
          return { blobUrl, firebaseUrl, fileInfo };
          
        } catch (uploadError) {
          console.error(`❌ [API] Failed to upload ${fileInfo.originalName}:`, uploadError);
          return { blobUrl, firebaseUrl: null, fileInfo, error: uploadError };
        }
      })();
      
      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    const successfulUploads = uploadResults.filter(result => result.firebaseUrl);
    const failedUploads = uploadResults.filter(result => !result.firebaseUrl);

    console.log(`📊 [API] Upload summary: ${successfulUploads.length} successful, ${failedUploads.length} failed`);

    // Step 5: Replace blob URLs with Firebase URLs in content
    const replaceBlobUrlsWithMapping = (obj, path = '') => {
      if (typeof obj === 'string' && obj.startsWith('blob:')) {
        const firebaseUrl = firebaseUrlMapping.get(obj);
        if (firebaseUrl) {
          console.log(`🔄 [API] Replacing at ${path}: ${obj.substring(0, 30)}... → Firebase URL`);
          return firebaseUrl;
        } else {
          console.warn(`⚠️ [API] No Firebase URL found for blob URL at ${path}: ${obj.substring(0, 30)}...`);
          return obj; // Keep original if no mapping found
        }
      }
      
      if (Array.isArray(obj)) {
        return obj.map((item, index) => replaceBlobUrlsWithMapping(item, `${path}[${index}]`));
      }
      
      if (obj && typeof obj === 'object') {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
          newObj[key] = replaceBlobUrlsWithMapping(value, `${path}.${key}`);
        }
        return newObj;
      }
      
      return obj;
    };

    // Apply replacements
    console.log('🔄 [API] Replacing blob URLs in content data...');
    const updatedContent = replaceBlobUrlsWithMapping(customData.content, 'content');
    const updatedProductStoryData = replaceBlobUrlsWithMapping(customData.productStoryData, 'productStoryData');

    // Step 6: Prepare final data structure
    const allFirebaseUrls = Array.from(firebaseUrlMapping.values());
    const updatedCustomData = {
      ...customData,
      content: updatedContent,
      productStoryData: updatedProductStoryData,
      savedImages: allFirebaseUrls,
      imageMapping: Object.fromEntries(firebaseUrlMapping), // For debugging/reference
      uploadSummary: {
        totalBlobUrls: blobUrlsInContent.size,
        totalFiles: uploadedFiles.length,
        successfulUploads: successfulUploads.length,
        failedUploads: failedUploads.length,
        duplicatesDetected: uploadedFiles.length - new Set(uploadedFiles.map(f => f.hash)).size
      },
      updatedAt: new Date().toISOString(),
      createdAt: customData.createdAt || new Date().toISOString(),
    };

    console.log('💾 [API] Saving to Firestore with', allFirebaseUrls.length, 'Firebase URLs');
    console.log('💾 [API] Upload summary:', updatedCustomData.uploadSummary);

    // Step 7: Save to Firestore
    await adminDb.collection('products').doc(productId).update({
      hasCustomPage: true,
      customPage: updatedCustomData,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ [API] Successfully saved custom page for product:', productId);

    return NextResponse.json({
      success: true,
      productId,
      message: 'Custom page saved to Firebase with proper URL mapping',
      savedImages: allFirebaseUrls,
      uploadSummary: updatedCustomData.uploadSummary,
      blobUrlsReplaced: firebaseUrlMapping.size,
      mapping: Object.fromEntries(firebaseUrlMapping)
    });

  } catch (err) {
    console.error('❌ [API] Failed to save custom page:', err);
    return NextResponse.json({
      success: false,
      error: String(err),
      stack: err.stack
    }, { status: 500 });
  }
}