import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// POST /api/products/create-standard
export async function POST(request) {
  try {
    const { productId, standardData } = await request.json();

    if (!productId || !standardData) {
      return NextResponse.json({ success: false, error: 'Missing productId or data' }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), 'development', 'products', productId);
    await fs.mkdir(baseDir, { recursive: true });
    const standardPath = path.join(baseDir, 'standard.json');

    await fs.writeFile(standardPath, JSON.stringify(standardData, null, 2));

    return NextResponse.json({ success: true, message: 'standard.json written', productId });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}