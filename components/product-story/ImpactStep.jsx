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
  updateValidation,
  selectedTemplate
}) {
  
  // Get template configuration
  const getTemplateConfig = () => {
    if (selectedTemplate === 'our-journey') {
      return {
        fields: ['cases', 'testimonials', 'awards'],
        required: true, // Required for Our Journey
        limits: {
          cases: 1, // 1 before/after case
          testimonials: 3, // max 3 testimonials
          awards: 4 // max 3-4 awards
        }
      };
    } else if (selectedTemplate === 'artisan-journey') {
      return {
        fields: ['testimonials', 'awards'],
        required: false, // Optional for Artisan Journey
        limits: {
          testimonials: 3,
          awards: 3
        }
      };
    }
    // Default - all fields optional
    return {
      fields: ['testimonials', 'cases', 'metrics', 'awards'],
      required: false,
      limits: {
        testimonials: 10,
        cases: 10,
        metrics: 10,
        awards: 10
      }
    };
  };

  const config = getTemplateConfig();
  // Validation function
  const validateStep = () => {
    if (!config.required) return true; // Optional for most templates
    
    // For Our Journey template, check if at least some content is provided
    if (selectedTemplate === 'our-journey') {
    const { testimonials = [], cases = [], awards = [] } = productStoryData.impact || {};
    const hasTestimonials = testimonials.some(t => t.trim());
    const hasCases = cases.some(c => c.trim());
    const hasAwards = awards.some(a => a.trim());
    
    // At least one section should have content
    return hasTestimonials || hasCases || hasAwards;
    }
    
    return true;
  };

  // Render field section based on template requirements
  const renderFieldSection = (fieldName) => {
    if (!config.fields.includes(fieldName)) return null;

    const fieldConfig = {
      testimonials: {
        label: 'Customer Testimonials & Reviews',
        placeholder: 'Customer testimonial or review...',
        buttonText: 'Add Testimonial',
        type: 'textarea',
        rows: 2
      },
      cases: {
        label: 'Success Stories & Case Studies',
        placeholder: 'Success story or case study...',
        buttonText: 'Add Case Study',
        type: 'textarea',
        rows: 3
      },
      metrics: {
        label: 'Usage Statistics & Metrics',
        placeholder: 'e.g., 10,000+ satisfied customers, 95% success rate',
        buttonText: 'Add Metric',
        type: 'input'
      },
      awards: {
        label: 'Awards & Recognition',
        placeholder: 'Award, certification, or recognition received...',
        buttonText: 'Add Award',
        type: 'input'
      }
    };

    const field = fieldConfig[fieldName];
    if (!field) return null;

    const impact = productStoryData.impact || {};
    const currentItems = impact[fieldName] || [];
    const maxItems = config.limits[fieldName] || 10;

    return (
      <div key={fieldName}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label} {config.required && '*'} (max {maxItems})
        </label>
        {currentItems.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <div className="flex-1">
              {field.type === 'textarea' ? (
                <textarea
                  value={item}
                  onChange={(e) => {
                    if (e.target.value.length <= 600) {
                      handleArrayInputChange('impact', fieldName, index, e.target.value);
                    }
                  }}
                  maxLength={600}
                  rows={field.rows}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    if (e.target.value.length <= 600) {
                      handleArrayInputChange('impact', fieldName, index, e.target.value);
                    }
                  }}
                  maxLength={600}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={field.placeholder}
                />
              )}
              <div className="text-xs text-gray-500 mt-1">{item.length}/600</div>
            </div>
            <Button
              onClick={() => removeArrayItem('impact', fieldName, index)}
              variant="outline"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
        {currentItems.length < maxItems && (
          <Button
            onClick={() => addArrayItem('impact', fieldName)}
            variant="outline"
            size="sm"
          >
            {field.buttonText}
          </Button>
        )}
      </div>
    );
  };

  // Add validation status to parent component
  React.useEffect(() => {
    if (updateValidation) {
      updateValidation('step5', validateStep());
    }
  }, [productStoryData.impact, updateValidation]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Award className="mx-auto mb-4 text-yellow-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Impact & Social Proof</h2>
        <p className="text-gray-600">Show the real-world impact and customer success</p>
      </div>

      <div className="space-y-6">
        {config.fields.map(fieldName => renderFieldSection(fieldName))}
      </div>

      {config.required && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This template requires at least some impact content. Add testimonials, case studies, or awards to showcase your product's success.
          </p>
        </div>
      )}
    </div>
  );
}