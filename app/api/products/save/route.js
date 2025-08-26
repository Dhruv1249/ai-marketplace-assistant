import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { productId, standardData, customData, thumbnailImage, additionalImages } = await request.json();

    if (!productId || !standardData) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Create product directory
    const productDir = path.join(process.cwd(), 'development', 'products', productId);
    
    try {
      await fs.mkdir(productDir, { recursive: true });
    } catch (error) {
      console.error('Error creating product directory:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create product directory' },
        { status: 500 }
      );
    }

    // Save standard product data
    const standardPath = path.join(productDir, 'standard.json');
    try {
      await fs.writeFile(standardPath, JSON.stringify(standardData, null, 2));
    } catch (error) {
      console.error('Error saving standard data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save standard product data' },
        { status: 500 }
      );
    }

    // Save custom product data if provided
    if (customData) {
      const customPath = path.join(productDir, 'custom.json');
      try {
        await fs.writeFile(customPath, JSON.stringify(customData, null, 2));
      } catch (error) {
        console.error('Error saving custom data:', error);
        // Don't fail the entire request if custom data fails
      }
    }

    // Create images directory
    const imagesDir = path.join(productDir, 'images');
    try {
      await fs.mkdir(imagesDir, { recursive: true });
    } catch (error) {
      console.error('Error creating images directory:', error);
    }

    // Note: In a real implementation, you would save the actual image files here
    // For now, we're just creating placeholder files to maintain the structure
    if (thumbnailImage) {
      try {
        const thumbnailPath = path.join(imagesDir, 'thumbnail.txt');
        await fs.writeFile(thumbnailPath, 'Thumbnail image placeholder - implement actual image saving');
      } catch (error) {
        console.error('Error creating thumbnail placeholder:', error);
      }
    }

    if (additionalImages && additionalImages.length > 0) {
      for (let i = 0; i < additionalImages.length; i++) {
        try {
          const imagePath = path.join(imagesDir, `additional-${i + 1}.txt`);
          await fs.writeFile(imagePath, `Additional image ${i + 1} placeholder - implement actual image saving`);
        } catch (error) {
          console.error(`Error creating additional image ${i + 1} placeholder:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      productId,
      message: 'Product saved successfully'
    });

  } catch (error) {
    console.error('Error in save product API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}