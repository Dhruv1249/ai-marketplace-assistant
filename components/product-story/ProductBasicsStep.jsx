"use client";

import React from 'react';
import { Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ProductBasicsStep({ 
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
        fields: ['name', 'value'],
        limits: {
          name: { max: 5, type: 'words' },
          value: { max: 60, type: 'words' }
        }
      };
    } else if (selectedTemplate === 'artisan-journey') {
      return {
        fields: ['name', 'value'],
        limits: {
          name: { max: 5, type: 'words' },
          value: { max: 20, type: 'words' }
        }
      };
    }
    // Default - show all fields
    return {
      fields: ['name', 'category', 'problem', 'audience', 'value'],
      limits: {
        name: { max: 200, type: 'chars' },
        value: { max: 500, type: 'chars' },
        category: { max: 100, type: 'chars' },
        problem: { max: 300, type: 'chars' },
        audience: { max: 150, type: 'chars' }
      }
    };
  };

  // Count words in a string
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const config = getTemplateConfig();

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
    // Check only the fields required by the template
    const requiredFields = config.fields;
    const hasEmptyFields = requiredFields.some(fieldName => {
      const fieldValue = productStoryData.basics[fieldName];
      return !fieldValue || !fieldValue.trim();
    });
    
    // Check template-specific validation
    const hasInvalidFields = requiredFields.some(fieldName => {
      const fieldValue = productStoryData.basics[fieldName];
      return !validateField(fieldName, fieldValue);
    });
    
    return !hasEmptyFields && !hasInvalidFields;
  };

  // Render field based on template requirements
  const renderField = (fieldName) => {
    if (!config.fields.includes(fieldName)) return null;

    const fieldConfig = {
      name: {
        label: 'Product Name',
        placeholder: 'Your amazing product name',
        type: 'input'
      },
      value: {
        label: 'Value Proposition',
        placeholder: 'What value does your product provide? Why should customers choose it?',
        type: 'textarea',
        rows: 3
      },
      category: {
        label: 'Category/Type',
        placeholder: 'e.g., Electronics, Handmade, Software, Food',
        type: 'input'
      },
      problem: {
        label: 'Main Problem It Solves',
        placeholder: 'What specific problem does your product solve? What pain point does it address?',
        type: 'textarea',
        rows: 4
      },
      audience: {
        label: 'Target Audience',
        placeholder: 'Who is this product for? e.g., Busy professionals, Parents, Students',
        type: 'input'
      }
    };

    const field = fieldConfig[fieldName];
    if (!field) return null;

    return (
      <div key={fieldName} className={fieldName === 'name' || fieldName === 'category' ? '' : 'md:col-span-2'}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label} * ({getCountDisplay(fieldName, productStoryData.basics[fieldName])})
        </label>
        <div className="flex items-start gap-2">
          {field.type === 'textarea' ? (
            <textarea
              value={productStoryData.basics[fieldName]}
              onChange={(e) => {
                if (e.target.value.length <= 600) {
                  handleInputChange('basics', fieldName, e.target.value);
                }
              }}
              maxLength={600}
              rows={field.rows}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder}
            />
          ) : (
            <input
              type="text"
              value={productStoryData.basics[fieldName]}
              onChange={(e) => {
                if (e.target.value.length <= 600) {
                  handleInputChange('basics', fieldName, e.target.value);
                }
              }}
              maxLength={600}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder}
            />
          )}
          <Button
            onClick={() => generateFieldContent('basics', fieldName, productStoryData.basics[fieldName])}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 mt-2"
            disabled={isGenerating || !productStoryData.basics[fieldName].trim()}
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
      updateValidation('step2', validateStep());
    }
  }, [productStoryData.basics, updateValidation]);
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Package className="mx-auto mb-4 text-blue-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Basics</h2>
        <p className="text-gray-600">Tell us about your product and what makes it special</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.fields.map(fieldName => renderField(fieldName))}
      </div>
    </div>
  );
}