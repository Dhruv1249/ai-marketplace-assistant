"use client";

import React from 'react';
import {
  Type,
  Grid3x3,
  MessageSquare,
  Image,
  BarChart3,
  Zap,
  Button,
  Heading1,
} from 'lucide-react';

const COMPONENTS = [
  {
    id: 'header',
    name: 'Header',
    description: 'Title and subtitle section',
    icon: 'Heading1',
    category: 'Content',
  },
  {
    id: 'text',
    name: 'Text Block',
    description: 'Rich text content',
    icon: 'Type',
    category: 'Content',
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Feature list with grid layout',
    icon: 'Grid3x3',
    category: 'Content',
  },
  {
    id: 'highlights',
    name: 'Highlights',
    description: 'Icon-based highlights',
    icon: 'Zap',
    category: 'Content',
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer testimonials',
    icon: 'MessageSquare',
    category: 'Social Proof',
  },
  {
    id: 'stats',
    name: 'Statistics',
    description: 'Key metrics and numbers',
    icon: 'BarChart3',
    category: 'Social Proof',
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Image gallery',
    icon: 'Image',
    category: 'Media',
  },
  {
    id: 'cta',
    name: 'Call to Action',
    description: 'Button or CTA section',
    icon: 'Button',
    category: 'Conversion',
  },
];

const ICON_MAP = {
  'Heading1': Heading1,
  'Type': Type,
  'Grid3x3': Grid3x3,
  'Zap': Zap,
  'MessageSquare': MessageSquare,
  'BarChart3': BarChart3,
  'Image': Image,
  'Button': Button,
};

const ComponentCard = ({ component, onClick }) => {
  const Icon = ICON_MAP[component.icon];

  if (!Icon) {
    return null;
  }

  return (
    <button
      onClick={() => onClick(component.id)}
      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group"
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="text-gray-600 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900">{component.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">{component.description}</p>
        </div>
      </div>
    </button>
  );
};

export default function ComponentLibrary({ onAddComponent }) {
  const categories = [...new Set(COMPONENTS.map((c) => c.category))];

  return (
    <div className="p-4 space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
            {category}
          </h4>
          <div className="space-y-2">
            {COMPONENTS.filter((c) => c.category === category).map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onClick={onAddComponent}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
