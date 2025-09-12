"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Save, Package, Lightbulb, User, Award, Image as ImageIcon, Palette, Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import SaveButton from '@/components/animated icon/SaveButton';

// Import step components
import ProductBasicsStep from '@/components/product-story/ProductBasicsStep';
import ProductStoryStep from '@/components/product-story/ProductStoryStep';
import ProcessStep from '@/components/product-story/ProcessStep';
import ImpactStep from '@/components/product-story/ImpactStep';
import VisualsStep from '@/components/product-story/VisualsStep';
import TemplateStep from '@/components/product-story/TemplateStep';

// Import templates
import ourJourneyTemplate from '@/templates/our-journey1.json';
import artisanJourneyTemplate from '@/templates/artisan-journey-redesign.json';

const TEMPLATE_MAP = {
  'our-journey': ourJourneyTemplate,
  'artisan-journey': artisanJourneyTemplate,
};

export default function ProductStoryPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('our-journey');
  const [productId, setProductId] = useState(null);
  
  const [productStoryData, setProductStoryData] = useState({
    basics: {
      name: '',
      category: '',
      problem: '',
      audience: '',
      value: ''
    },
    story: {
      origin: '',
      solution: '',
      unique: '',
      vision: ''
    },
    process: {
      creation: '',
      materials: '',
      time: '',
      quality: '',
      ethics: ''
    },
    impact: {
      testimonials: [],
      cases: [],
      metrics: [],
      awards: []
    },
    visuals: {
      hero: [],
      process: [],
      beforeAfter: [],
      lifestyle: [],
      team: []
    }
  });

  const fileInputRefs = {
    hero: useRef(null),
    process: useRef(null),
    lifestyle: useRef(null),
    beforeAfter: useRef(null)
  };
  const photoUrlsRef = useRef([]);

  // State for validation instead of using window
  const [validationState, setValidationState] = useState({
    step1: true,  // Template selection - always valid once selected
    step2: false, // Product basics
    step3: false, // Product story
    step4: true,  // Process step is optional
    step5: true,  // Impact step is optional
    step6: true,  // Visuals step is optional
    step7: true   // Review step is always valid
  });

  // Initialize validation system
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.productStoryValidation = validationState;
    }
  }, [validationState]);

  // Validation function to check if current step is valid
  const isCurrentStepValid = () => {
    switch (step) {
      case 1:
        return validationState.step1;
      case 2:
        return validationState.step2;
      case 3:
        return validationState.step3;
      case 4:
        return validationState.step4;
      default:
        return true; // Steps 5, 6, 7 don't have validation
    }
  };

  // Function to update validation state - memoized to prevent infinite loops
  const updateValidation = useCallback((stepKey, isValid) => {
    setValidationState(prev => {
      // Only update if the value has actually changed
      if (prev[stepKey] !== isValid) {
        return {
          ...prev,
          [stepKey]: isValid
        };
      }
      return prev;
    });
  }, []);

  // Load product data from localStorage if coming from product creation
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('productStoryData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.fromProductCreation && parsed.productStoryData) {
          setProductStoryData(parsed.productStoryData);
          setSelectedTemplate(parsed.templateType || 'our-journey');
          setProductId(parsed.productStoryData.productId);
          
          // Clear the flag so it doesn't reload on refresh
          const updatedData = { ...parsed, fromProductCreation: false };
          localStorage.setItem('productStoryData', JSON.stringify(updatedData));
        } else if (parsed.productStoryData) {
          // Regular saved data
          setProductStoryData(parsed.productStoryData);
          setSelectedTemplate(parsed.templateType || 'our-journey');
        }
      }
    } catch (error) {
      console.error('Error loading saved product story data:', error);
    }
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      photoUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
    };
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [step]);

  const handleInputChange = (section, field, value) => {
    setProductStoryData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (section, field, index, value) => {
    setProductStoryData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addArrayItem = (section, field) => {
    setProductStoryData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], '']
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setProductStoryData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const generateFieldContent = async (section, fieldType, currentValue) => {
    setIsGenerating(true);
    try {
      let prompt = '';
      const context = `Product: ${productStoryData.basics.name}, Category: ${productStoryData.basics.category}, Problem: ${productStoryData.basics.problem}`;
      
      switch (fieldType) {
        case 'category':
          prompt = `Suggest a better category or product type for: "${currentValue}". Context: ${context}. Return only the improved category name, be specific and clear. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'problem':
          prompt = `Improve this problem description to be more compelling: "${currentValue}". Context: ${context}. Make it clear what specific problem this product solves. 2-3 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'audience':
          prompt = `Refine this target audience description: "${currentValue}". Context: ${context}. Be more specific about who would benefit from this product. Return only the improved audience description. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'value':
          prompt = `Write a compelling value proposition for this product: "${currentValue}". Context: ${context}. Explain why customers should choose this product and what unique value it provides. 2-3 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'origin':
          prompt = `Write a compelling origin story for this product: "${currentValue}". Context: ${context}. Make it engaging and authentic, explaining how and why this product was created. 3-4 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'solution':
          prompt = `Describe the solution journey for this product: "${currentValue}". Context: ${context}. Explain how this product solves the problem and the journey to create it. 3-4 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'unique':
          prompt = `Explain what makes this product unique and special: "${currentValue}". Context: ${context}. Highlight the differentiators and special qualities. 2-3 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'vision':
          prompt = `Write about the vision and mission behind this product: "${currentValue}". Context: ${context}. Explain the bigger purpose and impact. 2-3 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'creation':
          prompt = `Describe the creation process and craftsmanship: "${currentValue}". Context: ${context}. Explain how it's made, the process, and attention to detail. 3-4 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'materials':
          prompt = `Describe the materials, ingredients, or technology used: "${currentValue}". Context: ${context}. Explain what goes into making this product and why these materials were chosen. 2-3 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'time':
          prompt = `Describe the time investment and expertise required: "${currentValue}". Context: ${context}. Explain the skill level, time commitment, and expertise involved. Return a concise description. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'quality':
          prompt = `Describe quality standards and certifications: "${currentValue}". Context: ${context}. Explain quality control measures, standards followed, and any certifications. 2-3 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        case 'ethics':
          prompt = `Describe sustainability and ethical practices: "${currentValue}". Context: ${context}. Explain how this product is made sustainably or ethically. 2-3 sentences. IMPORTANT: Keep response under 400 characters.`;
          break;
        default:
          prompt = `Improve and make this more compelling for a product story: "${currentValue}". Context: ${context}. IMPORTANT: Keep response under 400 characters.`;
      }

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      handleInputChange(section, fieldType, data.content);
      
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePhotoUpload = (event, visualType) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      photoUrlsRef.current.push(url);
      
      setProductStoryData(prev => ({
        ...prev,
        visuals: {
          ...prev.visuals,
          [visualType]: [...prev.visuals[visualType], {
            id: Date.now() + Math.random(),
            url: url,
            type: 'uploaded',
            name: file.name,
            file: file
          }]
        }
      }));
    });
  };

  const removePhoto = (visualType, photoId) => {
    setProductStoryData(prev => {
      const photoToRemove = prev.visuals[visualType].find(photo => photo.id === photoId);
      
      if (photoToRemove && photoToRemove.type === 'uploaded' && photoToRemove.url) {
        try {
          URL.revokeObjectURL(photoToRemove.url);
          photoUrlsRef.current = photoUrlsRef.current.filter(url => url !== photoToRemove.url);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      return {
        ...prev,
        visuals: {
          ...prev.visuals,
          [visualType]: prev.visuals[visualType].filter(photo => photo.id !== photoId)
        }
      };
    });
  };

  const handlePreview = () => {
    try {
      const selectedTemplateModel = TEMPLATE_MAP[selectedTemplate] || ourJourneyTemplate;
      
      // FIXED: Save in the format expected by UniversalPreviewPage
      const payload = {
        productStoryData: productStoryData,
        templateType: selectedTemplate,
        model: selectedTemplateModel,
        content: productStoryData,
        images: getAllImages()
      };
      
      console.log('=== PREVIEW PAYLOAD DEBUG ===');
      console.log('Product Story Data:', productStoryData);
      console.log('Template Type:', selectedTemplate);
      console.log('Has basics.name:', !!productStoryData.basics.name);
      console.log('Has basics.value:', !!productStoryData.basics.value);
      console.log('Has story.origin:', !!productStoryData.story.origin);
      console.log('Visuals data:', productStoryData.visuals);
      console.log('Payload keys:', Object.keys(payload));
      console.log('==============================');
      
      localStorage.setItem('productStoryPreviewData', JSON.stringify(payload));
      window.open('/seller-info/preview', '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to save preview data:', error);
      alert('Failed to open preview. Please try again.');
    }
  };

  const getAllImages = () => {
    const allImages = [];
    Object.values(productStoryData.visuals).forEach(visualArray => {
      visualArray.forEach(visual => {
        if (visual.url) allImages.push(visual.url);
      });
    });
    return allImages;
  };

  const handleSave = () => {
    localStorage.setItem('productStoryData', JSON.stringify({
      productStoryData,
      templateType: selectedTemplate,
      savedAt: new Date().toISOString()
    }));
    alert('Product story saved successfully!');
  };

  const handlePublishCustomPage = async () => {
    if (!productId) {
      alert('No product ID found. Please create this story page from a published product.');
      return;
    }

    try {
      // Get the selected template model
      const selectedTemplateModel = TEMPLATE_MAP[selectedTemplate] || ourJourneyTemplate;
      
      // Prepare custom page data with proper model structure
      const customPageData = {
        productId: productId,
        templateType: selectedTemplate,
        model: selectedTemplateModel,
        content: productStoryData,
        productStoryData: productStoryData,
        publishedAt: new Date().toISOString()
      };

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('customData', JSON.stringify(customPageData));

      // Add custom page images
      let imageIndex = 0;
      Object.values(productStoryData.visuals).forEach(visualArray => {
        visualArray.forEach(visual => {
          if (visual.file) {
            formData.append(`customImage_${imageIndex}`, visual.file);
            imageIndex++;
          }
        });
      });

      // Save custom page data
      const response = await fetch('/api/products/save-custom', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Product story page published successfully!');
        // Optionally redirect to the product page
        window.open(`/marketplace/${productId}`, '_blank');
      } else {
        alert(`Failed to publish: ${result.error}`);
      }
    } catch (error) {
      console.error('Error publishing custom page:', error);
      alert('An error occurred while publishing the story page.');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="text-blue-600" size={32} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Choose Your Template
              </h2>
              <p className="text-gray-600 mb-8">
                Select a template layout for your product story. This will determine the form fields and requirements.
              </p>
            </div>

            {/* Template Selection */}
            <TemplateStep
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              productStoryData={productStoryData}
            />
          </div>
        );
      case 2:
        return (
          <ProductBasicsStep
            productStoryData={productStoryData}
            handleInputChange={handleInputChange}
            generateFieldContent={generateFieldContent}
            isGenerating={isGenerating}
            updateValidation={updateValidation}
            selectedTemplate={selectedTemplate}
          />
        );
      case 3:
        return (
          <ProductStoryStep
            productStoryData={productStoryData}
            handleInputChange={handleInputChange}
            generateFieldContent={generateFieldContent}
            isGenerating={isGenerating}
            updateValidation={updateValidation}
            selectedTemplate={selectedTemplate}
          />
        );
      case 4:
        return (
          <ProcessStep
            productStoryData={productStoryData}
            handleInputChange={handleInputChange}
            generateFieldContent={generateFieldContent}
            isGenerating={isGenerating}
            updateValidation={updateValidation}
            selectedTemplate={selectedTemplate}
          />
        );
      case 5:
        return (
          <ImpactStep
            productStoryData={productStoryData}
            handleArrayInputChange={handleArrayInputChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
            generateFieldContent={generateFieldContent}
            isGenerating={isGenerating}
            updateValidation={updateValidation}
            selectedTemplate={selectedTemplate}
          />
        );
      case 6:
        return (
          <VisualsStep
            productStoryData={productStoryData}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            fileInputRefs={fileInputRefs}
            selectedTemplate={selectedTemplate}
          />
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Review & Preview
              </h2>
              <p className="text-gray-600 mb-8">
                Review your product story and preview the final result
              </p>
            </div>

            {/* Story Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Story Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Template:</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedTemplate.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Product Name:</p>
                  <p className="font-medium text-gray-900">{productStoryData.basics.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Category:</p>
                  <p className="font-medium text-gray-900">{productStoryData.basics.category}</p>
                </div>
                <div>
                  <p className="text-gray-600">Images:</p>
                  <p className="font-medium text-gray-900">{getAllImages().length} uploaded</p>
                </div>
              </div>
            </div>

            {/* Ready for Preview */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <h3 className="font-medium text-blue-900 mb-3">Ready for Preview</h3>
              <p className="text-blue-800 text-sm mb-6">
                Your product story is complete. Click "Preview" below to see how it will look, then publish directly from the preview.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Create Product Story</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <SaveButton
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={!productStoryData.basics.name || !productStoryData.basics.category}
            >
              <Save size={16} />
              Save
            </SaveButton>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[
              { number: 1, title: 'Template', icon: Palette, completed: step > 1 },
              { number: 2, title: 'Basics', icon: Package, completed: step > 2 },
              { number: 3, title: 'Story', icon: Lightbulb, completed: step > 3 },
              { number: 4, title: 'Process', icon: User, completed: step > 4 },
              { number: 5, title: 'Impact', icon: Award, completed: step > 5 },
              { number: 6, title: 'Visuals', icon: ImageIcon, completed: step > 6 },
              { number: 7, title: 'Review', icon: Globe, completed: step > 7 }
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === stepItem.number
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : stepItem.completed
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {stepItem.completed ? '✓' : <stepItem.icon size={16} />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === stepItem.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepItem.title}
                </span>{index < 6 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    stepItem.completed ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              disabled={step === 1}
            >
              Previous
            </Button>
            
            <Button
              onClick={() => step === 7 ? handlePreview() : setStep(step + 1)}
              disabled={step === 7 ? false : !isCurrentStepValid()}
            >
              {step === 7 ? (
                <>
                  <Eye className="mr-2" size={16} />
                  Preview
                </>
              ) : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}