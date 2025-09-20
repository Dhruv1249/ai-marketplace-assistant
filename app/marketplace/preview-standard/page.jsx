'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import HeartButton from '@/components/animated icon/HeartButton';
import AddToCartButton from '@/components/animated icon/AddToCartButton';
import Loading from '@/app/loading';

export default function StandardPreviewPage() {
  // All hooks must be at the top
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // Load preview data from localStorage
    try {
      const previewData = localStorage.getItem('standardPreviewData');
      console.log('Raw preview data:', previewData); // Debug log
      if (previewData) {
        const data = JSON.parse(previewData);
        console.log('Parsed preview data:', data); // Debug log
        console.log('Feature explanations:', data.featureExplanations); // Debug log
        setProductData(data);
      }
    } catch (error) {
      console.error('Error loading preview data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions - Use actual uploaded images for preview
  const getProductImages = () => {
    // For preview, we'll try to use the actual uploaded images from the creation flow
    const images = [];
    
    // Try to get the actual uploaded images from the creation flow
    try {
      const createFlowData = localStorage.getItem('previewImages');
      if (createFlowData) {
        const uploadedImages = JSON.parse(createFlowData);
        uploadedImages.forEach((imageUrl, index) => {
          images.push({
            id: index === 0 ? 'thumbnail' : `additional-${index}`,
            label: index === 0 ? 'Image 1 (Thumbnail)' : `Image ${index + 1}`,
            url: imageUrl,
            hasImage: true
          });
        });
      }
    } catch (error) {
      console.log('No uploaded images found for preview');
    }
    
    // If no uploaded images, show placeholder images
    if (images.length === 0) {
      // Show at least one image (thumbnail)
      images.push({
        id: 'thumbnail',
        label: 'Image 1 (Thumbnail)',
        url: '/api/placeholder/600/400',
        hasImage: true
      });
      
      // Add 2-3 additional placeholder images for preview
      for (let i = 1; i <= 2; i++) {
        images.push({
          id: `additional-${i}`,
          label: `Image ${i + 1}`,
          url: '/api/placeholder/600/400',
          hasImage: true
        });
      }
    }
    
    return images;
  };

  const nextImage = () => {
    const images = getProductImages();
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    const images = getProductImages();
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const renderTabContent = () => {
    if (!productData) return null;

    console.log('Rendering tab content with productData:', productData); // Debug log

    const formattedProduct = {
      description: productData.description,
      features: productData.features || [],
      featureExplanations: productData.featureExplanations || {},
      specifications: productData.specifications || {}
    };

    console.log('Formatted product for tab:', formattedProduct); // Debug log

    switch (activeTab) {
      case 'description':
        return (
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              {formattedProduct.description}
            </p>
          </div>
        );
      case 'features':
        console.log('Rendering features tab:', formattedProduct.features); // Debug log
        console.log('Feature explanations:', formattedProduct.featureExplanations); // Debug log
        return (
          <div className="space-y-6">
            {formattedProduct.features.length > 0 ? (
              <div className="space-y-4">
                {formattedProduct.features.map((feature, index) => {
                  console.log(`Feature ${index}:`, feature, 'Explanation:', formattedProduct.featureExplanations[feature]); // Debug log
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <h4 className="font-medium text-gray-900">{feature}</h4>
                      </div>
                      {formattedProduct.featureExplanations[feature] && (
                        <div className="ml-5 mt-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800 leading-relaxed">
                            {formattedProduct.featureExplanations[feature]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No features listed for this product.</p>
            )}
          </div>
        );
      case 'specifications':
        return (
          <div className="space-y-4">
            {Object.keys(formattedProduct.specifications).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formattedProduct.specifications).map(([key, value], index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specifications available for this product.</p>
            )}
          </div>
        );
      case 'reviews':
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Preview Not Available</h1>
          <p className="text-gray-600 mb-6">No preview data found.</p>
          <Button onClick={() => window.close()}>
            Close Preview
          </Button>
        </div>
      </div>
    );
  }

  const productImages = getProductImages();

  // Convert the JSON data to the expected format
  const formattedProduct = {
    id: productData.id,
    title: productData.title,
    description: productData.description,
    price: productData.pricing?.discount?.finalPrice || productData.pricing?.basePrice || 0,
    originalPrice: productData.pricing?.discount?.enabled ? productData.pricing?.basePrice : null,
    currency: 'USD',
    images: productImages,
    rating: 4.8, // Default rating - implement actual rating system
    reviews: 0, // Keep empty as requested
    seller: {
      name: 'AI Marketplace Seller', // Default seller - implement actual seller system
      rating: 4.9,
      totalSales: 1250,
    },
    category: 'Product', // Default category - add to product data
    inStock: true, // Default - implement inventory system
    stockCount: 15, // Default - implement inventory system
    features: productData.features || [],
    featureExplanations: productData.featureExplanations || {},
    specifications: productData.specifications || {},
    shipping: {
      free: true, // Default - implement shipping system
      estimatedDays: '2-3 business days',
    },
    policies: {
      returns: '30-day return policy', // Default - implement policy system
      warranty: '2-year manufacturer warranty',
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Header */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                PREVIEW MODE
              </div>
              <span className="text-blue-700 font-medium">Standard Product Page Preview</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.close()}>
              Close Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="bg-yellow-50 border-b border-yellow-200 p-2">
        <div className="max-w-7xl mx-auto px-4 text-xs">
          <strong>Debug:</strong> Features: {productData.features?.length || 0}, 
          Feature Explanations: {Object.keys(productData.featureExplanations || {}).length}, 
          Images: {productImages.length}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Home</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Marketplace</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{formattedProduct.category}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 truncate">{formattedProduct.title}</span>
          </div>
        </div>
      </div>

      {/* Back Button and Custom Page Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center text-gray-600">
            <ArrowLeft size={20} className="mr-2" />
            Back to Marketplace
          </span>
          {productData.hasCustomPage && (
            <Button variant="outline" size="sm" disabled>
              <Globe className="mr-2" size={16} />
              View Custom Page
            </Button>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={productImages[currentImageIndex]?.url}
                  alt={productImages[currentImageIndex]?.label || 'Product Image'}
                  className="w-full h-full object-cover"
                />
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              
              {/* Dynamic Thumbnail Grid - Only show if more than 1 image */}
              {productImages.length > 1 && (
                <div className={`grid gap-2 ${
                  productImages.length === 2 ? 'grid-cols-2' :
                  productImages.length === 3 ? 'grid-cols-3' :
                  'grid-cols-4'
                }`}>
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square bg-gray-200 rounded-lg flex flex-col items-center justify-center text-xs p-2 overflow-hidden ${
                        currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Image Counter */}
              {productImages.length > 1 && (
                <div className="text-center mt-2 text-sm text-gray-500">
                  {currentImageIndex + 1} of {productImages.length} images (Preview)
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formattedProduct.title}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${
                        i < Math.floor(formattedProduct.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {formattedProduct.rating} ({formattedProduct.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${formattedProduct.price.toFixed(2)}
                </span>
                {formattedProduct.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${formattedProduct.originalPrice.toFixed(2)}
                  </span>
                )}
                {formattedProduct.originalPrice && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    Save ${(formattedProduct.originalPrice - formattedProduct.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {formattedProduct.inStock ? (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    In Stock ({formattedProduct.stockCount} available)
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <AddToCartButton productId={productData?.id} quantity={quantity} />
                  </div>
                  <Button variant="outline" size="lg">
                    <HeartButton />
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 size={20} />
                  </Button>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{formattedProduct.seller.name}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" />
                      {formattedProduct.seller.rating} • {formattedProduct.seller.totalSales} sales
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Store
                  </Button>
                </div>
              </div>

              {/* Shipping & Policies */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Truck size={16} className="mr-2" />
                  {formattedProduct.shipping.free ? 'Free shipping' : 'Shipping calculated at checkout'} • 
                  Arrives in {formattedProduct.shipping.estimatedDays}
                </div>
                <div className="flex items-center text-gray-600">
                  <RotateCcw size={16} className="mr-2" />
                  {formattedProduct.policies.returns}
                </div>
                <div className="flex items-center text-gray-600">
                  <Shield size={16} className="mr-2" />
                  {formattedProduct.policies.warranty}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('description')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'description' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('features')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'features' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Features ({formattedProduct.features.length})
              </button>
              <button 
                onClick={() => setActiveTab('specifications')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'specifications' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Specifications
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews (0)
              </button>
            </nav>
          </div>

          <div className="py-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}