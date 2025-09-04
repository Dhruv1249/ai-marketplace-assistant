import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { productId } = params;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Path to the product directory
    const productDir = path.join(process.cwd(), 'development', 'products', productId);
    const customJsonPath = path.join(productDir, 'custom.json');

    // Check if custom page exists
    if (!fs.existsSync(customJsonPath)) {
      return NextResponse.json({ error: 'Custom page not found' }, { status: 404 });
    }

    // Read the custom page data
    const customData = JSON.parse(fs.readFileSync(customJsonPath, 'utf8'));

    return NextResponse.json(customData);
  } catch (error) {
    console.error('Error fetching custom page:', error);
    return NextResponse.json({ error: 'Failed to fetch custom page' }, { status: 500 });
  }
}