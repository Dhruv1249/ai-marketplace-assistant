"use client";

import React from 'react';

export default function SectionRenderer({ section, isPreview = false }) {
  const renderContent = () => {
    switch (section.type) {
      case 'header':
        return (
          <div className="text-center space-y-2">
            {section.title && (
              <h1 className="text-2xl font-bold">{section.title}</h1>
            )}
            {section.subtitle && (
              <p className="text-lg opacity-80">{section.subtitle}</p>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            {section.title && (
              <h2 className="text-xl font-semibold">{section.title}</h2>
            )}
            <p className="leading-relaxed">{section.content}</p>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-3">
            {section.title && (
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            )}
            <div
              className={`grid gap-4 ${
                section.layout === 'grid-3'
                  ? 'grid-cols-3'
                  : section.layout === 'grid-2'
                  ? 'grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {section.items?.map((item, idx) => (
                <div key={idx} className="p-3 bg-opacity-10 bg-white rounded">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs opacity-75 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'highlights':
        return (
          <div className="space-y-3">
            {section.title && (
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            )}
            <div className="grid grid-cols-3 gap-3">
              {section.items?.map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs opacity-75 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-3">
            {section.title && (
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            )}
            <div className="space-y-3">
              {section.items?.map((item, idx) => (
                <div key={idx} className="p-3 bg-opacity-10 bg-white rounded italic">
                  <p className="text-sm">"{item.text}"</p>
                  <p className="text-xs opacity-75 mt-2">— {item.author}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-3">
            {section.title && (
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            )}
            <div className="grid grid-cols-3 gap-3 text-center">
              {section.items?.map((item, idx) => (
                <div key={idx}>
                  <p className="text-2xl font-bold">{item.number}</p>
                  <p className="text-xs opacity-75">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-3">
            {section.title && (
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            )}
            <div className="grid grid-cols-3 gap-3">
              {section.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.caption}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    'Image'
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="flex justify-center">
            <button
              style={{
                backgroundColor: section.backgroundColor,
                color: section.textColor,
              }}
              className="px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              disabled={isPreview}
            >
              {section.text || 'Call to Action'}
            </button>
          </div>
        );

      case 'hero':
        return (
          <div className="text-center space-y-4 py-8">
            {section.title && (
              <h1 className="text-4xl font-bold">{section.title}</h1>
            )}
            {section.subtitle && (
              <p className="text-xl opacity-80">{section.subtitle}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-sm">
            Section type: {section.type}
          </div>
        );
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}
