"use client";

import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui';

export default function TemplateStep({ 
  selectedTemplate, 
  setSelectedTemplate,
  productStoryData 
}) {
  const templates = [
    {
      id: 'journey',
      name: 'Journey Story',
      description: 'Timeline-based storytelling with step-by-step process visualization',
      color: 'from-blue-600 to-blue-800',
      features: ['Timeline layout', 'Process steps', 'Before/after sections', 'Progress indicators']
    },
    {
      id: 'craft',
      name: 'Artisan Craft',
      description: 'Focus on craftsmanship, quality, and traditional methods',
      color: 'from-amber-600 to-orange-700',
      features: ['Warm colors', 'Craft emphasis', 'Quality focus', 'Traditional feel']
    },
    {
      id: 'impact',
      name: 'Impact Story',
      description: 'Social impact, sustainability, and mission-driven narrative',
      color: 'from-green-600 to-emerald-700',
      features: ['Impact metrics', 'Sustainability focus', 'Mission-driven', 'Social proof']
    },
    {
      id: 'modern',
      name: 'Modern Minimal',
      description: 'Clean, minimal design with focus on innovation and technology',
      color: 'from-gray-800 to-gray-900',
      features: ['Clean design', 'Modern layout', 'Tech focus', 'Minimal style']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Palette className="mx-auto mb-4 text-indigo-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
        <p className="text-gray-600">Select how you want to present your product story</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            {/* Template Preview */}
            <div className={`w-full h-32 rounded-lg bg-gradient-to-r ${template.color} mb-4 flex items-center justify-center`}>
              <div className="text-white text-center">
                <h3 className="font-bold text-lg">{productStoryData.basics.name || 'Your Product'}</h3>
                <p className="text-sm opacity-90">{template.name} Preview</p>
              </div>
            </div>

            {/* Template Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                {selectedTemplate === template.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600">{template.description}</p>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-700">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Selected Template: {templates.find(t => t.id === selectedTemplate)?.name}</h4>
        <p className="text-sm text-blue-800">
          {templates.find(t => t.id === selectedTemplate)?.description}
        </p>
      </div>
    </div>
  );
}