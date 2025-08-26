'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';

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

  const customData = productData.custom;
  const standardData = productData.standard;

  // Create images array with actual image URLs
  const images = [];
  if (standardData?.images?.thumbnail) {
    images.push(`/api/products/${productId}/images/${standardData.images.thumbnail}`);
  }
  if (standardData?.images?.additional) {
    standardData.images.additional.forEach((imageName) => {
      images.push(`/api/products/${productId}/images/${imageName}`);
    });
  }
  
  // Add fallback placeholder if no images
  if (images.length === 0) {
    images.push('/api/placeholder/600/400');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {standardData?.title || 'Custom Product Page'}
                </h1>
                <p className="text-sm text-gray-500">Enhanced custom layout</p>
              </div>
            </div>
            <Link href={`/marketplace/${productId}`}>
              <Button variant="outline" size="sm">
                <FileText className="mr-2" size={16} />
                View Standard Page
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Page Content */}
      <div className="custom-product-page">
        <EnhancedJSONModelRenderer
          model={customData.model}
          content={customData.content}
          images={images}
          isEditing={false}
          debug={false}
        />
      </div>

      {/* Footer Navigation */}
      <div className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
              ← Back to Marketplace
            </Link>
            <div className="flex gap-4">
              <Link href={`/marketplace/${productId}`}>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2" size={16} />
                  Standard View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}