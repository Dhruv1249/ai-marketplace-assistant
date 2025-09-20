"use client";

import React from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui';

export default function VisualsStep({ 
  productStoryData, 
  handlePhotoUpload, 
  removePhoto, 
  fileInputRefs,
  selectedTemplate,
  updateValidation
}) {
  
  // Get template configuration
  const getTemplateConfig = () => {
    if (selectedTemplate === 'our-journey') {
      return {
        fields: ['beforeAfter'], // Only before/after images needed
        required: true,
        limits: {
          beforeAfter: { min: 2, max: 2 } // Exactly 2 images required
        },
        descriptions: {
          beforeAfter: 'Upload exactly 2 images: one "before" and one "after" to showcase the transformation your product provides. This is essential for the Our Journey template.'
        }
      };
    } else if (selectedTemplate === 'artisan-journey') {
      return {
        fields: ['hero', 'process'], // Hero and process images
        required: false,
        limits: {
          hero: { min: 0, max: 6 }, // Up to 6 hero images
          process: { min: 0, max: 1 } // Up to 1 process image
        },
        descriptions: {
          hero: 'Main product photos and hero images that showcase your artisan work. (Max 6 images)',
          process: 'Behind-the-scenes photos showing your craftsmanship and creation process. (Max 1 image)'
        }
      };
    }
    // Default - all fields optional
    return {
      fields: ['hero', 'process', 'lifestyle', 'beforeAfter'],
      required: false,
      limits: {
        hero: { min: 0, max: 10 },
        process: { min: 0, max: 8 },
        lifestyle: { min: 0, max: 6 },
        beforeAfter: { min: 0, max: 4 }
      },
      descriptions: {
        hero: 'Main product photos that showcase your product beautifully. (Max 10 images)',
        process: 'Show how your product is made, the workspace, tools, or creation process. (Max 8 images)',
        lifestyle: 'Show your product in use, lifestyle contexts, or real-world scenarios. (Max 6 images)',
        beforeAfter: 'Demonstrate the transformation or results your product provides. (Max 4 images)'
      }
    };
  };

  const config = getTemplateConfig();

  // Validation function
  const validateStep = () => {
    if (!config.required) return true; // Optional for most templates
    
    // For Our Journey template, check if exactly 2 before/after images
    if (selectedTemplate === 'our-journey') {
      const beforeAfterCount = productStoryData.visuals.beforeAfter?.length || 0;
      return beforeAfterCount === 2; // Must have exactly 2 images
    }
    
    return true;
  };

  // Enhanced photo upload handler with limits
  const handlePhotoUploadWithLimits = (event, visualType) => {
    const files = Array.from(event.target.files);
    const currentCount = productStoryData.visuals[visualType]?.length || 0;
    const limits = config.limits[visualType];
    
    if (limits) {
      const maxAllowed = limits.max - currentCount;
      if (maxAllowed <= 0) {
        alert(`Maximum ${limits.max} images allowed for ${visualType}`);
        return;
      }
      
      if (files.length > maxAllowed) {
        alert(`You can only upload ${maxAllowed} more image(s). Maximum ${limits.max} images allowed.`);
        return;
      }
      
      // For beforeAfter in Our Journey, ensure exactly 2 images
      if (visualType === 'beforeAfter' && selectedTemplate === 'our-journey') {
        if (currentCount + files.length !== 2) {
          alert('Please upload exactly 2 images for Before & After (one before, one after)');
          return;
        }
      }
    }
    
    // Call the original handler
    handlePhotoUpload(event, visualType);
  };

  // Add validation status to parent component
  React.useEffect(() => {
    if (updateValidation) {
      updateValidation('step6', validateStep());
    }
  }, [productStoryData.visuals, updateValidation, selectedTemplate]);

  const visualCategories = [
    {
      key: 'hero',
      title: 'Hero Product Images',
      description: 'Main product photos that showcase your product beautifully.',
      ref: 'hero'
    },
    {
      key: 'process',
      title: 'Process & Behind-the-Scenes',
      description: 'Show how your product is made, the workspace, tools, or creation process.',
      ref: 'process'
    },
    {
      key: 'lifestyle',
      title: 'Lifestyle & Usage Photos',
      description: 'Show your product in use, lifestyle contexts, or real-world scenarios.',
      ref: 'lifestyle'
    },
    {
      key: 'beforeAfter',
      title: 'Before & After Results',
      description: 'Demonstrate the transformation or results your product provides.',
      ref: 'beforeAfter'
    }
  ];

  // Render photo section based on template requirements
  const renderPhotoSection = (fieldKey) => {
    if (!config.fields.includes(fieldKey)) return null;

    const category = visualCategories.find(cat => cat.key === fieldKey);
    if (!category) return null;

    const description = config.descriptions[fieldKey] || category.description;
    const currentCount = productStoryData.visuals[fieldKey]?.length || 0;
    const limits = config.limits[fieldKey];
    const isAtLimit = limits && currentCount >= limits.max;
    const needsMore = limits && currentCount < limits.min;

    return (
      <div key={category.key} className={`border rounded-lg p-6 ${
        needsMore ? 'border-red-300 bg-red-50' : 
        isAtLimit ? 'border-green-300 bg-green-50' : 
        'border-gray-200'
      }`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {category.title} {config.required && '*'}
          {limits && (
            <span className="ml-2 text-xs text-gray-500">
              ({currentCount}/{limits.max} images)
            </span>
          )}
        </label>
        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>

        {/* Status indicator for Our Journey before/after */}
        {fieldKey === 'beforeAfter' && selectedTemplate === 'our-journey' && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            currentCount === 2 ? 'bg-green-100 text-green-800' :
            currentCount === 1 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {currentCount === 2 ? '✅ Perfect! You have exactly 2 images (before & after)' :
             currentCount === 1 ? '⚠️ Upload 1 more image to complete the before & after pair' :
             '❌ Please upload exactly 2 images: one before and one after'}
          </div>
        )}
        
        {/* Photo Grid - Dynamic based on number of photos */}
        {currentCount > 0 && (
          <div className={`grid gap-4 mb-4 ${
            currentCount === 1 ? 'grid-cols-1 max-w-xs' :
            currentCount === 2 ? 'grid-cols-2 max-w-md' :
            currentCount <= 4 ? 'grid-cols-2 md:grid-cols-4' :
            currentCount <= 6 ? 'grid-cols-2 md:grid-cols-3' :
            'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
          }`}>
            {productStoryData.visuals[fieldKey].map((photo, index) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={`${category.title} ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border hover:border-blue-300 transition-colors"
                />
                <button
                  onClick={() => removePhoto(fieldKey, photo.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ×
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {fieldKey === 'beforeAfter' && selectedTemplate === 'our-journey' ? 
                    (index === 0 ? 'Before' : 'After') : 
                    `${index + 1}`
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handlePhotoUploadWithLimits(e, fieldKey)}
          className="hidden"
          ref={fileInputRefs[category.ref]}
        />
        
        <Button
          onClick={() => fileInputRefs[category.ref]?.current?.click()}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          disabled={isAtLimit}
        >
          <Upload size={16} />
          {isAtLimit ? 'Maximum Reached' : `Upload ${category.title}`}
          {currentCount > 0 && (
            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
              needsMore ? 'bg-red-100 text-red-800' :
              isAtLimit ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {currentCount}
            </span>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <ImageIcon className="mx-auto mb-4 text-indigo-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Visual Storytelling</h2>
        <p className="text-gray-600">Add compelling visuals to bring your story to life</p>
      </div>

      {/* Dynamic Photo Sections - Only show fields required by template */}
      <div className="space-y-6">
        {config.fields.map(fieldKey => renderPhotoSection(fieldKey))}
      </div>

      {/* Template-specific note */}
      {config.required && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This template requires specific visual content. Please upload the requested images to complete your story.
          </p>
        </div>
      )}

      {/* Summary - Only show relevant categories */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Photo Summary</h4>
        <div className={`grid gap-4 text-sm ${
          config.fields.length === 1 ? 'grid-cols-1' :
          config.fields.length === 2 ? 'grid-cols-2' :
          config.fields.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 md:grid-cols-4'
        }`}>
          {config.fields.map(fieldKey => {
            const category = visualCategories.find(cat => cat.key === fieldKey);
            return category ? (
              <div key={fieldKey} className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(productStoryData.visuals[fieldKey] || []).length}
                </div>
                <div className="text-blue-800 text-xs">
                  {category.title.split(' ')[0]} Photos
                </div>
              </div>
            ) : null;
          })}
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Total: {config.fields.reduce((total, fieldKey) => total + (productStoryData.visuals[fieldKey]?.length || 0), 0)} photos uploaded
        </p>
      </div>
    </div>
  );
}