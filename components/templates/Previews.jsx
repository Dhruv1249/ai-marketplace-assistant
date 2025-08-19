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

// 2) Minimal: Clean, centered layout
export const MinimalPreview = ({ content }) => (
  <div className="w-full h-40 bg-white border rounded-md overflow-hidden">
    <TitleBar title={content?.title} />
    <div className="p-3 flex flex-col items-center gap-2 h-[calc(10rem-2.5rem)]">
      <div className="w-3/4 text-center">
        <div className="h-3 w-2/3 bg-gray-900/80 rounded mx-auto mb-2" />
        <TextLines lines={2} />
      </div>
      <ImageBox className="w-full h-12" />
      <div className="grid grid-cols-3 gap-2 w-full">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-3 w-1/2 bg-gray-900/70 rounded mx-auto mb-1" />
            <TextLines lines={1} />
          </div>
        ))}
      </div>
      <div className="h-6 w-24 bg-black/80 rounded" />
    </div>
  </div>
);

// 3) Modern: Card-based with gradients
export const ModernPreview = ({ content }) => (
  <div className="w-full h-40 bg-gray-50 border rounded-md overflow-hidden">
    <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-100 border-b">
      <div className="h-3 w-2/3 bg-gray-900/80 rounded" title={content?.title} />
    </div>
    <div className="p-3 space-y-2 h-[calc(10rem-2.5rem)]">
      <div className="bg-white rounded-lg p-2 shadow-sm">
        <ImageBox className="h-8 mb-2" />
        <div className="grid grid-cols-4 gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
            <div className="h-2 w-3/4 bg-blue-600/70 rounded mb-1" />
            <TextLines lines={1} />
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-6 w-28 rounded-lg ml-auto" />
    </div>
  </div>
);

// 4) Classic: Traditional with borders
export const ClassicPreview = ({ content }) => (
  <div className="w-full h-40 bg-gray-50 border-2 border-gray-800 rounded-md overflow-hidden">
    <div className="px-3 py-2 bg-gray-100 border-b-2 border-gray-800">
      <div className="h-3 w-2/3 bg-gray-900 rounded" title={content?.title} />
    </div>
    <div className="p-3 h-[calc(10rem-2.5rem)]">
      <div className="border-2 border-gray-800 bg-white mb-2">
        <ImageBox className="h-8" />
      </div>
      <div className="border-2 border-gray-800 bg-white p-2 mb-2">
        <div className="border-b-2 border-gray-800 pb-1 mb-2">
          <div className="h-2 w-1/3 bg-gray-900 rounded" />
        </div>
        <div className="space-y-1">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex justify-between border-b border-gray-300 pb-1">
              <div className="h-2 w-1/4 bg-gray-600 rounded" />
              <div className="h-2 w-1/3 bg-gray-400 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="border-2 border-gray-800 bg-gray-100 p-1">
        <div className="h-4 w-24 bg-gray-800 rounded" />
      </div>
    </div>
  </div>
);

export const TEMPLATE_COMPONENTS = {
  'gallery-focused': GalleryFocusedPreview,
  'minimal': MinimalPreview,
  'modern': ModernPreview,
  'classic': ClassicPreview,
};

export default TEMPLATE_COMPONENTS;
