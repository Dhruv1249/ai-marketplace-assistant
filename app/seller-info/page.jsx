"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Save, Package, Lightbulb, User, Award, Image as ImageIcon, Palette } from 'lucide-react';
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
import journeyTemplate from '@/components/seller-info/templates/journey-template.json';
import craftTemplate from '@/components/seller-info/templates/craft-template.json';
import impactTemplate from '@/components/seller-info/templates/impact-template.json';
import modernTemplate from '@/components/seller-info/templates/modern-template.json';

const TEMPLATE_MAP = {
  'journey': journeyTemplate,
  'craft': craftTemplate,
  'impact': impactTemplate,
  'modern': modernTemplate,
};

export default function ProductStoryPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('journey');
  
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
          prompt = `Suggest a better category or product type for: "${currentValue}". Context: ${context}. Return only the improved category name, be specific and clear.`;
          break;
        case 'problem':
          prompt = `Improve this problem description to be more compelling: "${currentValue}". Context: ${context}. Make it clear what specific problem this product solves. 2-3 sentences.`;
          break;
        case 'audience':
          prompt = `Refine this target audience description: "${currentValue}". Context: ${context}. Be more specific about who would benefit from this product. Return only the improved audience description.`;
          break;
        case 'value':
          prompt = `Write a compelling value proposition for this product: "${currentValue}". Context: ${context}. Explain why customers should choose this product and what unique value it provides. 2-3 sentences.`;
          break;
        case 'origin':
          prompt = `Write a compelling origin story for this product: "${currentValue}". Context: ${context}. Make it engaging and authentic, explaining how and why this product was created. 3-4 sentences.`;
          break;
        case 'solution':
          prompt = `Describe the solution journey for this product: "${currentValue}". Context: ${context}. Explain how this product solves the problem and the journey to create it. 3-4 sentences.`;
          break;
        case 'unique':
          prompt = `Explain what makes this product unique and special: "${currentValue}". Context: ${context}. Highlight the differentiators and special qualities. 2-3 sentences.`;
          break;
        case 'vision':
          prompt = `Write about the vision and mission behind this product: "${currentValue}". Context: ${context}. Explain the bigger purpose and impact. 2-3 sentences.`;
          break;
        case 'creation':
          prompt = `Describe the creation process and craftsmanship: "${currentValue}". Context: ${context}. Explain how it's made, the process, and attention to detail. 3-4 sentences.`;
          break;
        case 'materials':
          prompt = `Describe the materials, ingredients, or technology used: "${currentValue}". Context: ${context}. Explain what goes into making this product and why these materials were chosen. 2-3 sentences.`;
          break;
        case 'time':
          prompt = `Describe the time investment and expertise required: "${currentValue}". Context: ${context}. Explain the skill level, time commitment, and expertise involved. Return a concise description.`;
          break;
        case 'quality':
          prompt = `Describe quality standards and certifications: "${currentValue}". Context: ${context}. Explain quality control measures, standards followed, and any certifications. 2-3 sentences.`;
          break;
        case 'ethics':
          prompt = `Describe sustainability and ethical practices: "${currentValue}". Context: ${context}. Explain how this product is made sustainably or ethically. 2-3 sentences.`;
          break;
        default:
          prompt = `Improve and make this more compelling for a product story: "${currentValue}". Context: ${context}`;
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
      const selectedTemplateModel = TEMPLATE_MAP[selectedTemplate] || journeyTemplate;
      
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
      window.open('/seller-info/preview', '_blank');
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ProductBasicsStep
            productStoryData={productStoryData}
            handleInputChange={handleInputChange}
            generateFieldContent={generateFieldContent}
            isGenerating={isGenerating}
          />
        );
      case 2:
        return (
          <ProductStoryStep
            productStoryData={productStoryData}
            handleInputChange={handleInputChange}
            generateFieldContent={generateFieldContent}
            isGenerating={isGenerating}
          />
        );
      case 3:
        return (
          <ProcessStep
            productStoryData={productStoryData}
            handleInputChange={handleInputChange}
            generateFieldContent={generateFieldContent}
            isGenerating={isGenerating}
          />
        );
      case 4:
        return (
          <ImpactStep
            productStoryData={productStoryData}
            handleArrayInputChange={handleArrayInputChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
            generateFieldContent={generateFieldContent}
            isGenerating={isGenerating}
          />
        );
      case 5:
        return (
          <VisualsStep
            productStoryData={productStoryData}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            fileInputRefs={fileInputRefs}
          />
        );
      case 6:
        return (
          <TemplateStep
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            productStoryData={productStoryData}
          />
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
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex items-center gap-2"
              disabled={!productStoryData.basics.name || !productStoryData.basics.category}
            >
              <Eye size={16} />
              Preview
            </Button>
            
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
              { number: 1, title: 'Basics', icon: Package, completed: step > 1 },
              { number: 2, title: 'Story', icon: Lightbulb, completed: step > 2 },
              { number: 3, title: 'Process', icon: User, completed: step > 3 },
              { number: 4, title: 'Impact', icon: Award, completed: step > 4 },
              { number: 5, title: 'Visuals', icon: ImageIcon, completed: step > 5 },
              { number: 6, title: 'Template', icon: Palette, completed: step > 6 }
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
                </span>
                {index < 5 && (
                  <div className={`w-12 h-0.5 mx-4 ${
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
              onClick={() => setStep(step + 1)}
              disabled={step === 6 || (step === 1 && (!productStoryData.basics.name || !productStoryData.basics.category))}
            >
              {step === 6 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}