"use client";

import React, { useState, useEffect } from 'react';
import { Check, User, Briefcase, Sparkles, Crown } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, business-focused layout perfect for consultants and service providers',
    badges: ['Business', 'Clean'],
    icon: Briefcase
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant, artistic design ideal for designers and creative professionals',
    badges: ['Artistic', 'Modern'],
    icon: Sparkles
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Premium, sophisticated layout for senior executives and leaders',
    badges: ['Premium', 'Leadership'],
    icon: Crown
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Warm, approachable design that emphasizes personal connection',
    badges: ['Friendly', 'Personal'],
    icon: User
  }
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

// Template Preview Components
const ProfessionalPreview = ({ sellerData }) => (
  <div className="w-full h-40 bg-white border rounded-md overflow-hidden">
    <div className="px-3 py-2 bg-gray-50 border-b">
      <div className="h-3 w-2/3 bg-gray-900 rounded" />
    </div>
    <div className="p-3 h-[calc(10rem-2.5rem)]">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-3/4 bg-gray-800 rounded mb-2" />
          <div className="h-2 w-1/2 bg-gray-600 rounded mb-2" />
          <div className="space-y-1">
            <div className="h-2 w-full bg-gray-300 rounded" />
            <div className="h-2 w-4/5 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-2 bg-blue-200 rounded" />
        <div className="h-2 bg-blue-200 rounded" />
      </div>
    </div>
  </div>
);

const CreativePreview = ({ sellerData }) => (
  <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-pink-50 border rounded-md overflow-hidden">
    <div className="px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border-b">
      <div className="h-3 w-2/3 bg-purple-800 rounded" />
    </div>
    <div className="p-3 h-[calc(10rem-2.5rem)]">
      <div className="text-center mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-2" />
        <div className="h-3 w-2/3 bg-purple-800 rounded mx-auto mb-1" />
        <div className="h-2 w-1/2 bg-purple-600 rounded mx-auto" />
      </div>
      <div className="space-y-1">
        <div className="h-2 w-full bg-purple-200 rounded" />
        <div className="h-2 w-3/4 bg-purple-200 rounded" />
      </div>
      <div className="mt-3 flex justify-center gap-1">
        <div className="h-2 w-8 bg-pink-300 rounded-full" />
        <div className="h-2 w-8 bg-purple-300 rounded-full" />
        <div className="h-2 w-8 bg-indigo-300 rounded-full" />
      </div>
    </div>
  </div>
);

const ExecutivePreview = ({ sellerData }) => (
  <div className="w-full h-40 bg-gray-900 border-2 border-gray-800 rounded-md overflow-hidden">
    <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
      <div className="h-3 w-2/3 bg-white rounded" />
    </div>
    <div className="p-3 h-[calc(10rem-2.5rem)] text-white">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-3/4 bg-white rounded mb-2" />
          <div className="h-2 w-1/2 bg-gray-300 rounded mb-2" />
          <div className="space-y-1">
            <div className="h-2 w-full bg-gray-400 rounded" />
            <div className="h-2 w-4/5 bg-gray-400 rounded" />
          </div>
        </div>
      </div>
      <div className="mt-3 border-t border-gray-700 pt-2">
        <div className="h-2 w-1/3 bg-gold-400 rounded" />
      </div>
    </div>
  </div>
);

const PersonalPreview = ({ sellerData }) => (
  <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-green-50 border rounded-md overflow-hidden">
    <div className="px-3 py-2 bg-white border-b">
      <div className="h-3 w-2/3 bg-gray-800 rounded" />
    </div>
    <div className="p-3 h-[calc(10rem-2.5rem)]">
      <div className="text-center mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-green-400 rounded-full mx-auto mb-2" />
        <div className="h-3 w-2/3 bg-gray-800 rounded mx-auto mb-1" />
        <div className="h-2 w-1/2 bg-gray-600 rounded mx-auto" />
      </div>
      <div className="space-y-1 mb-3">
        <div className="h-2 w-full bg-blue-200 rounded" />
        <div className="h-2 w-4/5 bg-blue-200 rounded" />
        <div className="h-2 w-3/4 bg-blue-200 rounded" />
      </div>
      <div className="flex justify-center gap-2">
        <div className="h-4 w-4 bg-blue-400 rounded" />
        <div className="h-4 w-4 bg-green-400 rounded" />
        <div className="h-4 w-4 bg-yellow-400 rounded" />
      </div>
    </div>
  </div>
);

const TEMPLATE_COMPONENTS = {
  'professional': ProfessionalPreview,
  'creative': CreativePreview,
  'executive': ExecutivePreview,
  'personal': PersonalPreview,
};

export default function SellerInfoTemplateSelector({ sellerData, value, onChange }) {
  const [selected, setSelected] = useState(value || 'professional');

  useEffect(() => {
    setSelected(value || 'professional');
  }, [value]);

  const handleSelect = (id) => {
    setSelected(id);
    onChange?.(id);
  };

  const Preview = ({ id }) => {
    const Comp = TEMPLATE_COMPONENTS[id] || ProfessionalPreview;
    return <Comp sellerData={sellerData} />;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card key={template.id} selected={selected === template.id} onClick={() => handleSelect(template.id)}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <IconComponent className="text-gray-600" size={16} />
                      <p className="font-medium text-gray-900">{template.name}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  <div className="flex gap-1">
                    {template.badges.map((badge) => (
                      <Badge key={badge}>{badge}</Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded border bg-gray-50 overflow-hidden">
                  <Preview id={template.id} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Sparkles size={14} className="text-blue-600" />
          <span>Choose a template that best represents your professional style.</span>
        </div>
        <div className="text-xs text-gray-500">Templates available: {TEMPLATES.length}</div>
      </div>
    </div>
  );
}