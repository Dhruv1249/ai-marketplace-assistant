"use client";

import React from 'react';
import SectionRenderer from './SectionRenderer';

export default function AdvertPreview({ data, fullScreen = false }) {
  if (!data || !data.sections) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No template data to preview</p>
      </div>
    );
  }

  return (
    <div
      className={`${fullScreen ? 'min-h-screen' : 'rounded-lg border shadow-sm overflow-hidden'}`}
      style={{ backgroundColor: data.colors?.background || '#ffffff' }}
    >
      {/* Apply global styles */}
      <style>{`
        .advert-preview {
          font-family: ${data.fonts?.body || 'Inter'}, sans-serif;
          color: ${data.colors?.text || '#1f2937'};
        }
        .advert-preview h1, .advert-preview h2, .advert-preview h3 {
          font-family: ${data.fonts?.heading || 'Inter'}, sans-serif;
        }
      `}</style>

      <div className="advert-preview">
        {data.sections.map((section, index) => (
          <div
            key={section.id || index}
            style={{
              backgroundColor: section.backgroundColor || data.colors?.background || '#ffffff',
              color: section.textColor || data.colors?.text || '#1f2937',
            }}
            className={`${index > 0 ? 'border-t' : ''}`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <SectionRenderer section={section} isPreview={true} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
