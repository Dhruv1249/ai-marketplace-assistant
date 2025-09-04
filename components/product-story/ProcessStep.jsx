"use client";

import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ProcessStep({ 
  productStoryData, 
  handleInputChange, 
  generateFieldContent, 
  isGenerating,
  updateValidation
}) {
  // Validation function - all fields are optional in this step
  const validateStep = () => {
    const { creation, materials, time, quality, ethics } = productStoryData.process;
    
    // Check if any field exceeds the limit
    const allFields = [creation, materials, time, quality, ethics];
    const hasExceededLimits = allFields.some(field => field.length > 600);
    
    return !hasExceededLimits;
  };

  // Add validation status to parent component
  React.useEffect(() => {
    if (updateValidation) {
      updateValidation('step3', validateStep());
    }
  }, [productStoryData.process, updateValidation]);
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="mx-auto mb-4 text-green-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Behind the Scenes</h2>
        <p className="text-gray-600">Show the craftsmanship and process behind your product</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Creation Process & Craftsmanship ({productStoryData.process.creation.length}/600)
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.process.creation}
            onChange={(e) => {
              if (e.target.value.length <= 600) {
                handleInputChange('process', 'creation', e.target.value);
              }
            }}
            maxLength={600}
            rows={4}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="How is your product made? What's the process and craftsmanship involved?"
          />
          <Button
            onClick={() => generateFieldContent('process', 'creation', productStoryData.process.creation)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.process.creation.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Materials/Ingredients/Technology ({productStoryData.process.materials.length}/600)
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.process.materials}
            onChange={(e) => {
              if (e.target.value.length <= 600) {
                handleInputChange('process', 'materials', e.target.value);
              }
            }}
            maxLength={600}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What materials, ingredients, or technology are used in your product?"
          />
          <Button
            onClick={() => generateFieldContent('process', 'materials', productStoryData.process.materials)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.process.materials.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Investment & Expertise ({productStoryData.process.time.length}/600)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={productStoryData.process.time}
            onChange={(e) => {
              if (e.target.value.length <= 600) {
                handleInputChange('process', 'time', e.target.value);
              }
            }}
            maxLength={600}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="How much time and expertise goes into making this product?"
          />
          <Button
            onClick={() => generateFieldContent('process', 'time', productStoryData.process.time)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isGenerating || !productStoryData.process.time.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality Standards & Certifications ({productStoryData.process.quality.length}/600)
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.process.quality}
            onChange={(e) => {
              if (e.target.value.length <= 600) {
                handleInputChange('process', 'quality', e.target.value);
              }
            }}
            maxLength={600}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What quality standards do you follow? Any certifications or guarantees?"
          />
          <Button
            onClick={() => generateFieldContent('process', 'quality', productStoryData.process.quality)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.process.quality.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sustainability & Ethics ({productStoryData.process.ethics.length}/600)
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.process.ethics}
            onChange={(e) => {
              if (e.target.value.length <= 600) {
                handleInputChange('process', 'ethics', e.target.value);
              }
            }}
            maxLength={600}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="How is your product sustainable or ethically made?"
          />
          <Button
            onClick={() => generateFieldContent('process', 'ethics', productStoryData.process.ethics)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.process.ethics.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}