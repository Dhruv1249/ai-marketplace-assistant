"use client";

import React from 'react';
import { Palette } from 'lucide-react';

const COLOR_PRESETS = [
  {
    name: 'Blue Professional',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1f2937',
    },
  },
  {
    name: 'Purple Modern',
    colors: {
      primary: '#9333ea',
      secondary: '#06b6d4',
      background: '#ffffff',
      text: '#1f2937',
    },
  },
  {
    name: 'Red Bold',
    colors: {
      primary: '#dc2626',
      secondary: '#f97316',
      background: '#ffffff',
      text: '#1f2937',
    },
  },
  {
    name: 'Green Fresh',
    colors: {
      primary: '#16a34a',
      secondary: '#06b6d4',
      background: '#ffffff',
      text: '#1f2937',
    },
  },
  {
    name: 'Dark Elegant',
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      background: '#f9fafb',
      text: '#111827',
    },
  },
  {
    name: 'Gold Luxury',
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      background: '#faf8f3',
      text: '#2d2d2d',
    },
  },
];

export default function StyleCustomizer({ colors, onColorChange }) {
  return (
    <div className="p-4 space-y-6">
      {/* Color Presets */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Color Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                Object.entries(preset.colors).forEach(([key, value]) => {
                  onColorChange(key, value);
                });
              }}
              className="p-2 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <p className="text-xs font-medium text-gray-900 mb-2">{preset.name}</p>
              <div className="flex gap-1">
                {Object.values(preset.colors).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Custom Colors</h4>
        <div className="space-y-3">
          {Object.entries(colors || {}).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                {key}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={value || '#ffffff'}
                  onChange={(e) => onColorChange(key, e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={value || '#ffffff'}
                  onChange={(e) => onColorChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Use contrasting colors for better readability and visual hierarchy.
        </p>
      </div>
    </div>
  );
}
