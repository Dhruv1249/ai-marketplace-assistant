"use client";

import React from 'react';

function Hero({ title, description }) {
  return (
    <div className="border-b pb-4 mb-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title || 'Product Title'}</h2>
      <p className="text-gray-700 whitespace-pre-line">{description || 'Product description will appear here.'}</p>
    </div>
  );
}

function Gallery({ images = [] }) {
  const hasImages = images && images.length > 0;
  const main = hasImages ? images[0] : null;
  const thumbs = hasImages ? images.slice(1) : [];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      <div className="lg:col-span-3">
        <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
          {main ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={main} alt="Main" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">Main Image</span>
          )}
        </div>
      </div>
      <div className="lg:col-span-1 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-2 overflow-auto max-h-[60vh] pr-1">
        {thumbs.map((src, i) => (
          <div key={i} className="aspect-square rounded bg-gray-200 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
        {!hasImages && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded bg-gray-100 flex items-center justify-center text-gray-300">IMG</div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Features({ features = [] }) {
  const items = features && features.length ? features : [
    'Key feature one',
    'Key feature two',
    'Key feature three',
  ];
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
      <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
        {items.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
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
        <Features features={content?.features} />
        <Specs specifications={content?.specifications} />
        <CTA />
      </div>
    </div>
  );
}

function FeatureBlocks({ content, images }) {
  const feats = content?.features?.length ? content.features : ['Feature A', 'Feature B', 'Feature C'];
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <Hero title={content?.title} description={content?.description} />
          <CTA />
        </div>
        <div>
          <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {images?.[0] ? <img src={images[0]} alt="Hero" className="w-full h-full object-cover" /> : <span className="text-gray-400">Hero Image</span>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {feats.map((f, i) => (
          <div key={i} className="border rounded p-4 h-full">
            <h4 className="font-semibold text-gray-900 mb-2">{typeof f === 'string' ? f : `Feature ${i + 1}`}</h4>
            <p className="text-gray-700 text-sm">Highlight of this feature with benefits and value proposition.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SingleColumn({ content, images }) {
  return (
    <div>
      <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {images?.[0] ? <img src={images[0]} alt="Main" className="w-full h-full object-cover" /> : <span className="text-gray-400">Main Image</span>}
      </div>
      <Hero title={content?.title} description={content?.description} />
      <Features features={content?.features} />
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
      <Features features={content?.features} />
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
