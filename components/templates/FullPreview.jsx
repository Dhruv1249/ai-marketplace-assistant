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
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
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
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
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
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
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

const RENDERERS = {
  'gallery-focused': GalleryFocused,
  'feature-blocks': FeatureBlocks,
  'single-column': SingleColumn,
  'comparison-table': ComparisonTable,
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
