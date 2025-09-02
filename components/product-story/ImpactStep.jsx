"use client";

import React from 'react';
import { Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ImpactStep({ 
  productStoryData, 
  handleArrayInputChange, 
  addArrayItem, 
  removeArrayItem,
  generateFieldContent,
  isGenerating 
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Award className="mx-auto mb-4 text-yellow-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Impact & Social Proof</h2>
        <p className="text-gray-600">Show the real-world impact and customer success</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Testimonials & Reviews
        </label>
        {productStoryData.impact.testimonials.map((testimonial, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <textarea
              value={testimonial}
              onChange={(e) => handleArrayInputChange('impact', 'testimonials', index, e.target.value)}
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Customer testimonial or review..."
            />
            <Button
              onClick={() => removeArrayItem('impact', 'testimonials', index)}
              variant="outline"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          onClick={() => addArrayItem('impact', 'testimonials')}
          variant="outline"
          size="sm"
        >
          Add Testimonial
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Success Stories & Case Studies
        </label>
        {productStoryData.impact.cases.map((caseStudy, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <textarea
              value={caseStudy}
              onChange={(e) => handleArrayInputChange('impact', 'cases', index, e.target.value)}
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Success story or case study..."
            />
            <Button
              onClick={() => removeArrayItem('impact', 'cases', index)}
              variant="outline"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          onClick={() => addArrayItem('impact', 'cases')}
          variant="outline"
          size="sm"
        >
          Add Case Study
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Usage Statistics & Metrics
        </label>
        {productStoryData.impact.metrics.map((metric, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={metric}
              onChange={(e) => handleArrayInputChange('impact', 'metrics', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 10,000+ satisfied customers, 95% success rate"
            />
            <Button
              onClick={() => removeArrayItem('impact', 'metrics', index)}
              variant="outline"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          onClick={() => addArrayItem('impact', 'metrics')}
          variant="outline"
          size="sm"
        >
          Add Metric
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Awards & Recognition
        </label>
        {productStoryData.impact.awards.map((award, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={award}
              onChange={(e) => handleArrayInputChange('impact', 'awards', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Award, certification, or recognition received..."
            />
            <Button
              onClick={() => removeArrayItem('impact', 'awards', index)}
              variant="outline"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          onClick={() => addArrayItem('impact', 'awards')}
          variant="outline"
          size="sm"
        >
          Add Award
        </Button>
      </div>
    </div>
  );
}