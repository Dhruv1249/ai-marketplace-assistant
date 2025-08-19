"use client";

import React, { useState } from 'react';

function Hero({ title, description }) {
  return (
    <div className="border-b pb-4 mb-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title || 'Product Title'}</h2>
      <p className="text-gray-700 whitespace-pre-line">{description || 'Product description will appear here.'}</p>
    </div>
  );
}

function Gallery({ images = [] }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasImages = images && images.length > 0;
  
  if (!hasImages) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3">
          <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
            <span className="text-gray-400">Main Image</span>
          </div>
        </div>
        <div className="lg:col-span-1 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-2 overflow-auto max-h-[60vh] pr-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded bg-gray-100 flex items-center justify-center text-gray-300">IMG</div>
          ))}
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      <div className="lg:col-span-3">
        <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={selectedImage} 
            alt={`Product image ${selectedImageIndex + 1}`} 
            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-200 hover:scale-105" 
          />
          
          {/* Navigation arrows for main image */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 shadow-lg border border-gray-200"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 shadow-lg border border-gray-200"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
      
      <div className="lg:col-span-1 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-2 overflow-auto max-h-[60vh] pr-1">
        {images.map((src, i) => (
          <div 
            key={i} 
            className={`aspect-square rounded overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200 ${
              selectedImageIndex === i 
                ? 'ring-2 ring-blue-500 ring-offset-2' 
                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
            }`}
            onClick={() => setSelectedImageIndex(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={src} 
              alt={`Thumbnail ${i + 1}`} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Features({ features = [], featureExplanations = {} }) {
  const items = features && features.length ? features : [
    'Key feature one',
    'Key feature two',
    'Key feature three',
  ];
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
      <div className="space-y-4">
        {items.map((f, i) => (
          <div key={i} className="border-l-4 border-blue-400 pl-4">
            <h4 className="font-medium text-gray-900 mb-1">{f}</h4>
            {featureExplanations[f] && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {featureExplanations[f]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Specs({ specifications = {} }) {
  const entries = Object.entries(specifications);
  const rows = entries.length ? entries : [['Specification', 'Value']];
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {rows.slice(0, 8).map(([k, v], i) => (
              <tr key={i}>
                <td className="px-4 py-2 bg-gray-50 text-gray-700 font-medium w-1/3">{k}</td>
                <td className="px-4 py-2 text-gray-800">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CTA() {
  return (
    <div className="mt-6">
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add to Cart</button>
    </div>
  );
}

function GalleryFocused({ content, images }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Gallery images={images} />
      </div>
      <div>
        <Hero title={content?.title} description={content?.description} />
        <Features features={content?.features} featureExplanations={content?.featureExplanations} />
        <Specs specifications={content?.specifications} />
        <CTA />
      </div>
    </div>
  );
}

function FeatureBlocks({ content, images }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const feats = content?.features?.length ? content.features : ['Feature A', 'Feature B', 'Feature C'];
  const explanations = content?.featureExplanations || {};
  const hasImages = images && images.length > 0;
  
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <Hero title={content?.title} description={content?.description} />
          <CTA />
        </div>
        <div>
          <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center relative group">
            {hasImages ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={images[selectedImageIndex]} 
                  alt={`Product image ${selectedImageIndex + 1}`} 
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-200 hover:scale-105" 
                />
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 shadow-lg border border-gray-200"
                      aria-label="Previous image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 shadow-lg border border-gray-200"
                      aria-label="Next image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-400">Hero Image</span>
            )}
          </div>
          
          {/* Thumbnail navigation for FeatureBlocks */}
          {hasImages && images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((src, i) => (
                <div 
                  key={i} 
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImageIndex === i 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                  }`}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={src} 
                    alt={`Thumbnail ${i + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {feats.map((f, i) => (
          <div key={i} className="border rounded p-4 h-full">
            <h4 className="font-semibold text-gray-900 mb-2">{typeof f === 'string' ? f : `Feature ${i + 1}`}</h4>
            <p className="text-gray-700 text-sm">
              {explanations[f] || 'Highlight of this feature with benefits and value proposition.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SingleColumn({ content, images }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasImages = images && images.length > 0;
  
  return (
    <div>
      <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center mb-6 relative group">
        {hasImages ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={images[selectedImageIndex]} 
              alt={`Product image ${selectedImageIndex + 1}`} 
              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-200 hover:scale-105" 
            />
            
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 shadow-lg border border-gray-200"
                  aria-label="Previous image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 shadow-lg border border-gray-200"
                  aria-label="Next image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-400">Main Image</span>
        )}
      </div>
      
      {/* Thumbnail navigation for SingleColumn */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 justify-center">
          {images.map((src, i) => (
            <div 
              key={i} 
              className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden cursor-pointer transition-all duration-200 ${
                selectedImageIndex === i 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
              }`}
              onClick={() => setSelectedImageIndex(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={src} 
                alt={`Thumbnail ${i + 1}`} 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
      )}
      
      <Hero title={content?.title} description={content?.description} />
      <Features features={content?.features} featureExplanations={content?.featureExplanations} />
      <Specs specifications={content?.specifications} />
      <CTA />
    </div>
  );
}

function ComparisonTable({ content, images }) {
  return (
    <div>
      <Hero title={content?.title} description={content?.description} />
      <Gallery images={images} />
      <Specs specifications={content?.specifications} />
      <Features features={content?.features} featureExplanations={content?.featureExplanations} />
      <CTA />
    </div>
  );
}

// Minimal template - clean, centered layout
function Minimal({ content, images }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasImages = images && images.length > 0;
  const feats = content?.features?.length ? content.features : ['Premium Quality', 'Sustainable Materials', 'Timeless Design'];
  const explanations = content?.featureExplanations || {};
  
  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-light tracking-wide text-gray-900 mb-4">
          {content?.title || 'Product Title'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {content?.description || 'A clean, minimal product description.'}
        </p>
      </div>

      {/* Gallery */}
      <div className="mb-16">
        <div className="aspect-[4/3] bg-gray-100 rounded-sm overflow-hidden relative group mb-4">
          {hasImages ? (
            <>
              <img 
                src={images[selectedImageIndex]} 
                alt={`Product image ${selectedImageIndex + 1}`} 
                className="w-full h-full object-cover" 
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400 text-lg">Product Image</span>
            </div>
          )}
        </div>

        {hasImages && images.length > 1 && (
          <div className="flex justify-center space-x-2">
            {images.map((src, i) => (
              <button
                key={i}
                className={`w-16 h-16 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
                  selectedImageIndex === i ? "border-gray-800" : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setSelectedImageIndex(i)}
              >
                <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feats.map((f, i) => (
            <div key={i} className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{f}</h3>
              {explanations[f] && (
                <p className="text-sm text-gray-600 leading-relaxed">{explanations[f]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div className="mb-16">
        <h2 className="text-2xl font-light text-gray-900 mb-6">Details</h2>
        <div className="max-w-md mx-auto">
          <Specs specifications={content?.specifications} />
        </div>
      </div>

      {/* CTA */}
      <button className="px-8 py-3 bg-black text-white font-medium tracking-wide hover:bg-gray-800 transition-colors duration-200">
        Add to Cart
      </button>
    </div>
  );
}

// Modern template - card-based with gradients
function Modern({ content, images }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasImages = images && images.length > 0;
  const feats = content?.features?.length ? content.features : ['Smart Technology', 'Premium Build', 'User Friendly'];
  const explanations = content?.featureExplanations || {};
  
  const icons = [
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>,
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ];
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {content?.title || 'Product Title'}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
          {content?.description || 'Experience the future with our innovative product design.'}
        </p>
      </div>

      {/* Gallery */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="aspect-video relative group">
          {hasImages ? (
            <>
              <img 
                src={images[selectedImageIndex]} 
                alt={`Product image ${selectedImageIndex + 1}`} 
                className="w-full h-full object-cover" 
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Product Gallery</p>
              </div>
            </div>
          )}
        </div>

        {hasImages && images.length > 1 && (
          <div className="p-4 bg-gray-50">
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === i
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {feats.map((f, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="text-blue-600 mb-4">
              {icons[i % icons.length]}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{f}</h3>
            {explanations[f] && (
              <p className="text-gray-600 leading-relaxed">{explanations[f]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Technical Specifications</h2>
        </div>
        <div className="p-6">
          <Specs specifications={content?.specifications} />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
}

// Classic template - traditional with serif fonts
function Classic({ content, images }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasImages = images && images.length > 0;
  const feats = content?.features?.length ? content.features : ['Handcrafted Quality', 'Heritage Design', 'Lifetime Durability'];
  const explanations = content?.featureExplanations || {};
  
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="border-b-2 border-gray-800 pb-8 mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
          {content?.title || 'Product Title'}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed font-serif max-w-4xl">
          {content?.description || 'A timeless product crafted with traditional excellence and modern precision.'}
        </p>
      </div>

      {/* Gallery */}
      <div className="border-2 border-gray-800 mb-12">
        <div className="aspect-[4/3] relative group bg-gray-100">
          {hasImages ? (
            <>
              <img 
                src={images[selectedImageIndex]} 
                alt={`Product image ${selectedImageIndex + 1}`} 
                className="w-full h-full object-cover" 
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-800 text-gray-800 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-800 text-gray-800 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 border-2 border-gray-400 rounded mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-serif text-lg">Product Gallery</p>
              </div>
            </div>
          )}
        </div>

        {hasImages && images.length > 1 && (
          <div className="border-t-2 border-gray-800 p-4 bg-gray-50">
            <div className="flex space-x-3 justify-center">
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`w-20 h-20 border-2 transition-all duration-200 ${
                    selectedImageIndex === i ? "border-gray-800" : "border-gray-400 hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="border-2 border-gray-800 bg-white mb-12">
        <div className="border-b-2 border-gray-800 bg-gray-100 px-6 py-4">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Distinguished Features</h2>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {feats.map((f, i) => (
              <div key={i} className="border-l-4 border-gray-800 pl-6">
                <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3">{f}</h3>
                {explanations[f] && (
                  <p className="text-gray-700 leading-relaxed font-serif">{explanations[f]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="border-2 border-gray-800 bg-white mb-12">
        <div className="border-b-2 border-gray-800 bg-gray-100 px-6 py-4">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Product Specifications</h2>
        </div>
        <div className="p-6">
          <Specs specifications={content?.specifications} />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <div className="border-2 border-gray-800 bg-gray-100 p-8">
          <button className="bg-gray-800 text-white px-12 py-4 font-serif text-lg font-semibold border-2 border-gray-800 hover:bg-white hover:text-gray-800 transition-colors duration-200 uppercase tracking-wider">
            Acquire This Piece
          </button>
        </div>
      </div>
    </div>
  );
}

const RENDERERS = {
  'gallery-focused': GalleryFocused,
  'feature-blocks': FeatureBlocks,
  'single-column': SingleColumn,
  'comparison-table': ComparisonTable,
  'minimal': Minimal,
  'modern': Modern,
  'classic': Classic,
};

export default function FullTemplatePreview({ layoutType = 'gallery-focused', content, images }) {
  const Renderer = RENDERERS[layoutType] || GalleryFocused;
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Renderer content={content} images={images} />
      </div>
    </div>
  );
}