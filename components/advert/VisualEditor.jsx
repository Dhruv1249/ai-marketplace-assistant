"use client";

import React, { useState } from 'react';
import FullScreenInteractivePreview from './FullScreenInteractivePreview';
import ComponentLibrary from './ComponentLibrary';
import StyleCustomizer from './StyleCustomizer';

export default function VisualEditor({ template, data, onChange }) {
  const handleAddSection = (sectionType) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type: sectionType,
      title: 'New Section',
      content: 'Add your content here',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      editable: true,
      items: [],
      _position: {
        x: 20,
        y: 20 + data.sections.length * 150,
      },
    };

    const newData = {
      ...data,
      sections: [...data.sections, newSection],
    };
    onChange(newData);
  };

  const handleColorChange = (colorKey, value) => {
    const newData = {
      ...data,
      colors: {
        ...data.colors,
        [colorKey]: value,
      },
    };
    onChange(newData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Full Screen Canvas */}
      <div className="lg:col-span-3 bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900">Canvas</h3>
          <p className="text-sm text-gray-600">Drag sections • Click to select • Hover for options</p>
        </div>
        <div className="h-[calc(100%-60px)]">
          <FullScreenInteractivePreview data={data} onChange={onChange} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1 space-y-4 overflow-y-auto">
        {/* Component Library */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Add Components</h3>
          </div>
          <ComponentLibrary onAddComponent={handleAddSection} />
        </div>

        {/* Style Customizer */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Colors & Style</h3>
          </div>
          <StyleCustomizer
            colors={data.colors}
            onColorChange={handleColorChange}
          />
        </div>
      </div>
    </div>
  );
}
