"use client";

import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ProductStoryStep({ 
  productStoryData, 
  handleInputChange, 
  generateFieldContent, 
  isGenerating 
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Lightbulb className="mx-auto mb-4 text-purple-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">The Story</h2>
        <p className="text-gray-600">Share the compelling story behind your product</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Origin Story * ({productStoryData.story.origin.length}/400)
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.story.origin}
            onChange={(e) => {
              if (e.target.value.length <= 400) {
                handleInputChange('story', 'origin', e.target.value);
              }
            }}
            maxLength={400}
            rows={4}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="How and why was this product created? What inspired you to make it?"
          />
          <Button
            onClick={() => generateFieldContent('story', 'origin', productStoryData.story.origin)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.story.origin.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Solution Journey * ({productStoryData.story.solution.length}/400)
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.story.solution}
            onChange={(e) => {
              if (e.target.value.length <= 400) {
                handleInputChange('story', 'solution', e.target.value);
              }
            }}
            maxLength={400}
            rows={4}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the journey of creating this solution. What challenges did you overcome?"
          />
          <Button
            onClick={() => generateFieldContent('story', 'solution', productStoryData.story.solution)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.story.solution.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What Makes It Unique * ({productStoryData.story.unique.length}/400)
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.story.unique}
            onChange={(e) => {
              if (e.target.value.length <= 400) {
                handleInputChange('story', 'unique', e.target.value);
              }
            }}
            maxLength={400}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What makes your product special and different from others?"
          />
          <Button
            onClick={() => generateFieldContent('story', 'unique', productStoryData.story.unique)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.story.unique.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vision & Mission ({productStoryData.story.vision.length}/400)
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.story.vision}
            onChange={(e) => {
              if (e.target.value.length <= 400) {
                handleInputChange('story', 'vision', e.target.value);
              }
            }}
            maxLength={400}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What's the bigger vision or mission behind this product?"
          />
          <Button
            onClick={() => generateFieldContent('story', 'vision', productStoryData.story.vision)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.story.vision.trim()}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}