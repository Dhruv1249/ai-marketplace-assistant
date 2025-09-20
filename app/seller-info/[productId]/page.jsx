"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, Save, Package, Lightbulb, User, Award, Image as ImageIcon, Palette, Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import SaveButton from '@/components/animated icon/SaveButton';
import BackButton from '@/components/animated icon/BackButton';
import Loading from '@/app/loading';
import { doc, getDoc } from 'firebase/firestore';
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
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.productId;
  const modeParam = searchParams?.get('mode'); // 'create' | 'edit' | null
  const sectionParam = searchParams?.get('section'); // optional: template|basics|story|process|impact|visuals|review
   const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const photoUrlsRef = useRef([]);
  const heroInputRef = useRef(null);
  const processInputRef = useRef(null);
  const lifestyleInputRef = useRef(null);
  const beforeAfterInputRef = useRef(null);
  
  const fileInputRefs = {
    hero: heroInputRef,
    process: processInputRef,
    lifestyle: lifestyleInputRef,
    beforeAfter: beforeAfterInputRef
  };
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('our-journey');
  const [productData, setProductData] = useState(null);

const [allowStoryEdit, setAllowStoryEdit] = useState(null); // null = loading, false = denied, true = allowed
 // State for validation instead of using window
  const [validationState, setValidationState] = useState({
    step1: true,  // Template selection - always valid once selected
    step2: false, // Product basics
    step3: false, // Product story
    step4: false, // Process step - now required for templates
    step5: true,  // Impact step is optional
    step6: true,  // Visuals step is optional
    step7: true   // Review step is always valid
  });
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
useEffect(() => {
  const checkOwnership = async () => {
    // Dynamic import avoids SSR issues
    const { auth, db } = await import('@/app/login/firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    if (!auth.currentUser) {
      setAllowStoryEdit(false);
      router.push('/login');
      return;
    }
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setAllowStoryEdit(false);
        return;
      }
      const data = docSnap.data();
      if (data.ownerId && data.ownerId === auth.currentUser.uid) {
        setAllowStoryEdit(true); // allow
      } else {
        setAllowStoryEdit(false); // deny
      }
    } catch {
      setAllowStoryEdit(false);
    }
  };
  if (productId) checkOwnership();
}, [productId, router]);
// Initialize validation system
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.productStoryValidation = validationState;
    }
  }, [validationState]);
    // Load product data and any existing custom story data
  useEffect(() => {
  const loadProductData = async () => {
    if (!productId) return;
    let foundAny = false;
    setLoading(true);
    try {
      // Load DIRECTLY from Firestore (skip API route)
      const { db } = await import('@/app/login/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const product = docSnap.data();
        setProductData({ ...product, id: productId });
        foundAny = true;
        setProductStoryData(prev => ({
          ...prev,
          basics: {
            ...prev.basics,
            name: product.title || product.name || '',
            category: product.category || product.type || '',
            problem: product.description || '',
            audience: product.targetAudience || '',
            value: ''
          }
        }));
        const allowPrefill = (modeParam === 'edit') || (modeParam !== 'create' && !!product.customPage);
        if (allowPrefill && product.customPage) {
          setProductStoryData(product.customPage.content || product.customPage.productStoryData || productStoryData);
          setSelectedTemplate(product.customPage.templateType || 'our-journey');
        }
      }
    } catch (err) {
      // Ignore for now, will check localStorage
    }
    // Check localStorage for draft
    try {
      const savedData = localStorage.getItem(`productStoryData_${productId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.productStoryData) {
          setProductStoryData(parsed.productStoryData);
          setSelectedTemplate(parsed.templateType || 'our-journey');
          foundAny = true;
        }
      }
    } catch (ex) {
      // Ignore errors
    }
    // If nothing found, redirect
    if (!foundAny) {
      alert('Product not found. Redirecting to marketplace...');
      router.push('/marketplace');
    }
    setLoading(false);
  };

  loadProductData();
}, [productId, router, modeParam]);
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
  
  // In edit mode (or when an explicit section is provided), jump to that section (declare before any early return)
  useEffect(() => {
    const targetKey = sectionParam || (modeParam === 'edit' ? 'review' : null);
    if (!targetKey) return;
    const steps = getTemplateSteps();
    const idx = steps.findIndex((s) => s.key === targetKey);
    if (idx !== -1) setStep(steps[idx].number);
  }, [modeParam, sectionParam, selectedTemplate]);

if (allowStoryEdit === null) {
  return <div>Loading...</div>;
}
if (allowStoryEdit === false) {
  return <div>You are not authorized to add a story page to this product.</div>;
}



 
  

  // Validation function to check if current step is valid
  const isCurrentStepValid = () => {
    const currentStepKey = getCurrentStepKey();
    
    switch (currentStepKey) {
      case 'template':
        return validationState.step1; // Template selection
      case 'basics':
        return validationState.step2; // Product basics
      case 'story':
        return validationState.step3; // Product story` 
      case 'process':
        return validationState.step4; // Process
      case 'impact':
        return validationState.step5; // Impact
      case 'visuals':
        return validationState.step6; // Visuals
      case 'review':
        return validationState.step7; // Review
      default:
        return true;
    }
  };

  // Function to get missing fields for error message
  const getMissingFields = () => {
    const missingFields = [];
    const currentStepKey = getCurrentStepKey();
    
    switch (currentStepKey) {
      case 'basics': // Product basics
        // Get template-specific required fields
        const basicsFields = selectedTemplate === 'our-journey' || selectedTemplate === 'artisan-journey' 
          ? ['name', 'value'] 
          : ['name', 'category', 'problem', 'audience', 'value'];
        
        basicsFields.forEach(fieldName => {
          const fieldValue = productStoryData.basics[fieldName];
          if (!fieldValue || !fieldValue.trim()) {
            const fieldLabels = {
              name: 'Product Name',
              value: 'Value Proposition',
              category: 'Category/Type',
              problem: 'Main Problem',
              audience: 'Target Audience'
            };
            missingFields.push(fieldLabels[fieldName]);
          }
        });
        break;
        
      case 'story': // Product story
        // Get template-specific required fields
        let storyFields = [];
        if (selectedTemplate === 'artisan-journey') {
          storyFields = ['origin', 'unique', 'vision'];
        } else if (selectedTemplate !== 'our-journey') {
          storyFields = ['origin', 'solution', 'unique'];
        }
        
        storyFields.forEach(fieldName => {
          const fieldValue = productStoryData.story[fieldName];
          if (!fieldValue || !fieldValue.trim()) {
            const fieldLabels = {
              origin: 'Origin Story',
              solution: 'Solution Journey',
              unique: 'What Makes It Unique',
              vision: 'Vision & Mission'
            };
            missingFields.push(fieldLabels[fieldName]);
          }
        });
        break;

      case 'process': // Process step
        // Get template-specific required fields
        let processFields = [];
        if (selectedTemplate === 'our-journey') {
          processFields = ['creation', 'materials', 'time', 'quality', 'ethics'];
        } else if (selectedTemplate === 'artisan-journey') {
          processFields = ['creation', 'materials', 'quality', 'ethics'];
        }
        
        processFields.forEach(fieldName => {
          const fieldValue = productStoryData.process[fieldName];
          if (!fieldValue || !fieldValue.trim()) {
            const fieldLabels = {
              creation: 'Creation Process & Craftsmanship',
              materials: 'Materials/Ingredients/Technology',
              time: 'Time Investment & Expertise',
              quality: 'Quality Standards & Certifications',
              ethics: 'Sustainability & Ethics'
            };
            missingFields.push(fieldLabels[fieldName]);
          }
        });
        break;

      case 'visuals': // Visuals step
        // Check template-specific image requirements
        if (selectedTemplate === 'our-journey') {
          const beforeAfterCount = productStoryData.visuals.beforeAfter?.length || 0;
          if (beforeAfterCount !== 2) {
            missingFields.push('Exactly 2 Before & After images required');
          }
        }
        break;
    }
    
    return missingFields;
  };

  // Get template-specific step configuration
  function getTemplateSteps() {
    if (selectedTemplate === 'our-journey') {
      return [
        { number: 1, title: 'Template', icon: Palette, key: 'template' },
        { number: 2, title: 'Basics', icon: Package, key: 'basics' },
        { number: 3, title: 'Process', icon: User, key: 'process' },
        { number: 4, title: 'Impact', icon: Award, key: 'impact' },
        { number: 5, title: 'Visuals', icon: ImageIcon, key: 'visuals' },
        { number: 6, title: 'Review', icon: Globe, key: 'review' }
      ];
    } else if (selectedTemplate === 'artisan-journey') {
      return [
        { number: 1, title: 'Template', icon: Palette, key: 'template' },
        { number: 2, title: 'Basics', icon: Package, key: 'basics' },
        { number: 3, title: 'Story', icon: Lightbulb, key: 'story' },
        { number: 4, title: 'Process', icon: User, key: 'process' },
        { number: 5, title: 'Impact', icon: Award, key: 'impact' },
        { number: 6, title: 'Visuals', icon: ImageIcon, key: 'visuals' },
        { number: 7, title: 'Review', icon: Globe, key: 'review' }
      ];
    }
    // Default - all steps
    return [
      { number: 1, title: 'Template', icon: Palette, key: 'template' },
      { number: 2, title: 'Basics', icon: Package, key: 'basics' },
      { number: 3, title: 'Story', icon: Lightbulb, key: 'story' },
      { number: 4, title: 'Process', icon: User, key: 'process' },
      { number: 5, title: 'Impact', icon: Award, key: 'impact' },
      { number: 6, title: 'Visuals', icon: ImageIcon, key: 'visuals' },
      { number: 7, title: 'Review', icon: Globe, key: 'review' }
    ];
  };

  const templateSteps = getTemplateSteps();
  const maxStep = templateSteps.length;

  
  // Get the actual step key for the current step number
  const getCurrentStepKey = () => {
    return templateSteps[step - 1]?.key || 'template';
  };

  // Handle next button click with validation
  const handleNextClick = () => {
    if (step === maxStep) {
      handlePreview();
      return;
    }

    if (!isCurrentStepValid()) {
      const missingFields = getMissingFields();
      if (missingFields.length > 0) {
        alert(`Please fill in the following required fields:\n\n• ${missingFields.join('\n• ')}`);
      } else {
        alert('Please ensure all fields meet the template requirements.');
      }
      return;
    }

    setStep(step + 1);
  };

  

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
        [field]: [...(prev[section]?.[field] || []), '']
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
          prompt = `Suggest a better category or product type for: "${currentValue}". Context: ${context}. Return only the improved category name, be specific and clear. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'problem':
          prompt = `Improve this problem description to be more compelling: "${currentValue}". Context: ${context}. Make it clear what specific problem this product solves. 2-3 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'audience':
          prompt = `Refine this target audience description: "${currentValue}". Context: ${context}. Be more specific about who would benefit from this product. Return only the improved audience description. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'value':
          prompt = `Write a compelling value proposition for this product: "${currentValue}". Context: ${context}. Explain why customers should choose this product and what unique value it provides. 2-3 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'origin':
          prompt = `Write a compelling origin story for this product: "${currentValue}". Context: ${context}. Make it engaging and authentic, explaining how and why this product was created. 3-4 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'solution':
          prompt = `Describe the solution journey for this product: "${currentValue}". Context: ${context}. Explain how this product solves the problem and the journey to create it. 3-4 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'unique':
          prompt = `Explain what makes this product unique and special: "${currentValue}". Context: ${context}. Highlight the differentiators and special qualities. 2-3 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'vision':
          prompt = `Write about the vision and mission behind this product: "${currentValue}". Context: ${context}. Explain the bigger purpose and impact. 2-3 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'creation':
          prompt = `Describe the creation process and craftsmanship: "${currentValue}". Context: ${context}. Explain how it's made, the process, and attention to detail. 3-4 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'materials':
          prompt = `Describe the materials, ingredients, or technology used: "${currentValue}". Context: ${context}. Explain what goes into making this product and why these materials were chosen. 2-3 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'time':
          prompt = `Describe the time investment and expertise required: "${currentValue}". Context: ${context}. Explain the skill level, time commitment, and expertise involved. Return a concise description. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'quality':
          prompt = `Describe quality standards and certifications: "${currentValue}". Context: ${context}. Explain quality control measures, standards followed, and any certifications. 2-3 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        case 'ethics':
          prompt = `Describe sustainability and ethical practices: "${currentValue}". Context: ${context}. Explain how this product is made sustainably or ethically. 2-3 sentences. IMPORTANT: Keep response under 600 characters.`;
          break;
        default:
          prompt = `Improve and make this more compelling for a product story: "${currentValue}". Context: ${context}. IMPORTANT: Keep response under 600 characters.`;
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
          [visualType]: [...(prev.visuals[visualType] || []), {
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

  const getAllImages = () => {
    const allImages = [];
    Object.values(productStoryData.visuals).forEach(visualArray => {
      visualArray.forEach(visual => {
        if (visual.url) allImages.push(visual.url);
      });
    });
    return allImages;
  };

  const handlePreview = () => {
    try {
      const selectedTemplateModel = TEMPLATE_MAP[selectedTemplate] || ourJourneyTemplate;
      
      // Include productId in the product story data
      const productStoryDataWithId = {
        ...productStoryData,
        productId: productId
      };
      
      const payload = {
        productStoryData: productStoryDataWithId,
        templateType: selectedTemplate,
        model: selectedTemplateModel,
        content: productStoryDataWithId,
        images: getAllImages(),
        productId: productId // Also include at root level
      };
      
      console.log('=== PREVIEW PAYLOAD DEBUG (with productId) ===');
      console.log('Product ID:', productId);
      console.log('Product Story Data:', productStoryDataWithId);
      console.log('Payload keys:', Object.keys(payload));
      console.log('===============================================');
      
      // Try to save to localStorage with error handling for quota exceeded
      try {
        localStorage.setItem('productStoryPreviewData', JSON.stringify(payload));
      } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {
          // Handle quota exceeded by creating a smaller payload without large images
          console.warn('localStorage quota exceeded, creating compressed payload...');
          
          // Create a compressed payload without full image data
          const compressedPayload = {
            ...payload,
            images: [], // Remove large image data
            content: {
              ...payload.content,
              visuals: {
                ...payload.content.visuals,
                // Keep only essential image metadata, not the full data URLs
                hero: payload.content.visuals.hero?.map(img => ({ 
                  id: img.id, 
                  name: img.name, 
                  type: img.type,
                  url: img.type === 'uploaded' ? 'COMPRESSED_IMAGE' : img.url 
                })) || [],
                process: payload.content.visuals.process?.map(img => ({ 
                  id: img.id, 
                  name: img.name, 
                  type: img.type,
                  url: img.type === 'uploaded' ? 'COMPRESSED_IMAGE' : img.url 
                })) || [],
                beforeAfter: payload.content.visuals.beforeAfter?.map(img => ({ 
                  id: img.id, 
                  name: img.name, 
                  type: img.type,
                  url: img.type === 'uploaded' ? 'COMPRESSED_IMAGE' : img.url 
                })) || [],
                lifestyle: payload.content.visuals.lifestyle?.map(img => ({ 
                  id: img.id, 
                  name: img.name, 
                  type: img.type,
                  url: img.type === 'uploaded' ? 'COMPRESSED_IMAGE' : img.url 
                })) || [],
                team: payload.content.visuals.team?.map(img => ({ 
                  id: img.id, 
                  name: img.name, 
                  type: img.type,
                  url: img.type === 'uploaded' ? 'COMPRESSED_IMAGE' : img.url 
                })) || []
              }
            }
          };
          
          // Update productStoryData to match the compressed visuals
          compressedPayload.productStoryData = {
            ...compressedPayload.productStoryData,
            visuals: compressedPayload.content.visuals
          };
          
          try {
            localStorage.setItem('productStoryPreviewData', JSON.stringify(compressedPayload));
            alert('⚠️ Images were compressed for preview due to size limits. The final published version will include full-quality images.');
          } catch (secondError) {
            // If still failing, clear localStorage and try again
            localStorage.clear();
            localStorage.setItem('productStoryPreviewData', JSON.stringify(compressedPayload));
            alert('⚠�� Storage was cleared and images compressed for preview. The final published version will include full-quality images.');
          }
        } else {
          throw storageError;
        }
      }
      
      // Open preview in new window
      window.open('/seller-info/preview', '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to save preview data:', error);
      alert('Failed to open preview. Please try again.');
    }
  };

  const handleSave = () => {
    // Save draft with productId-specific key
    localStorage.setItem(`productStoryData_${productId}`, JSON.stringify({
      productStoryData,
      templateType: selectedTemplate,
      savedAt: new Date().toISOString()
    }));
    alert('Product story draft saved successfully!');
  };

  const handlePublishCustomPage = async () => {
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
        // Navigate to marketplace in same tab
        router.push(`/marketplace/${productId}`);
      } else {
        alert(`Failed to publish: ${result.error}`);
      }
    } catch (error) {
      console.error('Error publishing custom page:', error);
      alert('An error occurred while publishing the story page.');
    }
  };

  const renderStepContent = () => {
    const currentStepKey = getCurrentStepKey();
    
    switch (currentStepKey) {
      case 'template':
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
      case 'basics':
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
      case 'story':
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
      case 'process':
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
      case 'impact':
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
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            setProductStoryData={setProductStoryData}
          />
        );
      case 'visuals':
        return (
          <VisualsStep
            productStoryData={productStoryData}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
            fileInputRefs={fileInputRefs}
            selectedTemplate={selectedTemplate}
            updateValidation={updateValidation}
          />
        );
      case 'review':
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/marketplace/${productId}`} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{modeParam === 'edit' ? 'Edit Product Story' : 'Create Product Story'}</h1>
              <p className="text-sm text-gray-500">{productData?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <SaveButton
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={!productStoryData.basics.name || !productStoryData.basics.category}
            >
              <Save size={16} />
              Save Draft
            </SaveButton>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {templateSteps.map((stepItem, index) => (
              <div
                key={stepItem.number}
                className="flex items-center"
                onClick={() => { if (modeParam === 'edit') setStep(stepItem.number); }}
                style={{ cursor: modeParam === 'edit' ? 'pointer' : 'default' }}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === stepItem.number
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : step > stepItem.number
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step > stepItem.number ? '✓' : <stepItem.icon size={16} />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === stepItem.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepItem.title}
                </span>{index < templateSteps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepItem.number ? 'bg-green-600' : 'bg-gray-300'
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
            <div className={step === 1 ? 'opacity-50 pointer-events-none' : ''}>
              <BackButton onClick={() => setStep(step - 1)} />
            </div>
            <Button
              onClick={handleNextClick}
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