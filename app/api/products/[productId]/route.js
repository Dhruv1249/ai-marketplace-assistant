import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { productId } = await params;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Path to the product directory
    const productDir = path.join(process.cwd(), 'development', 'products', productId);
    const standardJsonPath = path.join(productDir, 'standard.json');

    // Check if product exists
    if (!fs.existsSync(standardJsonPath)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Read the standard product data
    const standardData = JSON.parse(fs.readFileSync(standardJsonPath, 'utf8'));

    // Add additional metadata
    const productData = {
      ...standardData,
      id: productId,
      hasCustomPage: fs.existsSync(path.join(productDir, 'custom.json'))
    };

    // Check if custom data exists and include it
    const customJsonPath = path.join(productDir, 'custom.json');
    let customData = null;
    
    if (fs.existsSync(customJsonPath)) {
      try {
        customData = JSON.parse(fs.readFileSync(customJsonPath, 'utf8'));
      } catch (error) {
        console.error('Error reading custom data:', error);
      }
    }

    // Return in the format expected by the product page
    const response = {
      success: true,
      standard: productData
    };

    // Include custom data if it exists
    if (customData) {
      response.custom = customData;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}