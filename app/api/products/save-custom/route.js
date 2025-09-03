import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract data from FormData
    const productId = formData.get('productId');
    const customData = JSON.parse(formData.get('customData'));
    
    // Extract image files for custom page
    const customImages = [];
    let index = 0;
    while (formData.get(`customImage_${index}`)) {
      customImages.push(formData.get(`customImage_${index}`));
      index++;
    }

    if (!productId || !customData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required data'
      }, { status: 400 });
    }

    // Check if product directory exists
    const productDir = path.join(process.cwd(), 'development', 'products', productId);
    try {
      await fs.access(productDir);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    const imagesDir = path.join(productDir, 'images');
    
    // Ensure images directory exists
    try {
      await fs.mkdir(imagesDir, { recursive: true });
    } catch (error) {
      console.error('Error creating images directory:', error);
    }

    // Save custom page images
    const savedCustomImages = [];
    for (let i = 0; i < customImages.length; i++) {
      const file = customImages[i];
      if (file && file instanceof File) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const extension = path.extname(file.name) || '.jpg';
          const filename = `custom-${i + 1}${extension}`;
          const filePath = path.join(imagesDir, filename);
          
          await fs.writeFile(filePath, buffer);
          savedCustomImages.push(filename);
        } catch (error) {
          console.error(`Error saving custom image ${i + 1}:`, error);
        }
      }
    }

    // Update customData with saved image filenames
    const updatedCustomData = {
      ...customData,
      savedImages: savedCustomImages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save custom.json
    const customPath = path.join(productDir, 'custom.json');
    await fs.writeFile(customPath, JSON.stringify(updatedCustomData, null, 2));

    // Update standard.json to indicate it has a custom page
    const standardPath = path.join(productDir, 'standard.json');
    try {
      const standardContent = await fs.readFile(standardPath, 'utf-8');
      const standardData = JSON.parse(standardContent);
      standardData.hasCustomPage = true;
      standardData.updatedAt = new Date().toISOString();
      await fs.writeFile(standardPath, JSON.stringify(standardData, null, 2));
    } catch (error) {
      console.error('Error updating standard.json:', error);
    }

    return NextResponse.json({
      success: true,
      productId,
      message: 'Custom page saved successfully',
      savedImages: savedCustomImages
    });

  } catch (error) {
    console.error('Error saving custom page:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}