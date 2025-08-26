import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const productsDir = path.join(process.cwd(), 'development', 'products');
    
    // Check if products directory exists
    try {
      await fs.access(productsDir);
    } catch (error) {
      // Directory doesn't exist, return empty array
      return NextResponse.json({
        success: true,
        products: []
      });
    }

    // Read all product directories
    const productDirs = await fs.readdir(productsDir, { withFileTypes: true });
    const products = [];

    for (const dir of productDirs) {
      if (dir.isDirectory()) {
        try {
          const productDir = path.join(productsDir, dir.name);
          const standardPath = path.join(productDir, 'standard.json');
          
          // Check if standard.json exists
          try {
            await fs.access(standardPath);
            const standardData = await fs.readFile(standardPath, 'utf-8');
            const product = JSON.parse(standardData);
            
            // Check if custom.json exists
            const customPath = path.join(productDir, 'custom.json');
            try {
              await fs.access(customPath);
              product.hasCustomPage = true;
            } catch {
              product.hasCustomPage = false;
            }
            
            products.push(product);
          } catch (error) {
            console.error(`Error reading standard.json for product ${dir.name}:`, error);
            // Skip this product if standard.json is missing or invalid
          }
        } catch (error) {
          console.error(`Error processing product directory ${dir.name}:`, error);
        }
      }
    }

    // Sort products by creation date (newest first)
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error in list products API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}