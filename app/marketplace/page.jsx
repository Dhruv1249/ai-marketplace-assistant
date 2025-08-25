"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Search, Filter, Star, Eye, Plus } from 'lucide-react';
import styled from 'styled-components';

// ✅ Custom Buy Button with Tooltip
const BuyButton = ({ price }) => {
  return (
    <StyledWrapper>
      <div data-tooltip={`Price: $${price}`} className="button">
        <div className="button-wrapper">
          <div className="text">Buy Now</div>
          <span className="icon">
            <svg
              viewBox="0 0 16 16"
              className="bi bi-cart2"
              fill="currentColor"
              height={16}
              width={16}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
            </svg>
          </span>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    --width: 100px;
    --height: 35px;
    --tooltip-height: 35px;
    --tooltip-width: 90px;
    --gap-between-tooltip-to-button: 18px;
    --button-color: #222;
    --tooltip-color: #fff;
    width: var(--width);
    height: var(--height);
    background: var(--button-color);
    position: relative;
    text-align: center;
    border-radius: 0.45em;
    font-family: "Arial";
    transition: background 0.3s;
  }

  .button::before {
    position: absolute;
    content: attr(data-tooltip);
    width: var(--tooltip-width);
    height: var(--tooltip-height);
    background-color: #555;
    font-size: 0.9rem;
    color: #fff;
    border-radius: .25em;
    line-height: var(--tooltip-height);
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) + 10px);
    left: calc(50% - var(--tooltip-width) / 2);
  }

  .button::after {
    position: absolute;
    content: '';
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-top-color: #555;
    left: calc(50% - 10px);
    bottom: calc(100% + var(--gap-between-tooltip-to-button) - 10px);
  }

  .button::after,
  .button::before {
    opacity: 0;
    visibility: hidden;
    transition: all 0.5s;
  }

  .text {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-wrapper,
  .text,
  .icon {
    overflow: hidden;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    color: #fff;
  }

  .text {
    top: 0;
  }

  .text,
  .icon {
    transition: top 0.5s;
  }

  .icon {
    color: #fff;
    top: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon svg {
    width: 24px;
    height: 24px;
  }

  .button:hover {
    background: #222;
  }

  .button:hover .text {
    top: -100%;
  }

  .button:hover .icon {
    top: 0;
  }

  .button:hover:before,
  .button:hover:after {
    opacity: 1;
    visibility: visible;
  }

  .button:hover:after {
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) - 20px);
  }

  .button:hover:before {
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button));
  }
`;

export default function Marketplace() {
  // ✅ Products list (unchanged)
  const products = [
    {
      id: '1',
      title: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 99.99,
      currency: 'USD',
      image: '/api/placeholder/300/200',
      rating: 4.8,
      reviews: 124,
      seller: 'TechGear Pro',
      category: 'Electronics',
      featured: true,
    },
    {
      id: '2',
      title: 'Organic Cotton T-Shirt',
      description: 'Comfortable, sustainable t-shirt made from 100% organic cotton.',
      price: 29.99,
      currency: 'USD',
      image: '/api/placeholder/300/200',
      rating: 4.6,
      reviews: 89,
      seller: 'EcoWear',
      category: 'Clothing',
      featured: false,
    },
    {
      id: '3',
      title: 'Smart Home Security Camera',
      description: 'AI-powered security camera with motion detection and cloud storage.',
      price: 49.99,
      currency: 'USD',
      image: '/api/placeholder/300/200',
      rating: 4.7,
      reviews: 203,
      seller: 'SecureHome',
      category: 'Electronics',
      featured: true,
    },
    {
      id: '4',
      title: 'Artisan Coffee Beans',
      description: 'Single-origin coffee beans roasted to perfection by local artisans.',
      price: 24.99,
      currency: 'USD',
      image: '/api/placeholder/300/200',
      rating: 4.9,
      reviews: 156,
      seller: 'Mountain Roasters',
      category: 'Food & Beverage',
      featured: false,
    },
    {
      id: '5',
      title: 'Yoga Mat Premium',
      description: 'Non-slip yoga mat with excellent grip and cushioning for all practice levels.',
      price: 79.99,
      currency: 'USD',
      image: '/api/placeholder/300/200',
      rating: 4.5,
      reviews: 67,
      seller: 'ZenFit',
      category: 'Sports & Fitness',
      featured: false,
    },
    {
      id: '6',
      title: 'Handcrafted Wooden Watch',
      description: 'Unique timepiece crafted from sustainable bamboo with leather strap.',
      price: 59.99,
      currency: 'USD',
      image: '/api/placeholder/300/200',
      rating: 4.4,
      reviews: 43,
      seller: 'WoodCraft Co',
      category: 'Accessories',
      featured: true,
    },
  ];

  const categories = [
    'All Categories',
    'Electronics',
    'Clothing',
    'Food & Beverage',
    'Sports & Fitness',
    'Accessories',
    'Home & Garden',
  ];

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <span className="text-gray-400">Product Image</span>
        </div>
        {product.featured && (
  <div className="absolute top-2 left-2 bg-gradient-to-r from-indigo-200 to-purple-300 text-gray-800 px-2 py-1 rounded text-xs font-semibold shadow">
    Featured
  </div>
)}
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
          <Eye size={16} className="text-gray-600" />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
            {product.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Seller */}
        <p className="text-xs text-gray-500 mb-3">
          by {product.seller}
        </p>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            ${product.price}
          </div>
          <div className="flex space-x-2">
            <Link href={`/marketplace/${product.id}`}>
              <Button size="sm" variant="outline">
                View
              </Button>
            </Link>
            {/* ✅ Custom Buy Button Replaced Here */}
            <BuyButton price={product.price} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Marketplace
              </h1>
              <p className="text-gray-600">
                Discover amazing products created with AI assistance
              </p>
            </div>
            <div className="mt-4 md:mt-0">
             <Link href="/create">
  <Button
    className="bg-gradient-to-r from-indigo-200 to-purple-300 text-gray-800 border-0 shadow-none hover:from-indigo-300 hover:to-purple-400"
  >
    <Plus className="mr-2" size={16} />
    Create Product
  </Button>
</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-48">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:w-48">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>

            <Button variant="outline">
              <Filter className="mr-2" size={16} />
              Filters
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {products.length} products
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <button className="p-2 text-blue-600 bg-blue-50 rounded">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="h-1 bg-current rounded-sm"></div>
                <div className="h-1 bg-current rounded-sm"></div>
                <div className="h-1 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-200 to-purple-300 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to sell your products?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join thousands of sellers using AI to create compelling product listings 
            that convert visitors into customers.
          </p>
          <Link href="/create">
            <Button size="lg" variant="secondary">
              <Plus className="mr-2" size={20} />
              Start Selling Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
