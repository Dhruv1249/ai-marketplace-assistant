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
  isGenerating,
  updateValidation
}) {
  // Validation function - all fields are optional in this step
  const validateStep = () => {
    const { testimonials, cases, metrics, awards } = productStoryData.impact;
    
    // Check if any field exceeds the limit
    const allFields = [...testimonials, ...cases, ...metrics, ...awards];
    const hasExceededLimits = allFields.some(field => field.length > 600);
    
    return !hasExceededLimits;
  };

  // Add validation status to parent component
  React.useEffect(() => {
    if (updateValidation) {
      updateValidation('step4', validateStep());
    }
  }, [productStoryData.impact, updateValidation]);
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
            <div className="flex-1">
              <textarea
                value={testimonial}
                onChange={(e) => {
                  if (e.target.value.length <= 600) {
                    handleArrayInputChange('impact', 'testimonials', index, e.target.value);
                  }
                }}
                maxLength={600}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer testimonial or review..."
              />
              <div className="text-xs text-gray-500 mt-1">{testimonial.length}/600</div>
            </div>
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
            <div className="flex-1">
              <textarea
                value={caseStudy}
                onChange={(e) => {
                  if (e.target.value.length <= 600) {
                    handleArrayInputChange('impact', 'cases', index, e.target.value);
                  }
                }}
                maxLength={600}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Success story or case study..."
              />
              <div className="text-xs text-gray-500 mt-1">{caseStudy.length}/600</div>
            </div>
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
            <div className="flex-1">
              <textarea
                type="text"
                value={metric}
                onChange={(e) => {
                  if (e.target.value.length <= 600) {
                    handleArrayInputChange('impact', 'metrics', index, e.target.value);
                  }
                }}
                maxLength={600}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 10,000+ satisfied customers, 95% success rate"
              />
              <div className="text-xs text-gray-500 mt-1">{metric.length}/600</div>
            </div>
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
            <div className="flex-1">
              <input
                type="text"
                value={award}
                onChange={(e) => {
                  if (e.target.value.length <= 600) {
                    handleArrayInputChange('impact', 'awards', index, e.target.value);
                  }
                }}
                maxLength={600}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Award, certification, or recognition received..."
              />
              <div className="text-xs text-gray-500 mt-1">{award.length}/600</div>
            </div>
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