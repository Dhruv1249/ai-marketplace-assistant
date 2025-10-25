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
      id: 'our-journey',
      name: 'Our Journey',
      description: 'An artisan brand story page with hero, process timeline, before/after showcase, testimonials, awards, and a call-to-action.',
      color: 'from-gray-900 to-pink-700',
      features: ['Timeline layout', 'Process steps', 'Before/after sections', 'Testimonials', 'Awards showcase'],
      requirements: {
        'basics.name': 'max 8 words',
        'basics.value': 'max 80 words',
        'basics.category': 'max 100 chars',
        'basics.problem': 'max 300 chars',
        'basics.audience': 'max 150 chars',
        'impact.cases': 'before/after images',
        'impact.testimonials': 'multiple cards',
        'impact.awards': 'multiple awards'
      }
    },
    {
      id: 'artisan-journey',
      name: 'Artisan Journey',
      description: 'Converted from HTML into repository JSON template format with dynamic placeholders and brand variables.',
      color: 'from-teal-600 to-orange-600',
      features: ['Hero section', 'Process showcase', 'Quote sections', 'Sustainability focus', 'Responsive design'],
      requirements: {
        'basics.name': 'max 10 words',
        'basics.value': 'max 50 words',
        'basics.category': 'max 100 chars',
        'basics.problem': 'max 300 chars',
        'basics.audience': 'max 150 chars',
        'story.origin': 'max 200 chars',
        'story.unique': 'max 200 chars',
        'story.vision': 'max 250 chars',
        'process fields': 'max 200 chars each'
      }
    },
    {
      id: 'ai-photo-generated',
      name: 'AI Photo Generated',
      description: 'Upload 1-4 photos and let AI generate your complete product story. Edit and publish directly.',
      color: 'from-indigo-600 to-purple-600',
      features: ['Photo upload', 'AI-powered generation', 'Auto JSON creation', 'Quick editing', 'Direct publish'],
      requirements: {
        'photos': '1-4 product photos',
        'ai-generation': 'Automatic story creation'
      }
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

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <h4 className="font-medium text-green-900 mb-2">✓ Template Selected: {templates.find(t => t.id === selectedTemplate)?.name}</h4>
        <p className="text-sm text-green-800">
          Your form fields will be customized based on this template's requirements.
        </p>
      </div>
    </div>
  );
}