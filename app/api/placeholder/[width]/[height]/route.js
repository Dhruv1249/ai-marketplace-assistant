import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { width, height } = await params;
    
    const w = parseInt(width) || 400;
    const h = parseInt(height) || 300;
    
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">
          ${w} × ${h}
        </text>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle" dy="1.5em">
          Product Image
        </text>
      </svg>
    `;
    
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate placeholder' },
      { status: 500 }
    );
  }
}