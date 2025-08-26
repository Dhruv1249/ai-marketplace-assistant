import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productDir = path.join(process.cwd(), 'development', 'products', productId);
    
    // Check if product directory exists
    try {
      await fs.access(productDir);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Read standard product data
    const standardPath = path.join(productDir, 'standard.json');
    let standardData;
    
    try {
      const standardContent = await fs.readFile(standardPath, 'utf-8');
      standardData = JSON.parse(standardContent);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Product data not found or invalid' },
        { status: 404 }
      );
    }

    // Check for custom data
    const customPath = path.join(productDir, 'custom.json');
    let customData = null;
    
    try {
      const customContent = await fs.readFile(customPath, 'utf-8');
      customData = JSON.parse(customContent);
      standardData.hasCustomPage = true;
    } catch (error) {
      standardData.hasCustomPage = false;
    }

    return NextResponse.json({
      success: true,
      standard: standardData,
      custom: customData
    });

  } catch (error) {
    console.error('Error in get product API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}