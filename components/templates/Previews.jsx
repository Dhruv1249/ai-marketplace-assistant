"use client";

import React from 'react';

// Shared small preview building blocks
const TitleBar = ({ title = 'Product Title' }) => (
  <div className="px-3 py-2 bg-white border-b">
    <div className="h-3 w-2/3 bg-gray-900/80 rounded" title={title} />
  </div>
);

const TextLines = ({ lines = 3 }) => (
  <div className="space-y-1.5">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-2 ${i === lines - 1 ? 'w-1/2' : 'w-full'} bg-gray-300 rounded`} />
    ))}
  </div>
);

const Pill = () => <div className="h-3 w-16 bg-blue-200 rounded-full" />;

const ImageBox = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded ${className}`} />
);

// 1) Gallery Focused: Big image area + side details
export const GalleryFocusedPreview = ({ content }) => (
  <div className="w-full h-40 bg-white border rounded-md overflow-hidden">
    <TitleBar title={content?.title} />
    <div className="p-3 grid grid-cols-3 gap-2 h-[calc(10rem-2.5rem)]">
      <div className="col-span-2 flex flex-col gap-2">
        <ImageBox className="flex-1" />
        <div className="grid grid-cols-5 gap-1.5">
          {[...Array(5)].map((_, i) => (
            <ImageBox key={i} className="h-6" />
          ))}
        </div>
      </div>
      <div className="col-span-1 flex flex-col gap-2">
        <div className="space-y-2">
          <Pill />
          <TextLines lines={3} />
        </div>
        <div className="mt-auto">
          <div className="h-6 w-full bg-blue-600/80 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// 2) Feature Blocks: Hero + 3 feature cards + CTA
export const FeatureBlocksPreview = ({ content }) => (
  <div className="w-full h-40 bg-white border rounded-md overflow-hidden">
    <TitleBar title={content?.title} />
    <div className="p-3 flex flex-col gap-2 h-[calc(10rem-2.5rem)]">
      <div className="grid grid-cols-4 gap-2">
        <ImageBox className="col-span-2 h-12" />
        <div className="col-span-2">
          <TextLines lines={3} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded p-2">
            <div className="h-3 w-1/2 bg-gray-900/70 rounded mb-2" />
            <TextLines lines={2} />
          </div>
        ))}
      </div>
      <div className="h-6 w-24 bg-blue-600/80 rounded ml-auto" />
    </div>
  </div>
);

// 3) Single Column: Simple stacked sections
export const SingleColumnPreview = ({ content }) => (
  <div className="w-full h-40 bg-white border rounded-md overflow-hidden">
    <TitleBar title={content?.title} />
    <div className="p-3 space-y-2 h-[calc(10rem-2.5rem)] overflow-hidden">
      <ImageBox className="h-12" />
      <TextLines lines={4} />
      <div className="grid grid-cols-2 gap-2">
        <div className="border rounded p-2">
          <div className="h-3 w-1/2 bg-gray-900/70 rounded mb-2" />
          <TextLines lines={2} />
        </div>
        <div className="border rounded p-2">
          <div className="h-3 w-1/2 bg-gray-900/70 rounded mb-2" />
          <TextLines lines={2} />
        </div>
      </div>
      <div className="h-6 w-28 bg-blue-600/80 rounded ml-auto" />
    </div>
  </div>
);

// 4) Comparison Table: Spec table focus
export const ComparisonTablePreview = ({ content }) => (
  <div className="w-full h-40 bg-white border rounded-md overflow-hidden">
    <TitleBar title={content?.title} />
    <div className="p-3 h-[calc(10rem-2.5rem)]">
      <div className="grid grid-cols-4 gap-2 mb-2">
        <div className="h-3 w-1/2 bg-gray-900/70 rounded" />
        <div className="col-span-3 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-3 w-12 bg-gray-400 rounded" />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {[...Array(3)].map((_, r) => (
          <div key={r} className="grid grid-cols-4 gap-2">
            <div className="h-2 bg-gray-300 rounded" />
            <div className="col-span-3 flex gap-2">
              {[...Array(3)].map((_, c) => (
                <div key={c} className="h-2 w-12 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="h-6 w-24 bg-blue-600/80 rounded ml-auto mt-2" />
    </div>
  </div>
);

export const TEMPLATE_COMPONENTS = {
  'gallery-focused': GalleryFocusedPreview,
  'feature-blocks': FeatureBlocksPreview,
  'single-column': SingleColumnPreview,
  'comparison-table': ComparisonTablePreview,
};

export default TEMPLATE_COMPONENTS;
