"use client";

import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ProcessStep({ 
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
        fields: ['creation', 'materials', 'time', 'quality', 'ethics'],
        limits: {
          creation: { max: 800, type: 'chars' },
          materials: { max: 800, type: 'chars' },
          time: { max: 800, type: 'chars' },
          quality: { max: 800, type: 'chars' },
          ethics: { max: 800, type: 'chars' }
        },
        required: true // All fields are required for Our Journey
      };
    } else if (selectedTemplate === 'artisan-journey') {
      return {
        fields: ['creation', 'materials', 'quality', 'ethics'],
        limits: {
          creation: { max: 800, type: 'chars' },
          materials: { max: 800, type: 'chars' },
          quality: { max: 800, type: 'chars' },
          ethics: { max: 800, type: 'chars' }
        },
        required: true // All fields are required for Artisan Journey
      };
    }
    // Default - all fields optional
    return {
      fields: ['creation', 'materials', 'time', 'quality', 'ethics'],
      limits: {
        creation: { max: 800, type: 'chars' },
        materials: { max: 800, type: 'chars' },
        time: { max: 800, type: 'chars' },
        quality: { max: 800, type: 'chars' },
        ethics: { max: 800, type: 'chars' }
      },
      required: false // Optional for default templates
    };
  };

  const config = getTemplateConfig();

  // Count words in a string
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Validate field based on template requirements
  const validateField = (fieldName, value) => {
    const safeValue = value || '';
    const limits = config.limits[fieldName];
    if (!limits) return true;

    if (limits.type === 'words') {
      const wordCount = countWords(safeValue);
      return wordCount <= limits.max;
    } else {
      return safeValue.length <= limits.max;
    }
  };

  // Get current count display
  const getCountDisplay = (fieldName, value) => {
    const safeValue = value || '';
    const limits = config.limits[fieldName];
    if (!limits) return `${safeValue.length}/800`;

    if (limits.type === 'words') {
      const wordCount = countWords(safeValue);
      return `${wordCount}/${limits.max} words`;
    } else {
      return `${safeValue.length}/${limits.max}`;
    }
  };
  // Validation function
  const validateStep = () => {
    // Check only the fields required by the template
    const requiredFields = config.fields;
    
    if (config.required) {
      // Check if required fields are filled
      const process = productStoryData.process || {};
      const hasEmptyFields = requiredFields.some(fieldName => {
        const fieldValue = process[fieldName];
        return !fieldValue || !fieldValue.trim();
      });
      
      if (hasEmptyFields) return false;
    }
    
    // Check template-specific validation
    const process = productStoryData.process || {};
    const hasInvalidFields = requiredFields.some(fieldName => {
      const fieldValue = process[fieldName];
      return !validateField(fieldName, fieldValue);
    });
    
    return !hasInvalidFields;
  };

  // Render field based on template requirements
  const renderField = (fieldName) => {
    if (!config.fields.includes(fieldName)) return null;

    const fieldConfig = {
      creation: {
        label: 'Creation Process & Craftsmanship',
        placeholder: "How is your product made? What's the process and craftsmanship involved?",
        type: 'textarea',
        rows: 4
      },
      materials: {
        label: 'Materials/Ingredients/Technology',
        placeholder: 'What materials, ingredients, or technology are used in your product?',
        type: 'textarea',
        rows: 3
      },
      time: {
        label: 'Time Investment & Expertise',
        placeholder: 'How much time and expertise goes into making this product?',
        type: 'input'
      },
      quality: {
        label: 'Quality Standards & Certifications',
        placeholder: 'What quality standards do you follow? Any certifications or guarantees?',
        type: 'textarea',
        rows: 3
      },
      ethics: {
        label: 'Sustainability & Ethics',
        placeholder: 'How is your product sustainable or ethically made?',
        type: 'textarea',
        rows: 3
      }
    };

    const field = fieldConfig[fieldName];
    if (!field) return null;
    // SAFE fallback: make sure process object exists
    const process = productStoryData.process || {};
    const fieldValue = typeof process[fieldName] === 'undefined' ? '' : process[fieldName];
    return (
      <div key={fieldName}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label} {config.required && '*'} ({getCountDisplay(fieldName, fieldValue)})
        </label>
        <div className="flex items-start gap-2">
          {field.type === 'textarea' ? (
            <textarea
              value={fieldValue}
              onChange={(e) => {
                if (e.target.value.length <= 800) {
                  handleInputChange('process', fieldName, e.target.value);
                }
              }}
              maxLength={800}
              rows={field.rows}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder}
            />
          ) : (
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => {
                if (e.target.value.length <= 800) {
                  handleInputChange('process', fieldName, e.target.value);
                }
              }}
              maxLength={800}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder}
            />
          )}
          <Button
            onClick={() => generateFieldContent('process', fieldName, fieldValue)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !fieldValue.trim()}
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
      updateValidation('step4', validateStep());
    }
  }, [productStoryData.process, updateValidation]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="mx-auto mb-4 text-green-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Behind the Scenes</h2>
        <p className="text-gray-600">Show the craftsmanship and process behind your product</p>
      </div>

      <div className="space-y-6">
        {config.fields.map(fieldName => renderField(fieldName))}
      </div>
    </div>
  );
}