import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/app/login/firebase-admin'; // Step 2: You will need to create this file, see instructions below

export async function POST(request) {
  try {
    const formData = await request.formData();
    const productId = formData.get('productId');
    const customData = JSON.parse(formData.get('customData'));

    // Gather images
    const customImages = [];
    let index = 0;
    while (formData.get(`customImage_${index}`)) {
      customImages.push(formData.get(`customImage_${index}`));
      index++;
    }

    // Upload images to Firebase Storage, get signed URLs
    const savedImageUrls = [];
    for (let i = 0; i < customImages.length; i++) {
      const file = customImages[i];
      if (file && file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = `products/${productId}/custom-${i + 1}-${file.name}`;
        const bucket = adminStorage.bucket(); // Uses your default storage bucket
        const fileRef = bucket.file(filePath);
        await fileRef.save(buffer, { contentType: file.type });
        const [url] = await fileRef.getSignedUrl({
          action: 'read',
          expires: '03-01-2500'
        });
        savedImageUrls.push(url);
      }
    }

    // Update customData with new image URLs/timestamps
    const updatedCustomData = {
      ...customData,
      savedImages: savedImageUrls,
      updatedAt: new Date().toISOString(),
      createdAt: customData.createdAt || new Date().toISOString(),
    };
console.log('Updating Firestore product:', productId, updatedCustomData);

await adminDb.collection('products').doc(productId).update({
  hasCustomPage: true,
  customPage: updatedCustomData,
  updatedAt: new Date().toISOString(),
});

console.log('Update complete for product:', productId);
    // Write to Firestore
    await adminDb.collection('products').doc(productId).update({
      hasCustomPage: true,
      customPage: updatedCustomData,
      updatedAt: new Date().toISOString(),
    });
console.log('Updating Firestore product:', productId, updatedCustomData);

await adminDb.collection('products').doc(productId).update({
  hasCustomPage: true,
  customPage: updatedCustomData,
  updatedAt: new Date().toISOString(),
});

console.log('Update complete for product:', productId);
    return NextResponse.json({
      success: true,
      productId,
      message: 'Custom page saved to Firebase',
      savedImages: savedImageUrls
    });

 } catch (err) {
  console.error('Failed to save custom page:', err);
  return NextResponse.json({
    success: false,
    error: String(err)
  }, { status: 500 });
}
}