"use client";

import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ProductStoryStep({ 
  productStoryData, 
  handleInputChange, 
  generateFieldContent, 
  isGenerating,
  updateValidation,
  selectedTemplate
}) {
  
  // Get template configuration
  const getTemplateConfig = () => {
    if (selectedTemplate === 'our-journey') {
      return {
        fields: [], // Our Journey doesn't need story fields
        limits: {}
      };
    } else if (selectedTemplate === 'artisan-journey') {
      return {
        fields: ['origin', 'unique', 'vision'],
        limits: {
          origin: { max: 50, type: 'words' },
          unique: { max: 30, type: 'words' },
          vision: { max: 50, type: 'words' }
        }
      };
    }
    // Default - show all fields
    return {
      fields: ['origin', 'solution', 'unique', 'vision'],
      limits: {
        origin: { max: 600, type: 'chars' },
        solution: { max: 600, type: 'chars' },
        unique: { max: 600, type: 'chars' },
        vision: { max: 600, type: 'chars' }
      }
    };
  };

  const config = getTemplateConfig();

  // If no fields are required for this template, show a message
  if (config.fields.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Lightbulb className="mx-auto mb-4 text-purple-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">The Story</h2>
          <p className="text-gray-600">This template doesn't require additional story fields</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="font-medium text-green-900 mb-2">✓ Story Step Complete</h3>
          <p className="text-sm text-green-800">
            The "{selectedTemplate.replace('-', ' ')}" template uses your product basics for the story section.
          </p>
        </div>
      </div>
    );
  }

  // Count words in a string
  const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Validate field based on template requirements
  const validateField = (fieldName, value) => {
    const limits = config.limits[fieldName];
    if (!limits) return true;

    if (limits.type === 'words') {
      const wordCount = countWords(value);
      return wordCount <= limits.max;
    } else {
      return value.length <= limits.max;
    }
  };

  // Get current count display
  const getCountDisplay = (fieldName, value) => {
    const limits = config.limits[fieldName];
    if (!limits) return `${value.length}/600`;

    if (limits.type === 'words') {
      const wordCount = countWords(value);
      return `${wordCount}/${limits.max} words`;
    } else {
      return `${value.length}/${limits.max}`;
    }
  };
  // Validation function to check if all mandatory fields are filled and within limits
  const validateStep = () => {
    // If no fields are required, step is always valid
    if (config.fields.length === 0) return true;
    
    // Check only the fields required by the template
    const requiredFields = config.fields;
    const story = productStoryData.story || {};
    const hasEmptyFields = requiredFields.some(fieldName => {
      const fieldValue = story[fieldName];
      return !fieldValue || !fieldValue.trim();
    });
    
    // Check template-specific validation
    const hasInvalidFields = requiredFields.some(fieldName => {
      const fieldValue = story[fieldName];
      return !validateField(fieldName, fieldValue);
    });
    
    return !hasEmptyFields && !hasInvalidFields;
  };

  // Render field based on template requirements
  const renderField = (fieldName) => {
    const fieldConfig = {
      origin: {
        label: 'Origin Story',
        placeholder: 'How and why was this product created? What inspired you to make it?',
        rows: 4
      },
      solution: {
        label: 'Solution Journey',
        placeholder: 'Describe the journey of creating this solution. What challenges did you overcome?',
        rows: 4
      },
      unique: {
        label: 'What Makes It Unique',
        placeholder: 'What makes your product special and different from others?',
        rows: 3
      },
      vision: {
        label: 'Vision & Mission',
        placeholder: "What's the bigger vision or mission behind this product?",
        rows: 3,
        optional: true
      }
    };

    const field = fieldConfig[fieldName];
    if (!field) return null;

    return (
      <div key={fieldName}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label} {!field.optional && '*'} ({getCountDisplay(fieldName, productStoryData.story?.[fieldName])})
        </label>
        <div className="flex items-start gap-2">
          <textarea
            value={productStoryData.story?.[fieldName] ?? ''}
            onChange={(e) => {
              if (e.target.value.length <= 600) {
                handleInputChange('story', fieldName, e.target.value);
              }
            }}
            maxLength={600}
            rows={field.rows}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder}
          />
          <Button
            onClick={() => generateFieldContent('story', fieldName, productStoryData.story[fieldName])}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !(productStoryData.story?.[fieldName]?.trim())}
          >
            <Sparkles size={14} />
          </Button>
        </div>
      </div>
    );
  };

  // Add validation status to parent component
  React.useEffect(() => {
    if (updateValidation) {
      updateValidation('step3', validateStep());
    }
  }, [productStoryData.story, updateValidation]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Lightbulb className="mx-auto mb-4 text-purple-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">The Story</h2>
        <p className="text-gray-600">Share the compelling story behind your product</p>
      </div>

      <div className="space-y-6">
        {config.fields.map(fieldName => renderField(fieldName))}
      </div>
    </div>
  );
}