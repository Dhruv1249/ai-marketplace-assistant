'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function ProductPage() {
  const params = useParams();
  const { productId } = params;
  
  // All hooks must be at the top, before any conditional returns
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

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

  // Helper functions - Dynamic image loading based on available images
  const getProductImages = () => {
    if (!productData?.standard) return [];
    
    const product = productData.standard;
    const images = [];
    
    // Add thumbnail as first image if it exists
    if (product.images?.thumbnail) {
      images.push({
        id: 'thumbnail',
        label: 'Image 1 (Thumbnail)',
        url: `/api/products/${productId}/images/${product.images.thumbnail}`,
        hasImage: true
      });
    }
    
    // Add additional images dynamically based on what's available
    const additionalImages = product.images?.additional || [];
    additionalImages.forEach((imageName, index) => {
      images.push({
        id: `additional-${index + 1}`,
        label: `Image ${images.length + 1}`,
        url: `/api/products/${productId}/images/${imageName}`,
        hasImage: true
      });
    });
    
    // If no images at all, add a placeholder
    if (images.length === 0) {
      images.push({
        id: 'placeholder',
        label: 'Product Image',
        url: '/api/placeholder/600/400',
        hasImage: false
      });
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
    if (!productData?.standard) return null;

    const product = productData.standard;
    const formattedProduct = {
      description: product.description,
      features: product.features || [],
      featureExplanations: product.featureExplanations || {},
      specifications: product.specifications || {}
    };

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
        return (
          <div className="space-y-6">
            {formattedProduct.features.length > 0 ? (
              <div className="space-y-4">
                {formattedProduct.features.map((feature, index) => (
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
                ))}
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

  // Loading state
  if (loading) {
    return <Loading />;
  }

  // Error state
  if (error || !productData?.standard) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested product could not be found.'}</p>
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

  const product = productData.standard;
  const productImages = getProductImages();

  // Convert the JSON data to the expected format
  const formattedProduct = {
    id: productId,
    title: product.title,
    description: product.description,
    price: product.pricing?.discount?.finalPrice || product.pricing?.basePrice || 0,
    originalPrice: product.pricing?.discount?.enabled ? product.pricing?.basePrice : null,
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
    features: product.features || [],
    featureExplanations: product.featureExplanations || {},
    specifications: product.specifications || {},
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
            <span className="text-gray-900">{formattedProduct.category}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 truncate">{formattedProduct.title}</span>
          </div>
        </div>
      </div>

      {/* Back Button and Custom Page Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/marketplace" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} className="mr-2" />
            Back to Marketplace
          </Link>
          {product.hasCustomPage && (
            <Link href={`/marketplace/${productId}/custom`}>
              <Button variant="outline" size="sm">
                <Globe className="mr-2" size={16} />
                View Custom Page
              </Button>
            </Link>
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
                {productImages[currentImageIndex]?.hasImage ? (
                  <img
                    src={productImages[currentImageIndex].url}
                    alt={productImages[currentImageIndex].label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/600/400';
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-gray-400 text-lg font-medium">
                      {productImages[currentImageIndex]?.label || 'Product Image'}
                    </span>
                    <div className="text-gray-300 text-sm mt-2">
                      No image available
                    </div>
                  </div>
                )}
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
                      {image.hasImage ? (
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`flex flex-col items-center justify-center w-full h-full ${image.hasImage ? 'hidden' : ''}`}>
                        <span className="font-medium">{index + 1}</span>
                        <span className="text-gray-500 mt-1">
                          {index === 0 && productImages.length > 1 ? 'Main' : 
                           index === 0 ? 'Image' : 'View'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Image Counter */}
              {productImages.length > 1 && (
                <div className="text-center mt-2 text-sm text-gray-500">
                  {currentImageIndex + 1} of {productImages.length} images
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

              {/* Custom Page Link */}
              {product.hasCustomPage && (
                <div className="mb-6">
                  <Link href={`/marketplace/${productId}/custom`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Globe className="mr-2" size={16} />
                      View Enhanced Custom Page
                    </Button>
                  </Link>
                </div>
              )}

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
                    <AddToCartButton />
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

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Related Product {item}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Related Product {item}</h3>
                <p className="text-gray-600 text-sm mb-2">Short description...</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">$99.99</span>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}