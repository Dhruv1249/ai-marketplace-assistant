'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft, FileText } from 'lucide-react';
import UniversalPreviewPage from '@/components/shared/UniversalPreviewPage';
import Loading from '@/app/loading';
import { db } from '@/app/login/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function CustomProductPage() {
  const params = useParams();
  const { productId } = params;
  
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchProduct = async () => {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().customPage) {
        const data = docSnap.data();
        const custom = data.customPage;
        const standard = {
          title: data.title,
          description: data.description,
          images: data.images || {},
        };

        const contentData = custom.content || custom.productStoryData || {};
        
        // The content already has the correct Firebase URLs in the proper visual categories
        // No need to override with savedImages - just use the content as-is
        const updatedContentData = {
          ...contentData,
          visuals: {
            // Use the existing visuals structure which already has correct Firebase URLs
            hero: contentData.visuals?.hero || [],
            process: contentData.visuals?.process || [],
            beforeAfter: contentData.visuals?.beforeAfter || [],
            lifestyle: contentData.visuals?.lifestyle || [],
            team: contentData.visuals?.team || [],
          },
        };

        const previewData = {
          productStoryData: updatedContentData,
          templateType: custom.templateType || 'journey',
          model: custom.model,
          content: updatedContentData,
          images: custom.savedImages || [],
        };

        localStorage.setItem('productStoryPreviewData', JSON.stringify(previewData));
        setProductData({ custom, standard });
      } else {
        setError('Custom page not found for this product');
      }
    } catch (err) {
      console.error('Error fetching product from Firestore:', err);
      setError('Failed to load custom product page');
    } finally {
      setLoading(false);
    }
  };

  if (productId && db) {
    fetchProduct();
  }
}, [productId]);

  if (loading) {
    return <Loading />;
  }

  if (error || !productData?.custom) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Custom Page Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This product does not have a custom page.'}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace">
              <Button variant="outline">
                <ArrowLeft className="mr-2" size={16} />
                Back to Marketplace
              </Button>
            </Link>
            <Link href={`/marketplace/${productId}`}>
              <Button>
                <FileText className="mr-2" size={16} />
                View Standard Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/marketplace" className="text-gray-500 hover:text-gray-700">
              Marketplace
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Product</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 truncate">{productData.standard?.title || 'Custom Product Page'}</span>
          </div>
        </div>
      </div>

      {/* Back Button and Standard Page Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/marketplace" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} className="mr-2" />
            Back to Marketplace
          </Link>
          <Link href={`/marketplace/${productId}`}>
            <Button variant="outline" size="sm">
              <FileText className="mr-2" size={16} />
              View Standard Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Use UniversalPreviewPage for rendering */}
      <UniversalPreviewPage
        type="product-story"
        backUrl={`/marketplace/${productId}`}
        storageKey="productStoryPreviewData"
        showHeader={false}
        showEditingUI={false}
        title=""
        helpText=""
      />
    </div>
  );
}