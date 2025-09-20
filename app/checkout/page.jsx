'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import CheckoutCTA from '@/components/animated icon/CheckOut';
import styled from 'styled-components';

// Local storage helpers
const CART_KEY = 'cartItems';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((it) => it && typeof it.productId !== 'undefined');
  } catch (_) {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (_) {}
}

async function fetchProductSummary(productId) {
  try {
    const resp = await fetch(`/api/products/${productId}`);
    const data = await resp.json();

    // Default fallbacks
    let title = `Product ${productId}`;
    let price = 0;
    let originalPrice = null;
    let image = '/api/placeholder/150/150';
    let currency = 'USD';

    if (data && data.success) {
      // File-based standard format (see app/marketplace/[productId]/page.jsx)
      if (data.standard) {
        const std = data.standard || {};
        const pricing = std.pricing || {};
        const basePrice = typeof pricing.basePrice === 'number' ? pricing.basePrice : 0;
        const disc = pricing.discount || {};
        let finalPrice = basePrice;
        if (disc.enabled) {
          if (disc.type === 'percentage' && typeof disc.value === 'number') {
            finalPrice = Math.max(0, +(basePrice * (1 - disc.value / 100)).toFixed(2));
          } else if (disc.type === 'fixed' && typeof disc.value === 'number') {
            finalPrice = Math.max(0, +(basePrice - disc.value).toFixed(2));
          } else if (typeof disc.finalPrice === 'number') {
            finalPrice = disc.finalPrice;
          }
          originalPrice = basePrice;
        }
        title = std.title || title;
        price = typeof finalPrice === 'number' ? finalPrice : basePrice;
        currency = 'USD';

        const thumb = std.images?.thumbnail;
        if (thumb) {
          image = `/api/products/${productId}/images/${thumb}`;
        }
      } else if (data.product) {
        // Alternative shape if API returns a product doc
        const p = data.product;
        title = p.title || title;
        price = typeof p.price === 'number' ? p.price : price;
        originalPrice = typeof p.originalPrice === 'number' ? p.originalPrice : originalPrice;
        currency = p.currency || currency;
        if (p.imageUrl) image = p.imageUrl;
      }
    }

    return { productId: String(productId), title, price, originalPrice, image, currency };
  } catch (e) {
    return { productId: String(productId), title: `Product ${productId}`, price: 0, originalPrice: null, image: '/api/placeholder/150/150', currency: 'USD' };
  }
}

const ToastNotice = styled.div`
  position: fixed;
  top: 2%;
  right: 2%;
  z-index: 1000;
  .notification-container {
    --content-color: black;
    --background-color: #f3f3f3;
    --font-size-content: 0.85em;
    --icon-size: 1em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    list-style: none;
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    color: var(--content-color);
  }
  .notification-item {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1em;
    overflow: hidden;
    padding: 10px 15px;
    border-radius: 6px;
    box-shadow: rgba(111, 111, 111, 0.2) 0px 8px 24px;
    background-color: var(--background-color);
    transition: all 250ms ease;
    --grid-color: rgba(225, 225, 225, 0.7);
    background-image: linear-gradient(
        0deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      );
    background-size: 55px 55px;
  }
  .notification-content { display: flex; align-items: center; gap: 0.5em; }
  .notification-icon { display: flex; align-items: center; }
  .notification-text { font-size: var(--font-size-content); user-select: none; }
  .notification-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 1px;
    background: var(--content-color);
    width: 100%;
    transform: translateX(100%);
    animation: progressBar 5s linear forwards infinite;
  }
  .warning {
    color: #78350f;
    background-color: #ffe57e;
    --grid-color: rgba(245, 159, 11, 0.25);
    background-image: linear-gradient(
        0deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 23%,
        var(--grid-color) 24%,
        var(--grid-color) 25%,
        transparent 26%,
        transparent 73%,
        var(--grid-color) 74%,
        var(--grid-color) 75%,
        transparent 76%,
        transparent
      );
  }
  .warning svg { color: #78350f; width: var(--icon-size); height: var(--icon-size); }
  @keyframes progressBar { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
`;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cartItems, setCartItems] = useState([]); // [{ productId, quantity }]
  const [details, setDetails] = useState({}); // map: productId -> summary
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Controlled checkout form fields
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const emailOk = /.+@.+\..+/.test(form.email.trim());
  const canCheckout =
    form.fullName.trim() &&
    emailOk &&
    form.address1.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.zip.trim() &&
    form.country.trim();

  // Toast notification for disabled checkout click
  const [showClickAlert, setShowClickAlert] = useState(false);
  const hideToastRef = useRef(null);
  const handleDisabledCheckoutClick = () => {
    if (canCheckout) return;
    setShowClickAlert(true);
    if (hideToastRef.current) clearTimeout(hideToastRef.current);
    hideToastRef.current = setTimeout(() => setShowClickAlert(false), 4000);
  };
  useEffect(() => {
    return () => { if (hideToastRef.current) clearTimeout(hideToastRef.current); };
  }, []);
  
  // Load cart initially
  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  // Auto-add item from query params once
  useEffect(() => {
    const pid = searchParams?.get('productId');
    const qty = parseInt(searchParams?.get('quantity') || '1', 10);

    if (pid) {
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((it) => String(it.productId) === String(pid));
        let next;
        if (existingIndex >= 0) {
          next = prev.map((it, i) => i === existingIndex ? { ...it, quantity: Math.max(1, (it.quantity || 1) + (isNaN(qty) ? 1 : qty)) } : it);
        } else {
          next = [...prev, { productId: String(pid), quantity: isNaN(qty) ? 1 : Math.max(1, qty) }];
        }
        saveCart(next);
        return next;
      });
      // Clean the URL to avoid duplicate adds on refresh
      router.replace('/checkout');
    }
  }, [searchParams, router]);

  // Fetch details for all items in cart
  useEffect(() => {
    const uniqueProductIds = [...new Set(cartItems.map((it) => String(it.productId)))];
    if (uniqueProductIds.length === 0) {
      setDetails({});
      return;
    }

    let cancelled = false;
    setLoadingDetails(true);
    Promise.all(uniqueProductIds.map((id) => fetchProductSummary(id)))
      .then((summaries) => {
        if (cancelled) return;
        const map = {};
        summaries.forEach((s) => { map[s.productId] = s; });
        setDetails(map);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false);
      });

    return () => { cancelled = true; };
  }, [cartItems]);

  
  const totals = useMemo(() => {
    let subtotal = 0;
    for (const item of cartItems) {
      const d = details[String(item.productId)];
      const price = d?.price ?? 0;
      const qty = item.quantity || 1;
      subtotal += price * qty;
    }
    const FREE_SHIPPING_THRESHOLD = 500;
    const SHIPPING_FLAT_RATE = 25; // Flat shipping fee under threshold
    const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? SHIPPING_FLAT_RATE : 0);
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [cartItems, details]);

  const updateQuantity = (productId, nextQty) => {
    setCartItems((prev) => {
      const next = prev.map((it) =>
        String(it.productId) === String(productId)
          ? { ...it, quantity: Math.max(1, nextQty) }
          : it
      );
      saveCart(next);
      return next;
    });
  };

  const removeItem = (productId) => {
    setCartItems((prev) => {
      const next = prev.filter((it) => String(it.productId) !== String(productId));
      saveCart(next);
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    saveCart([]);
  };

  // Removed proceedToPayment in favor of animated CTA that redirects to /payment

  return (
    <div className="min-h-screen bg-white">
      {showClickAlert && (
        <ToastNotice role="alert" aria-live="assertive">
          <ul className="notification-container">
            <li className="notification-item warning">
              <div className="notification-content">
                <div className="notification-icon">
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div className="notification-text">Fill all required fields to proceed.</div>
              </div>
              <div className="notification-icon notification-close" onClick={() => setShowClickAlert(false)} style={{ cursor: 'pointer' }}>
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 17.94 6M18 18 6.06 6" />
                </svg>
              </div>
              <div className="notification-progress-bar" />
            </li>
          </ul>
        </ToastNotice>
      )}
                  <div className="border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Checkout</h1>
          <Link href="/marketplace" className="text-sm text-blue-600 hover:underline">Continue Shopping</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Customer details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="John Doe" required value={form.fullName} onChange={setField('fullName')} />
              <Input label="Email" type="email" placeholder="john@example.com" required value={form.email} onChange={setField('email')} error={form.email && !emailOk ? 'Enter a valid email' : ''} />
              <Input label="Phone" type="tel" placeholder="(123) 456-7890" value={form.phone} onChange={setField('phone')} />
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Input label="Address Line 1" placeholder="123 Main St" required value={form.address1} onChange={setField('address1')} /></div>
              <div className="md:col-span-2"><Input label="Address Line 2" placeholder="Apt, suite, etc. (optional)" value={form.address2} onChange={setField('address2')} /></div>
              <Input label="City" placeholder="San Francisco" required value={form.city} onChange={setField('city')} />
              <Input label="State/Province" placeholder="CA" required value={form.state} onChange={setField('state')} />
              <Input label="ZIP/Postal Code" placeholder="94105" required value={form.zip} onChange={setField('zip')} />
              <Input label="Country" placeholder="United States" required value={form.country} onChange={setField('country')} />
            </div>
          </div>

          {/* Removed old Payment placeholder section */}
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.length === 0 && (
                <div className="text-sm text-gray-600">
                  Your cart is empty. Add items from the marketplace.
                </div>
              )}

              {cartItems.map((item) => {
                const info = details[String(item.productId)];
                return (
                  <div key={item.productId} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={info?.image || '/api/placeholder/150/150'} alt={info?.title || 'Product'} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/api/placeholder/150/150'; }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{info?.title || `Product ${item.productId}`}</div>
                          <div className="text-sm text-gray-600">ID: {item.productId}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">${(info?.price ?? 0).toFixed(2)}</div>
                          {info?.originalPrice && (
                            <div className="text-xs text-gray-500 line-through">${info.originalPrice.toFixed(2)}</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border rounded-lg overflow-hidden">
                          <button className="px-3 py-1 hover:bg-gray-50" onClick={() => updateQuantity(item.productId, (item.quantity || 1) - 1)}>-</button>
                          <span className="px-4 py-1 border-x">{item.quantity || 1}</span>
                          <button className="px-3 py-1 hover:bg-gray-50" onClick={() => updateQuantity(item.productId, (item.quantity || 1) + 1)}>+</button>
                        </div>
                        <button className="text-sm text-red-600 hover:underline" onClick={() => removeItem(item.productId)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">{totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between text-base">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-center">
                {/* Animated checkout button gated by form completeness */}
                <div className={!canCheckout ? 'opacity-60 cursor-not-allowed' : ''} onClick={handleDisabledCheckoutClick}>
                  <CheckoutCTA canCheckout={!!canCheckout} />
                </div>
                              </div>
                            <Button size="md" variant="outline" className="w-full" disabled={cartItems.length === 0} onClick={clearCart}>
                Clear Cart
              </Button>
            </div>

            {loadingDetails && (
              <div className="mt-4 text-xs text-gray-500">Loading item details...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
