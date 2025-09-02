"use client";

import React from 'react';
import { Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ProductBasicsStep({ 
  productStoryData, 
  handleInputChange, 
  generateFieldContent, 
  isGenerating 
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Package className="mx-auto mb-4 text-blue-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Basics</h2>
        <p className="text-gray-600">Tell us about your product and what makes it special</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={productStoryData.basics.name}
            onChange={(e) => handleInputChange('basics', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your amazing product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category/Type *
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={productStoryData.basics.category}
              onChange={(e) => handleInputChange('basics', 'category', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Electronics, Handmade, Software, Food"
            />
            <Button
              onClick={() => generateFieldContent('basics', 'category', productStoryData.basics.category)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isGenerating || !productStoryData.basics.category.trim()}
            >
              <Sparkles size={14} />
            </Button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Main Problem It Solves *
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.basics.problem}
            onChange={(e) => handleInputChange('basics', 'problem', e.target.value)}
            rows={4}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What specific problem does your product solve? What pain point does it address?"
          />
          <Button
            onClick={() => generateFieldContent('basics', 'problem', productStoryData.basics.problem)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.basics.problem.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience *
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={productStoryData.basics.audience}
            onChange={(e) => handleInputChange('basics', 'audience', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Who is this product for? e.g., Busy professionals, Parents, Students"
          />
          <Button
            onClick={() => generateFieldContent('basics', 'audience', productStoryData.basics.audience)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isGenerating || !productStoryData.basics.audience.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Value Proposition *
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.basics.value}
            onChange={(e) => handleInputChange('basics', 'value', e.target.value)}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What value does your product provide? Why should customers choose it?"
          />
          <Button
            onClick={() => generateFieldContent('basics', 'value', productStoryData.basics.value)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.basics.value.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}