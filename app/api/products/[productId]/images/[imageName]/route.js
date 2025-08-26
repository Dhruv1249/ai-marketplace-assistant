import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { productId, imageName } = await params;

    if (!productId || !imageName) {
      return NextResponse.json(
        { success: false, error: 'Product ID and image name are required' },
        { status: 400 }
      );
    }

    // Construct the image path
    const imagePath = path.join(process.cwd(), 'development', 'products', productId, 'images', imageName);
    
    try {
      // Check if file exists
      await fs.access(imagePath);
      
      // Read the image file
      const imageBuffer = await fs.readFile(imagePath);
      
      // Determine content type based on file extension
      const ext = path.extname(imageName).toLowerCase();
      let contentType = 'image/jpeg'; // default
      
      switch (ext) {
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
        case '.jpg':
        case '.jpeg':
        default:
          contentType = 'image/jpeg';
          break;
      }
      
      // Return the image with proper headers
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
      
    } catch (error) {
      console.error('Error reading image file:', error);
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error in image API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}