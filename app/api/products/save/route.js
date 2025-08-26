import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract data from FormData
    const productId = formData.get('productId');
    const standardData = JSON.parse(formData.get('standardData'));
    const customData = formData.get('customData') ? JSON.parse(formData.get('customData')) : null;
    
    // Extract image files
    const thumbnailFile = formData.get('thumbnailImage');
    const additionalFiles = [];
    
    // Get all additional image files
    let index = 0;
    while (formData.get(`additionalImage_${index}`)) {
      additionalFiles.push(formData.get(`additionalImage_${index}`));
      index++;
    }

    if (!productId || !standardData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required data'
      }, { status: 400 });
    }

    // Create product directory
    const productDir = path.join(process.cwd(), 'development', 'products', productId);
    const imagesDir = path.join(productDir, 'images');
    
    try {
      await fs.mkdir(productDir, { recursive: true });
      await fs.mkdir(imagesDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create product directory'
      }, { status: 500 });
    }

    // Save images
    const savedImages = {
      thumbnail: null,
      additional: []
    };

    // Save thumbnail image
    if (thumbnailFile && thumbnailFile instanceof File) {
      try {
        const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
        const thumbnailExtension = path.extname(thumbnailFile.name) || '.jpg';
        const thumbnailPath = path.join(imagesDir, `thumbnail${thumbnailExtension}`);
        
        await fs.writeFile(thumbnailPath, thumbnailBuffer);
        savedImages.thumbnail = `thumbnail${thumbnailExtension}`;
      } catch (error) {
        console.error('Error saving thumbnail:', error);
      }
    }

    // Save additional images
    for (let i = 0; i < additionalFiles.length; i++) {
      const file = additionalFiles[i];
      if (file && file instanceof File) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const extension = path.extname(file.name) || '.jpg';
          const filename = `additional-${i + 1}${extension}`;
          const filePath = path.join(imagesDir, filename);
          
          await fs.writeFile(filePath, buffer);
          savedImages.additional.push(filename);
        } catch (error) {
          console.error(`Error saving additional image ${i + 1}:`, error);
        }
      }
    }

    // Update standardData with actual saved image filenames
    const updatedStandardData = {
      ...standardData,
      images: savedImages
    };

    // Save standard.json
    const standardPath = path.join(productDir, 'standard.json');
    await fs.writeFile(standardPath, JSON.stringify(updatedStandardData, null, 2));

    // Save custom.json if provided
    if (customData) {
      const customPath = path.join(productDir, 'custom.json');
      await fs.writeFile(customPath, JSON.stringify(customData, null, 2));
    }

    return NextResponse.json({
      success: true,
      productId,
      message: 'Product saved successfully',
      savedImages
    });

  } catch (error) {
    console.error('Error saving product:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}