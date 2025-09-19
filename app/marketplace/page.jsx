"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Filter, Star, Eye, Plus } from 'lucide-react';
import styled from 'styled-components';
import GameOne from '@/components/animated icon/GameOn';
import Loading from '@/app/loading';
import Input from '@/components/animated icon/Search';
import { db, auth } from '@/app/login/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// ✅ Custom Buy Button with Tooltip
const BuyButton = ({ price }) => {
  return (
    <StyledWrapper>
      <div data-tooltip={`Price: ${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} className="button">
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
    --tooltip-width: 110px;
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [fsProducts, setFsProducts] = useState([]);
  const [fileProducts, setFileProducts] = useState([]);
  const [selectedSort, setSelectedSort] = useState('featured');

  // Force a hard reload once per visit to the marketplace page
  useEffect(() => {
    try {
      const key = 'marketplaceForceReload';
      const hasReloaded = sessionStorage.getItem(key) === 'true';
      if (!hasReloaded) {
        sessionStorage.setItem(key, 'true');
        window.location.reload();
      } else {
        // Clear the flag so that next time the user navigates back here, it reloads again
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      // If sessionStorage is unavailable for any reason, fall back to a single reload based on navigation type
      const entry = performance.getEntriesByType?.('navigation')?.[0];
      const isReload = entry?.type === 'reload';
      if (!isReload) {
        window.location.reload();
      }
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/list');
        const result = await response.json();

        if (result.success && result.products.length > 0) {
          // Convert products to marketplace format
          const formattedProducts = result.products.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price:
  product.pricing?.discount?.finalPrice !== undefined && product.pricing?.discount?.finalPrice !== null
    ? product.pricing.discount.finalPrice
    : (product.pricing?.basePrice !== undefined && product.pricing?.basePrice !== null
      ? product.pricing.basePrice
      : 0),
            currency: 'USD',
            // Use API route for product images
            image: product.images?.thumbnail 
              ? `/api/products/${product.id}/images/${product.images.thumbnail}`
              : '/images/placeholder.svg',
            rating: 4.8, // Default - implement rating system
            reviews: 124, // Default - implement review system
            seller: 'AI Marketplace Seller', // Default - implement seller system
            category: 'Product', // Default - add category to product data
            featured: Math.random() > 0.5, // Random for now
            hasCustomPage: product.hasCustomPage
          }));
          setProducts(formattedProducts);
        } else {
          // Fallback to sample data if no products found
          setProducts([
            {
              id: 'sample-1',
              title: 'Sample Product - Create Your First Product!',
              description: 'This is a sample product. Use the "Create Product" button to add your first real product to the marketplace.',
              price: 99.99,
              currency: 'USD',
              image: '/images/placeholder.svg',
              rating: 4.8,
              reviews: 0,
              seller: 'Sample Seller',
              category: 'Sample',

              
              featured: true,
              hasCustomPage: false
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to sample data on error
        setProducts([
          {
            id: 'sample-1',
            title: 'Sample Product - Create Your First Product!',
            description: 'This is a sample product. Use the "Create Product" button to add your first real product to the marketplace.',
            price: 99.99,
            currency: 'USD',
            image: '/images/placeholder.svg',
            rating: 4.8,
            reviews: 0,
            seller: 'Sample Seller',
            category: 'Sample',
            featured: true,
            hasCustomPage: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    'All Categories',
    'Electronics',
    'Clothing',
    'Food & Beverage',
    'Sports & Fitness',
    'Accessories',
    'Home & Garden',
  ];

  // Prefetch published products from Firestore immediately (without waiting for auth)
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'products'), where('published', '==', true)));
        const mapped = snap.docs.map((doc) => {
          const d = doc.data() || {};
          const firstImage = Array.isArray(d.images) && d.images.length > 0 ? d.images[0] : undefined;
          const priceCandidate =
            d.price ??
            d.pricing?.discount?.finalPrice ??
            d.pricing?.basePrice ??
            0;

          return {
            id: doc.id,
            title: d.title || d.name || 'Untitled Product',
            description: d.description || d.metaDescription || '',
            price: Number(priceCandidate) || 0,
            currency: d.currency || 'USD',
            image: d.image || d.imageUrl || firstImage || '/images/placeholder.svg',
            rating: typeof d.rating === 'number' ? d.rating : 4.8,
            reviews: typeof d.reviews === 'number' ? d.reviews : 0,
            seller: d.seller || d.sellerName || 'Marketplace Seller',
            category: d.category || 'Product',
            featured: !!d.featured,
            hasCustomPage: !!d.hasCustomPage,
          };
        });

        setProducts((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          for (const p of mapped) byId.set(p.id, p);
          return Array.from(byId.values());
        });
      } catch (e) {
        // Ignore errors here; listener below will still run
      }
    })();
  }, []);

   useEffect(() => {
    let unsubscribe = null;

    const mergeSnapshotIntoProducts = (snapshot) => {
      const mapped = snapshot.docs.map((doc) => {
        const d = doc.data() || {};
        const firstImage = Array.isArray(d.images) && d.images.length > 0 ? d.images[0] : undefined;
        const priceCandidate =
          d.price ??
          d.pricing?.discount?.finalPrice ??
          d.pricing?.basePrice ??
          0;

        return {
          id: doc.id,
          title: d.title || d.name || "Untitled Product",
          description: d.description || d.metaDescription || "",
          price: Number(priceCandidate) || 0,
          currency: d.currency || "USD",
          image: d.image || d.imageUrl || firstImage || "/images/placeholder.svg",
          rating: typeof d.rating === "number" ? d.rating : 4.8,
          reviews: typeof d.reviews === "number" ? d.reviews : 0,
          seller: d.seller || d.sellerName || "Marketplace Seller",
          category: d.category || "Product",
          featured: !!d.featured,
          hasCustomPage: !!d.hasCustomPage,
        };
      });

      setProducts((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        for (const p of mapped) byId.set(p.id, p); // Firestore overrides by id
        return Array.from(byId.values());
      });
    };

    const startListener = (q) => {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          mergeSnapshotIntoProducts(snapshot);
        },
        (err) => {
          // Suppress noisy errors in production; warn in dev and keep API data
          if (process.env.NODE_ENV !== "production") {
            console.warn("Firestore subscription blocked/failed. Using API-only data.", err?.code || err);
          }
        }
      );
    };

    const stopListener = () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };

    // React to auth changes: when signed in, listen to all products;
    // when signed out, attempt published-only (if your rules allow it). Otherwise keep API-only data.
    const off = onAuthStateChanged(auth, (u) => {
      stopListener();
      if (u) {
        // Signed-in: listen to all products
        startListener(collection(db, "products"));
      } else {
        // Signed-out: try published-only view; if rules disallow, the error is handled above
        try {
          startListener(query(collection(db, "products"), where("published", "==", true)));
        } catch {
          // If query construction fails for any reason, just stay with API data
        }
      }
    });

    return () => {
      stopListener();
      off();
    };
  }, []);

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-gray-200 items-center justify-center hidden">
            <span className="text-gray-400">Product Image</span>
          </div>
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
            ${product.price.toFixed(2)}
          </div>
          <div className="flex space-x-2">
            <Link href={product.hasCustomPage ? `/marketplace/${product.id}/custom` : `/marketplace/${product.id}`}>
              <Button size="sm" variant="outline">
                View
              </Button>
            </Link>
            <Link href={`/marketplace/${product.id}`}>
              <BuyButton price={product.price} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const normalized = (s) => (s || '').toString().toLowerCase();
  const filteredProducts = products.filter((p) => {
    const q = normalized(searchQuery);
    if (!q) return true;
    return [p.title, p.description, p.seller, p.category].some((f) => normalized(f).includes(q));
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (selectedSort) {
      case 'featured': {
        const af = a.featured ? 1 : 0;
        const bf = b.featured ? 1 : 0;
        return bf - af;
      }
      case 'priceAsc':
        return (a.price ?? 0) - (b.price ?? 0);
      case 'priceDesc':
        return (b.price ?? 0) - (a.price ?? 0);
      case 'ratingDesc':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'newest': {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      }
      default:
        return 0;
    }
  });

  if (loading) {
    return <Loading />;
  }

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
                <GameOne>
                  Create Product
                </GameOne>
              
            
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." />
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
              <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="featured">Sort by: Featured</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="ratingDesc">Rating: High to Low</option>
                <option value="newest">Newest First</option>
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
            Showing {filteredProducts.length} products
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
          {sortedProducts.map((product) => (
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