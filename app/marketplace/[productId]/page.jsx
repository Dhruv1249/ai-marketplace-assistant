'use client';

import React from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const { productId } = params;

  // Sample product data - in a real app, this would be fetched based on productId
  const product = {
    id: productId,
    title: 'Premium Wireless Headphones',
    description: 'Experience exceptional sound quality with our premium wireless headphones. Featuring advanced noise cancellation technology, these headphones deliver crystal-clear audio whether you\'re listening to music, taking calls, or enjoying podcasts. The comfortable over-ear design ensures hours of comfortable listening, while the 30-hour battery life keeps you connected all day long.',
    price: 199.99,
    originalPrice: 249.99,
    currency: 'USD',
    images: [
      '/api/placeholder/600/400',
      '/api/placeholder/600/400',
      '/api/placeholder/600/400',
      '/api/placeholder/600/400',
    ],
    rating: 4.8,
    reviews: 124,
    seller: {
      name: 'TechGear Pro',
      rating: 4.9,
      totalSales: 1250,
    },
    category: 'Electronics',
    inStock: true,
    stockCount: 15,
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Bluetooth 5.0 connectivity',
      'Quick charge: 15 min = 3 hours playback',
      'Premium leather ear cushions',
      'Built-in microphone for calls',
    ],
    specifications: {
      'Brand': 'TechGear Pro',
      'Model': 'WH-1000XM5',
      'Color': 'Midnight Black',
      'Weight': '250g',
      'Frequency Response': '4Hz - 40kHz',
      'Battery Life': '30 hours',
      'Charging Time': '3 hours',
      'Connectivity': 'Bluetooth 5.0, 3.5mm jack',
    },
    shipping: {
      free: true,
      estimatedDays: '2-3 business days',
    },
    policies: {
      returns: '30-day return policy',
      warranty: '2-year manufacturer warranty',
    }
  };

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
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
            <span className="text-gray-900">{product.category}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 truncate">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/marketplace" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} className="mr-2" />
          Back to Marketplace
        </Link>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <span className="text-gray-400">Product Image {currentImageIndex + 1}</span>
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
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-xs ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    Img {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    In Stock ({product.stockCount} available)
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
                  <Button size="lg" className="flex-1" disabled={!product.inStock}>
                    <ShoppingCart className="mr-2" size={20} />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart size={20} />
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
                    <p className="font-medium text-gray-900">{product.seller.name}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" />
                      {product.seller.rating} • {product.seller.totalSales} sales
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
                  {product.shipping.free ? 'Free shipping' : 'Shipping calculated at checkout'} • 
                  Arrives in {product.shipping.estimatedDays}
                </div>
                <div className="flex items-center text-gray-600">
                  <RotateCcw size={16} className="mr-2" />
                  {product.policies.returns}
                </div>
                <div className="flex items-center text-gray-600">
                  <Shield size={16} className="mr-2" />
                  {product.policies.warranty}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
                Description
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Features
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Specifications
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Reviews ({product.reviews})
              </button>
            </nav>
          </div>

          <div className="py-8">
            {/* Description Tab */}
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
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