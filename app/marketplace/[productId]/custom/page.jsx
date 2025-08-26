'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';

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

        if (result.success) {
          setProductData(result);
        } else {
          setError(result.error || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading custom product page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/marketplace">
            <Button>
              <ArrowLeft className="mr-2" size={16} />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!productData?.custom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Custom Page Not Available</h1>
          <p className="text-gray-600 mb-6">This product doesn't have a custom page.</p>
          <div className="flex gap-4 justify-center">
            <Link href={`/marketplace/${productId}`}>
              <Button>
                <FileText className="mr-2" size={16} />
                View Standard Page
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline">
                <ArrowLeft className="mr-2" size={16} />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render custom page using JSON renderer
  const { custom, standard } = productData;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/marketplace" className="text-gray-500 hover:text-gray-700">
                Marketplace
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900">{standard.title}</span>
              <span className="text-gray-400">/</span>
              <span className="text-blue-600">Custom Page</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Placeholder for JSON renderer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Custom Page Renderer</h2>
          <p className="text-blue-700 mb-6">
            This is where the JSON-based custom page would be rendered using your template system.
          </p>
          
          {/* Display some custom data for now */}
          <div className="bg-white rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Page Data:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Template:</span>
                <span className="ml-2 text-gray-600 capitalize">
                  {custom.model?.metadata?.template?.replace('-', ' ') || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Features:</span>
                <span className="ml-2 text-gray-600">
                  {custom.content?.features?.length || 0} features
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Has Explanations:</span>
                <span className="ml-2 text-gray-600">
                  {Object.keys(custom.content?.featureExplanations || {}).length > 0 ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Pricing:</span>
                <span className="ml-2 text-gray-600">
                  ${custom.content?.pricing?.discount?.finalPrice || custom.content?.pricing?.basePrice || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-blue-600">
              Integrate your existing JSON renderer component here to display the custom page layout.
            </p>
          </div>
        </div>

        {/* Quick Product Info */}
        <div className="mt-8 bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{standard.title}</h3>
          <p className="text-gray-600 mb-4">{standard.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              ${standard.pricing?.discount?.finalPrice?.toFixed(2) || standard.pricing?.basePrice?.toFixed(2)}
              {standard.pricing?.discount?.enabled && (
                <span className="text-lg text-gray-500 line-through ml-2">
                  ${standard.pricing?.basePrice?.toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Link href={`/marketplace/${productId}`}>
                <Button variant="outline">
                  <FileText className="mr-2" size={16} />
                  Standard Page
                </Button>
              </Link>
              <Button>
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}