'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import UniversalPreviewPage from '@/components/shared/UniversalPreviewPage';

export default function CustomProductPage() {
  const params = useParams();
  const { productId } = params;
  
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();

        if (result.success && result.custom) {
          // Prepare custom images array
          const customImages = [];
          
          // Add saved custom images if they exist
          if (result.custom.savedImages && Array.isArray(result.custom.savedImages)) {
            result.custom.savedImages.forEach((imageName, index) => {
              customImages.push(`/api/products/${productId}/images/${imageName}`);
            });
          }
          
          // Also add standard product images as fallback
          if (result.standard?.images?.thumbnail) {
            customImages.push(`/api/products/${productId}/images/${result.standard.images.thumbnail}`);
          }
          if (result.standard?.images?.additional) {
            result.standard.images.additional.forEach(imageName => {
              customImages.push(`/api/products/${productId}/images/${imageName}`);
            });
          }
          
          // Convert saved images to the format expected by the renderer
          const heroImages = [];
          if (result.custom.savedImages && Array.isArray(result.custom.savedImages)) {
            result.custom.savedImages.forEach((imageName, index) => {
              heroImages.push({
                id: Date.now() + index,
                url: `/api/products/${productId}/images/${imageName}`,
                type: 'saved',
                name: imageName
              });
            });
          }

          // Get the content data and update it with properly formatted visuals
          const contentData = result.custom.content || result.custom.productStoryData || {};
          const updatedContentData = {
            ...contentData,
            visuals: {
              ...contentData.visuals,
              hero: heroImages,
              process: contentData.visuals?.process || [],
              beforeAfter: contentData.visuals?.beforeAfter || [],
              lifestyle: contentData.visuals?.lifestyle || [],
              team: contentData.visuals?.team || []
            }
          };

          // Store the custom data in localStorage for UniversalPreviewPage
          const previewData = {
            productStoryData: updatedContentData,
            templateType: result.custom.templateType || 'journey',
            model: result.custom.model,
            content: updatedContentData,
            images: customImages
          };
          
          localStorage.setItem('productStoryPreviewData', JSON.stringify(previewData));
          setProductData(result);
        } else {
          setError('Custom page not found for this product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load custom product page');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading custom page...</p>
        </div>
      </div>
    );
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