"use client";

import React, { useRef } from 'react';
import { Award, User, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ImpactStep({ 
  productStoryData, 
  handleArrayInputChange, 
  addArrayItem, 
  removeArrayItem,
  generateFieldContent,
  isGenerating,
  updateValidation,
  selectedTemplate,
  handlePhotoUpload,
  removePhoto,
  setProductStoryData
}) {
  
  // File input refs for photo uploads
  const testimonialPhotoRefs = useRef({});
  
  // Get template configuration
  const getTemplateConfig = () => {
    if (selectedTemplate === 'our-journey') {
      return {
        fields: ['testimonials', 'awards'], // Removed 'cases' (success stories)
        required: false, // Impact is OPTIONAL for all templates
        limits: {
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
      fields: ['testimonials', 'awards'], // Removed 'cases' and 'metrics'
      required: false,
      limits: {
        testimonials: 10,
        awards: 10
      }
    };
  };

  const config = getTemplateConfig();
  
  // Validation function - Impact is always optional
  const validateStep = () => {
    return true; // Impact step is always optional
  };

  // Handle adding new testimonial with proper structure
  const addTestimonial = () => {
    const impact = productStoryData.impact || {};
    const currentTestimonials = impact.testimonials || [];
    const maxItems = config.limits.testimonials || 10;
    
    if (currentTestimonials.length >= maxItems) {
      alert(`Maximum ${maxItems} testimonials allowed`);
      return;
    }
    
    // Add structured testimonial object
    const newTestimonial = {
      quote: '',
      author: '',
      project: '',
      photo: null // Will be populated when photo is uploaded
    };
    
    // Use setProductStoryData to properly add the new testimonial
    setProductStoryData(prev => {
      const impact = prev.impact || {};
      const testimonials = [...(impact.testimonials || [])];
      testimonials.push(newTestimonial);
      
      return {
        ...prev,
        impact: {
          ...impact,
          testimonials: testimonials
        }
      };
    });
  };

  // Handle adding new award with proper structure
  const addAward = () => {
    const impact = productStoryData.impact || {};
    const currentAwards = impact.awards || [];
    const maxItems = config.limits.awards || 10;
    
    if (currentAwards.length >= maxItems) {
      alert(`Maximum ${maxItems} awards allowed`);
      return;
    }
    
    // Add structured award object
    const newAward = {
      title: '',
      organization: '',
      year: new Date().getFullYear()
    };
    
    // Use setProductStoryData to properly add the new award
    setProductStoryData(prev => {
      const impact = prev.impact || {};
      const awards = [...(impact.awards || [])];
      awards.push(newAward);
      
      return {
        ...prev,
        impact: {
          ...impact,
          awards: awards
        }
      };
    });
  };

  // Handle testimonial photo upload following existing pattern
  const handleTestimonialPhotoUpload = (event, testimonialIndex) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Follow existing image handling pattern
    const url = URL.createObjectURL(file);
    const photoData = {
      id: Date.now() + Math.random(),
      url: url,
      type: 'uploaded',
      name: file.name,
      file: file
    };
    
    // Store original file reference for proper mapping
    if (typeof window !== 'undefined') {
      if (!window.productStoryOriginalFiles) {
        window.productStoryOriginalFiles = [];
      }
      window.productStoryOriginalFiles.push({
        file: file,
        blobUrl: url,
        visualType: 'testimonial',
        name: file.name,
        context: `impact.testimonials[${testimonialIndex}].photo`,
        testimonialIndex: testimonialIndex
      });
    }
    
    // Update testimonial with photo data
    setProductStoryData(prev => {
      const impact = prev.impact || {};
      const testimonials = [...(impact.testimonials || [])];
      if (testimonials[testimonialIndex]) {
        testimonials[testimonialIndex] = {
          ...testimonials[testimonialIndex],
          photo: photoData
        };
      }
      
      return {
        ...prev,
        impact: {
          ...impact,
          testimonials: testimonials
        }
      };
    });
  };

  // Handle removing testimonial photo
  const removeTestimonialPhoto = (testimonialIndex) => {
    setProductStoryData(prev => {
      const impact = prev.impact || {};
      const testimonials = [...(impact.testimonials || [])];
      if (testimonials[testimonialIndex] && testimonials[testimonialIndex].photo) {
        // Clean up URL if it's an uploaded photo
        const photo = testimonials[testimonialIndex].photo;
        if (photo.type === 'uploaded' && photo.url) {
          try {
            URL.revokeObjectURL(photo.url);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        testimonials[testimonialIndex] = {
          ...testimonials[testimonialIndex],
          photo: null
        };
      }
      
      return {
        ...prev,
        impact: {
          ...impact,
          testimonials: testimonials
        }
      };
    });
  };

  // Update testimonial field
  const updateTestimonialField = (index, field, value) => {
    setProductStoryData(prev => {
      const impact = prev.impact || {};
      const testimonials = [...(impact.testimonials || [])];
      if (testimonials[index]) {
        testimonials[index] = {
          ...testimonials[index],
          [field]: value
        };
      }
      
      return {
        ...prev,
        impact: {
          ...impact,
          testimonials: testimonials
        }
      };
    });
  };

  // Update award field
  const updateAwardField = (index, field, value) => {
    setProductStoryData(prev => {
      const impact = prev.impact || {};
      const awards = [...(impact.awards || [])];
      if (awards[index]) {
        awards[index] = {
          ...awards[index],
          [field]: value
        };
      }
      
      return {
        ...prev,
        impact: {
          ...impact,
          awards: awards
        }
      };
    });
  };

  // Render testimonials section
  const renderTestimonialsSection = () => {
    if (!config.fields.includes('testimonials')) return null;

    const impact = productStoryData.impact || {};
    const testimonials = impact.testimonials || [];
    const maxItems = config.limits.testimonials || 10;

    return (
      <div className="border rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Testimonials {config.required && '*'} 
          <span className="ml-2 text-xs text-gray-500">
            ({testimonials.length}/{maxItems} testimonials)
          </span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Add customer testimonials with quotes, author names, project details, and optional photos.
        </p>

        {testimonials.map((testimonial, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">Testimonial {index + 1}</h4>
              <Button
                onClick={() => removeArrayItem('impact', 'testimonials', index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quote */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Customer Quote *
                </label>
                <textarea
                  value={testimonial.quote || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 800) {
                      updateTestimonialField(index, 'quote', e.target.value);
                    }
                  }}
                  maxLength={800}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="What did the customer say about your product?"
                />
                <div className="text-xs text-gray-500 mt-1">{(testimonial.quote || '').length}/800</div>
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={testimonial.author || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 800) {
                      updateTestimonialField(index, 'author', e.target.value);
                    }
                  }}
                  maxLength={800}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Customer's name"
                />
                <div className="text-xs text-gray-500 mt-1">{(testimonial.author || '').length}/800</div>
              </div>

              {/* Project/Context */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Project/Context
                </label>
                <input
                  type="text"
                  value={testimonial.project || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 800) {
                      updateTestimonialField(index, 'project', e.target.value);
                    }
                  }}
                  maxLength={800}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Project name or context"
                />
                <div className="text-xs text-gray-500 mt-1">{(testimonial.project || '').length}/800</div>
              </div>

              {/* Customer Photo */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Customer Photo (Optional)
                </label>
                {testimonial.photo ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.photo.url}
                      alt={`${testimonial.author || 'Customer'} photo`}
                      className="w-16 h-16 object-cover rounded-full border"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{testimonial.photo.name}</p>
                      <Button
                        onClick={() => removeTestimonialPhoto(index)}
                        variant="outline"
                        size="sm"
                        className="mt-1 text-red-600 hover:text-red-700"
                      >
                        Remove Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTestimonialPhotoUpload(e, index)}
                      className="hidden"
                      ref={el => testimonialPhotoRefs.current[index] = el}
                    />
                    <Button
                      onClick={() => testimonialPhotoRefs.current[index]?.click()}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Upload Customer Photo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {testimonials.length < maxItems && (
          <Button
            onClick={addTestimonial}
            variant="outline"
            className="flex items-center gap-2"
          >
            <User size={16} />
            Add Testimonial
          </Button>
        )}
      </div>
    );
  };

  // Render awards section
  const renderAwardsSection = () => {
    if (!config.fields.includes('awards')) return null;

    const impact = productStoryData.impact || {};
    const awards = impact.awards || [];
    const maxItems = config.limits.awards || 10;

    return (
      <div className="border rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Awards & Recognition {config.required && '*'}
          <span className="ml-2 text-xs text-gray-500">
            ({awards.length}/{maxItems} awards)
          </span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Add awards, certifications, or recognition your product has received.
        </p>

        {awards.map((award, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">Award {index + 1}</h4>
              <Button
                onClick={() => removeArrayItem('impact', 'awards', index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Award Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Award Title *
                </label>
                <input
                  type="text"
                  value={award.title || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 800) {
                      updateAwardField(index, 'title', e.target.value);
                    }
                  }}
                  maxLength={800}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Name of the award or recognition"
                />
                <div className="text-xs text-gray-500 mt-1">{(award.title || '').length}/800</div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={award.year || new Date().getFullYear()}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year >= 1900 && year <= new Date().getFullYear() + 10) {
                      updateAwardField(index, 'year', year);
                    }
                  }}
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Organization */}
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Awarding Organization
                </label>
                <input
                  type="text"
                  value={award.organization || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 800) {
                      updateAwardField(index, 'organization', e.target.value);
                    }
                  }}
                  maxLength={800}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Organization or institution that gave the award"
                />
                <div className="text-xs text-gray-500 mt-1">{(award.organization || '').length}/800</div>
              </div>
            </div>
          </div>
        ))}

        {awards.length < maxItems && (
          <Button
            onClick={addAward}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Award size={16} />
            Add Award
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
        <p className="text-gray-600">Add customer testimonials and awards to build credibility</p>
      </div>

      <div className="space-y-6">
        {renderTestimonialsSection()}
        {renderAwardsSection()}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Impact Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(productStoryData.impact?.testimonials || []).length}
            </div>
            <div className="text-blue-800 text-xs">Testimonials</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(productStoryData.impact?.awards || []).length}
            </div>
            <div className="text-blue-800 text-xs">Awards</div>
          </div>
        </div>
        <p className="text-sm text-blue-700 mt-3 text-center">
          <strong>Optional:</strong> Add testimonials and awards to build credibility and showcase your product's success.
        </p>
      </div>
    </div>
  );
}