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

          // Read standard.json file
          const standardPath = path.join(productDir, 'standard.json');
          let fileToRead = null;

          try {
            await fs.access(standardPath);
            fileToRead = standardPath;
          } catch {
            // Skip if standard.json doesn't exist
            continue;
          }

          const productData = await fs.readFile(fileToRead, 'utf-8');
          const product = JSON.parse(productData);

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