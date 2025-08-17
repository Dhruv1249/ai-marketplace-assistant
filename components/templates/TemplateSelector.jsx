"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Check, LayoutGrid, Sparkles } from 'lucide-react';
import TEMPLATE_COMPONENTS, {
  GalleryFocusedPreview,
  FeatureBlocksPreview,
  SingleColumnPreview,
  ComparisonTablePreview,
} from './Previews';

const TEMPLATES = [
  {
    id: 'gallery-focused',
    name: 'Gallery Focused',
    description: 'Large image gallery with details sidebar',
    badges: ['Visual', 'E-commerce'],
  },
  {
    id: 'feature-blocks',
    name: 'Feature Blocks',
    description: 'Hero area with 3 highlight feature cards',
    badges: ['Highlights', 'Marketing'],
  },
  {
    id: 'single-column',
    name: 'Single Column',
    description: 'Simple, readable single-column layout',
    badges: ['Simple', 'Blog-like'],
  },
  {
    id: 'comparison-table',
    name: 'Comparison Table',
    description: 'Specification-focused comparison table',
    badges: ['Specs', 'Technical'],
  },
];

const Badge = ({ children }) => (
  <span className="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 border">
    {children}
  </span>
);

const Card = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative w-full text-left rounded-lg border transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      selected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
    }`}
  >
    {selected && (
      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
        <Check size={14} />
      </div>
    )}
    {children}
  </button>
);

export default function TemplateSelector({ content, value, onChange }) {
  const [selected, setSelected] = useState(value || 'gallery-focused');

  useEffect(() => {
    setSelected(value || 'gallery-focused');
  }, [value]);

  const handleSelect = (id) => {
    setSelected(id);
    onChange?.(id);
  };

  const Preview = ({ id }) => {
    const Comp = TEMPLATE_COMPONENTS[id] || GalleryFocusedPreview;
    return <Comp content={content} />;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((t) => (
          <Card key={t.id} selected={selected === t.id} onClick={() => handleSelect(t.id)}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="text-gray-600" size={16} />
                    <p className="font-medium text-gray-900">{t.name}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                </div>
                <div className="flex gap-1">
                  {t.badges.map((b) => (
                    <Badge key={b}>{b}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded border bg-gray-50 overflow-hidden">
                <Preview id={t.id} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Sparkles size={14} className="text-blue-600" />
          <span>Choose a starting layout. You can customize sections later.</span>
        </div>
        <div className="text-xs text-gray-500">Templates available: {TEMPLATES.length}</div>
      </div>
    </div>
  );
}
