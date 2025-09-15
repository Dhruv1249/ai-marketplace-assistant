"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Save, RotateCcw, Eye, EyeOff, Code, Settings, Upload, Download } from 'lucide-react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';

// Import default templates
import journeyTemplate from '@/components/seller-info/templates/journey-template.json';
import craftTemplate from '@/components/seller-info/templates/craft-template.json';
import impactTemplate from '@/components/seller-info/templates/impact-template.json';
import modernTemplate from '@/components/seller-info/templates/modern-template.json';

const DEFAULT_TEMPLATES = {
  'journey': journeyTemplate,
  'craft': craftTemplate,
  'impact': impactTemplate,
  'modern': modernTemplate,
};

export default function UniversalSourceCodeEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  onReset,
  templateData,
  templateName,
  onTemplateUpdate,
  type = 'product' // 'product' or 'seller-info'
}) {
  const [jsonCode, setJsonCode] = useState('');
  const [originalJsonCode, setOriginalJsonCode] = useState('');
  const [rawJson, setRawJson] = useState("");
  const [processedJson, setProcessedJson] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [validationResult, setValidationResult] = useState(null);
  const [showProcessedData, setShowProcessedData] = useState(true); // Toggle between processed and raw
  const fileInputRef = useRef(null);

  // Use actual form data and uploaded images from the renderer
  const getActualData = () => {
    console.log('🔍 [GET ACTUAL DATA] Template data:', templateData);
    
    // The templateData contains the unified structure: { model, content, images }
    const actualContent = templateData?.content || {};
    const actualImages = templateData?.images || [];
    
    console.log('📊 [GET ACTUAL DATA] Extracted:', {
      contentKeys: Object.keys(actualContent),
      imageCount: actualImages.length,
      hasBasics: !!actualContent.basics,
      hasStory: !!actualContent.story,
      hasProcess: !!actualContent.process,
      hasImpact: !!actualContent.impact
    });
    
    return {
      content: actualContent,
      images: actualImages
    };
  };

  // Function to restore array placeholders for seller info
  const restoreArrayPlaceholders = useCallback((template) => {
    const restoreNode = (node) => {
      if (!node) return node;
      
      if (Array.isArray(node)) {
        return node.map(restoreNode);
      }
      
      if (typeof node === 'object' && node !== null) {
        const restored = { ...node };
        
        // Check if this is a specialties or achievements list that was expanded
        if (restored.id === 'specialties-list' && Array.isArray(restored.children)) {
          const firstChild = restored.children[0];
          if (firstChild && typeof firstChild === 'object' && firstChild.id && firstChild.id.startsWith('specialty-')) {
            restored.children = 'SPECIALTIES_ARRAY';
            console.log('Restored specialties-list to SPECIALTIES_ARRAY');
          }
        } else if (restored.id === 'achievements-list' && Array.isArray(restored.children)) {
          const firstChild = restored.children[0];
          if (firstChild && typeof firstChild === 'object' && firstChild.id && firstChild.id.startsWith('achievement-')) {
            restored.children = 'ACHIEVEMENTS_ARRAY';
            console.log('Restored achievements-list to ACHIEVEMENTS_ARRAY');
          }
        } else if (restored.children) {
          restored.children = restoreNode(restored.children);
        }
        
        return restored;
      }
      
      return node;
    };
    
    return {
      ...template,
      component: restoreNode(template.component)
    };
  }, []);

  // Generate JSON with actual form data filled in
  const generateJSON = useCallback((data) => {
    if (!data?.model) return '';
    
    const actualData = getActualData();
    
    console.log('=== UNIVERSAL SOURCE CODE EDITOR DEBUG ===');
    console.log('Type:', type);
    console.log('Template Data:', data);
    console.log('Actual Data:', actualData);
    console.log('==========================================');
    
    // Deep clone the template to avoid modifying original
    const processedTemplate = JSON.parse(JSON.stringify(data.model));
    
    // Function to recursively process template placeholders with ACTUAL data
    const processNode = (node) => {
      if (typeof node === 'string') {
        let result = node;
        
        // PRODUCT STORY REPLACEMENTS - Basics
        result = result.replace(/\{\{content\.basics\.name \|\| 'Amazing Product'\}\}/g, actualData.content.basics?.name || 'Amazing Product');
        result = result.replace(/\{\{content\.basics\.category \|\| 'Product'\}\}/g, actualData.content.basics?.category || 'Product');
        result = result.replace(/\{\{content\.basics\.value \|\| 'Discover the story behind our innovative solution that transforms the way you work and live\.'\}\}/g, actualData.content.basics?.value || 'Discover the story behind our innovative solution that transforms the way you work and live.');
        result = result.replace(/\{\{content\.basics\.audience \|\| 'everyone who values quality and innovation'\}\}/g, actualData.content.basics?.audience || 'everyone who values quality and innovation');
        result = result.replace(/\{\{content\.basics\.problem \|\| 'Every day, millions of people face challenges that could be solved with the right solution\. Our product addresses these pain points with innovative technology and thoughtful design\.'\}\}/g, actualData.content.basics?.problem || 'Every day, millions of people face challenges that could be solved with the right solution. Our product addresses these pain points with innovative technology and thoughtful design.');
        
        // PRODUCT STORY REPLACEMENTS - Story
        result = result.replace(/\{\{content\.story\.origin \|\| 'Every great product starts with a simple idea\. Our journey began when we recognized a gap in the market and decided to create something truly innovative that would make a difference in people\\'s lives\.'\}\}/g, actualData.content.story?.origin || 'Every great product starts with a simple idea. Our journey began when we recognized a gap in the market and decided to create something truly innovative that would make a difference in people\'s lives.');
        result = result.replace(/\{\{content\.story\.solution \|\| 'The path from idea to reality was filled with challenges and breakthroughs\. We spent countless hours researching, prototyping, and refining our approach to create the perfect solution\.'\}\}/g, actualData.content.story?.solution || 'The path from idea to reality was filled with challenges and breakthroughs. We spent countless hours researching, prototyping, and refining our approach to create the perfect solution.');
        result = result.replace(/\{\{content\.story\.unique \|\| 'What makes our product special is our unique approach to solving problems\. We\\'ve combined cutting-edge technology with user-centered design to create something truly remarkable\.'\}\}/g, actualData.content.story?.unique || 'What makes our product special is our unique approach to solving problems. We\'ve combined cutting-edge technology with user-centered design to create something truly remarkable.');
        result = result.replace(/\{\{content\.story\.vision \|\| 'Join thousands of satisfied customers who have transformed their lives with our innovative solution\. Your journey to success starts here\.'\}\}/g, actualData.content.story?.vision || 'Join thousands of satisfied customers who have transformed their lives with our innovative solution. Your journey to success starts here.');
        
        // PRODUCT STORY REPLACEMENTS - Process
        result = result.replace(/\{\{content\.process\.creation \|\| 'Our meticulous creation process ensures every detail is perfect\. We combine traditional craftsmanship with modern technology to deliver exceptional quality\.'\}\}/g, actualData.content.process?.creation || 'Our meticulous creation process ensures every detail is perfect. We combine traditional craftsmanship with modern technology to deliver exceptional quality.');
        result = result.replace(/\{\{content\.process\.materials \|\| 'We source only the finest materials and components\. Every element is carefully selected to ensure durability, performance, and sustainability\.'\}\}/g, actualData.content.process?.materials || 'We source only the finest materials and components. Every element is carefully selected to ensure durability, performance, and sustainability.');
        result = result.replace(/\{\{content\.process\.time \|\| 'Every product requires significant time investment and specialized expertise\. Our skilled craftspeople dedicate hours to perfecting each detail\.'\}\}/g, actualData.content.process?.time || 'Every product requires significant time investment and specialized expertise. Our skilled craftspeople dedicate hours to perfecting each detail.');
        result = result.replace(/\{\{content\.process\.quality \|\| 'Rigorous testing and quality control measures ensure that every product meets our high standards before reaching our customers\.'\}\}/g, actualData.content.process?.quality || 'Rigorous testing and quality control measures ensure that every product meets our high standards before reaching our customers.');
        result = result.replace(/\{\{content\.process\.ethics \|\| 'We are committed to sustainable and ethical practices throughout our entire production process, ensuring a positive impact on the environment and society\.'\}\}/g, actualData.content.process?.ethics || 'We are committed to sustainable and ethical practices throughout our entire production process, ensuring a positive impact on the environment and society.');
        
        // LEGACY PRODUCT REPLACEMENTS
        result = result.replace(/\{\{content\.title\}\}/g, actualData.content.title || 'Product Title');
        result = result.replace(/\{\{content\.description\}\}/g, actualData.content.description || 'Product description');
        result = result.replace(/\{\{content\.price\}\}/g, actualData.content.price || '$0.00');
        
        // SELLER INFO REPLACEMENTS
        result = result.replace(/\{\{content\.name\}\}/g, actualData.content.name || '');
        result = result.replace(/\{\{content\.bio\}\}/g, actualData.content.bio || '');
        result = result.replace(/\{\{content\.story\}\}/g, actualData.content.story || '');
        result = result.replace(/\{\{content\.experience\}\}/g, actualData.content.experience || '');
        
        // Handle OR expressions with fallbacks
        result = result.replace(/\{\{content\.name \|\| 'Your Name'\}\}/g, actualData.content.name || 'Your Name');
        result = result.replace(/\{\{content\.title \|\| 'Your Professional Title'\}\}/g, actualData.content.title || 'Your Professional Title');
        result = result.replace(/\{\{content\.bio \|\| 'Your professional bio will appear here\.\.\.'\}\}/g, actualData.content.bio || 'Your professional bio will appear here...');
        
        // Handle photo placeholders
        result = result.replace(/\{\{content\.photos\[0\]\.url\}\}/g, actualData.content.photos?.[0]?.url || actualData.images?.[0] || '');
        result = result.replace(/\{\{content\.photos\[1\]\.url\}\}/g, actualData.content.photos?.[1]?.url || actualData.images?.[1] || '');
        result = result.replace(/\{\{content\.photos\[2\]\.url\}\}/g, actualData.content.photos?.[2]?.url || actualData.images?.[2] || '');
        
        // Handle complex expressions like charAt(0).toUpperCase()
        const nameCharRegex = /\{\{content\.name \? content\.name\.charAt\(0\)\.toUpperCase\(\) : 'U'\}\}/g;
        const nameChar = actualData.content.name ? actualData.content.name.charAt(0).toUpperCase() : 'U';
        result = result.replace(nameCharRegex, nameChar);
        
        // Handle contact info
        result = result.replace(/\{\{content\.contact\.email\}\}/g, actualData.content.contact?.email || '');
        result = result.replace(/\{\{content\.contact\.phone\}\}/g, actualData.content.contact?.phone || '');
        result = result.replace(/\{\{content\.contact\.location\}\}/g, actualData.content.contact?.location || '');
        result = result.replace(/\{\{content\.contact\.website\}\}/g, actualData.content.contact?.website || '');
        
        // Handle social media links
        result = result.replace(/\{\{content\.contact\.social\.linkedin\}\}/g, actualData.content.contact?.social?.linkedin || '');
        result = result.replace(/\{\{content\.contact\.social\.twitter\}\}/g, actualData.content.contact?.social?.twitter || '');
        result = result.replace(/\{\{content\.contact\.social\.instagram\}\}/g, actualData.content.contact?.social?.instagram || '');
        result = result.replace(/\{\{content\.contact\.social\.facebook\}\}/g, actualData.content.contact?.social?.facebook || '');
        
        // Handle business info
        result = result.replace(/\{\{content\.businessInfo\.businessName\}\}/g, actualData.content.businessInfo?.businessName || '');
        result = result.replace(/\{\{content\.businessInfo\.founded\}\}/g, actualData.content.businessInfo?.founded || '');
        result = result.replace(/\{\{content\.businessInfo\.employees\}\}/g, actualData.content.businessInfo?.employees || '');
        result = result.replace(/\{\{content\.businessInfo\.description\}\}/g, actualData.content.businessInfo?.description || '');
        
        // Handle complex business info expressions
        result = result.replace(/Founded \{\{content\.businessInfo\.founded\}\}/g, `Founded ${actualData.content.businessInfo?.founded || ''}`);
        result = result.replace(/\{\{content\.businessInfo\.employees\}\} employees/g, `${actualData.content.businessInfo?.employees || ''} employees`);
        
        // Image replacements with actual uploaded images
        result = result.replace(/\{\{images\[0\]\}\}/g, actualData.images[0] || '');
        result = result.replace(/\{\{images\[1\]\}\}/g, actualData.images[1] || '');
        result = result.replace(/\{\{images\[2\]\}\}/g, actualData.images[2] || '');
        result = result.replace(/\{\{images\[3\]\}\}/g, actualData.images[3] || '');
        
        // Handle seller info arrays - expand them for editing
        if (result === 'SPECIALTIES_ARRAY') {
          const specialties = actualData.content.specialties || [];
          return specialties.map((specialty, index) => ({
            id: `specialty-${index}`,
            type: 'div',
            props: { className: 'bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm' },
            children: [specialty]
          }));
        }
        
        if (result === 'ACHIEVEMENTS_ARRAY') {
          const achievements = actualData.content.achievements || [];
          return achievements.map((achievement, index) => ({
            id: `achievement-${index}`,
            type: 'div',
            props: { className: 'bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm' },
            children: [achievement]
          }));
        }
        
        if (result === 'TESTIMONIALS_ARRAY') {
          const testimonials = actualData.content.impact?.testimonials || [];
          return testimonials.slice(0, 5).map((testimonial, index) => ({
            id: `testimonial-${index}`,
            type: 'div',
            props: { className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4' },
            children: [
              {
                id: `testimonial-${index}-text`,
                type: 'p',
                props: { className: 'text-gray-700 italic mb-2' },
                children: [`"${testimonial}"`]
              },
              {
                id: `testimonial-${index}-author`,
                type: 'p',
                props: { className: 'text-sm text-gray-600 font-medium' },
                children: ['— Customer']
              }
            ]
          }));
        }
        
        if (result === 'METRICS_ARRAY') {
          const metrics = actualData.content.impact?.metrics || [];
          return metrics.slice(0, 3).map((metric, index) => ({
            id: `metric-${index}`,
            type: 'div',
            props: { className: 'bg-blue-50 border border-blue-200 rounded-lg p-4 text-center' },
            children: [
              {
                id: `metric-${index}-value`,
                type: 'div',
                props: { className: 'text-2xl font-bold text-blue-600 mb-1' },
                children: [metric.split(' ')[0] || '100+']
              },
              {
                id: `metric-${index}-label`,
                type: 'div',
                props: { className: 'text-sm text-gray-600' },
                children: [metric.split(' ').slice(1).join(' ') || 'Satisfied Customers']
              }
            ]
          }));
        }
        
        if (result === 'CASE_STUDIES_ARRAY') {
          const cases = actualData.content.impact?.cases || [];
          return cases.slice(0, 3).map((caseStudy, index) => ({
            id: `case-${index}`,
            type: 'div',
            props: { className: 'bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4' },
            children: [
              {
                id: `case-${index}-title`,
                type: 'h4',
                props: { className: 'font-medium text-gray-900 mb-2' },
                children: [`Case Study ${index + 1}`]
              },
              {
                id: `case-${index}-content`,
                type: 'p',
                props: { className: 'text-sm text-gray-700' },
                children: [caseStudy]
              }
            ]
          }));
        }
        
        if (result === 'AWARDS_ARRAY') {
          const awards = actualData.content.impact?.awards || [];
          return awards.map((award, index) => ({
            id: `award-${index}`,
            type: 'div',
            props: { className: 'bg-purple-50 text-purple-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2' },
            children: [
              {
                id: `award-${index}-icon`,
                type: 'span',
                props: { className: 'text-yellow-500' },
                children: ['🏆']
              },
              {
                id: `award-${index}-text`,
                type: 'span',
                props: {},
                children: [award]
              }
            ]
          }));
        }
        
        // Complex replacements for features and specs with actual data
        if (result.includes('{{content.features') && result.includes('map')) {
          const features = actualData.content.features || [];
          return features.map((feature, index) => ({
            id: `feature-${index}`,
            type: 'div',
            props: { className: 'border-l-4 border-blue-400 pl-4 mb-4' },
            children: [
              {
                id: `feature-${index}-title`,
                type: 'h4',
                props: { className: 'font-medium mb-1' },
                children: [feature]
              },
              {
                id: `feature-${index}-explanation`,
                type: 'p',
                props: { className: 'text-sm leading-relaxed' },
                children: [actualData.content.featureExplanations?.[feature] || '']
              }
            ]
          }));
        }
        
        if (result.includes('{{content.specifications') && result.includes('entries')) {
          const specs = actualData.content.specifications || {};
          return Object.entries(specs).map(([key, value], index) => ({
            id: `spec-${index}`,
            type: 'tr',
            props: {},
            children: [
              {
                id: `spec-${index}-key`,
                type: 'td',
                props: { className: 'px-4 py-2 bg-gray-50 font-medium w-1/3' },
                children: [key]
              },
              {
                id: `spec-${index}-value`,
                type: 'td',
                props: { className: 'px-4 py-2' },
                children: [value]
              }
            ]
          }));
        }
        
        return result;
      }
      
      if (Array.isArray(node)) {
        return node.map(processNode).flat();
      }
      
      if (typeof node === 'object' && node !== null) {
        const processed = {};
        for (const [key, value] of Object.entries(node)) {
          processed[key] = processNode(value);
        }
        return processed;
      }
      
      return node;
    };
    
    // Process the entire template with actual data
    const finalTemplate = processNode(processedTemplate);
    
    return JSON.stringify(finalTemplate, null, 2);
  }, [templateData, type]);

  // Validate JSON template
  const validateTemplate = useCallback((jsonString) => {
    try {
      const template = JSON.parse(jsonString);
      
      const validation = {
        valid: true,
        errors: [],
        warnings: []
      };

      if (!template.metadata) {
        validation.warnings.push('Template metadata is missing');
      }

      if (!template.component) {
        validation.errors.push('Template component is required');
        validation.valid = false;
      }

      setValidationResult(validation);
      return validation;
    } catch (error) {
      const result = {
        valid: false,
        errors: [`JSON Parse Error: ${error.message}`],
        warnings: []
      };
      setValidationResult(result);
      return result;
    }
  }, []);

  
  // Get the original default template based on templateType
  const getOriginalTemplate = useCallback(() => {
    const templateType = templateData?.templateType || 'journey';
    const defaultTemplate = DEFAULT_TEMPLATES[templateType] || DEFAULT_TEMPLATES.journey;
    return defaultTemplate;
  }, [templateData]);

  useEffect(() => {
    if (isOpen && templateData) {
      console.log('🔄 [SOURCE EDITOR] Opening with data:', {
        hasModel: !!templateData.model,
        hasContent: !!templateData.content,
        hasImages: !!templateData.images,
        showProcessedData
      });

      const raw = JSON.stringify(templateData.model, null, 2);
      const processed = generateJSON(templateData);

      console.log('📊 [SOURCE EDITOR] Generated JSONs:', {
        rawLength: raw.length,
        processedLength: processed.length,
        showProcessedData,
        willShow: showProcessedData ? 'processed' : 'raw'
      });

      setRawJson(raw);
      setProcessedJson(processed);

      const json = showProcessedData ? processed : raw;
      setJsonCode(json);
      setOriginalJsonCode(raw);
      setHasChanges(false);
      validateTemplate(json);
    }
  }, [isOpen, templateData, showProcessedData, generateJSON, validateTemplate]);

  // Handle toggle between processed and raw data
  const handleToggleDataMode = useCallback(() => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Switching modes will lose them. Continue?')) {
        return;
      }
    }
    
    const newMode = !showProcessedData;
    const processedJSON = generateJSON(templateData);
    const rawJSON = JSON.stringify(templateData.model, null, 2);
    const newJSON = newMode ? processedJSON : rawJSON;
    
    // DEBUG: Save both JSONs for comparison
    console.log('=== TOGGLE DEBUG ===');
    console.log('Current mode:', showProcessedData ? 'Processed' : 'Raw');
    console.log('Switching to:', newMode ? 'Processed' : 'Raw');
    console.log('Template Data:', templateData);
    console.log('Processed JSON length:', processedJSON.length);
    console.log('Raw JSON length:', rawJSON.length);
    console.log('====================');
    
    setShowProcessedData(newMode);
    setJsonCode(newJSON);
    setHasChanges(false);
    validateTemplate(newJSON);
  }, [hasChanges, showProcessedData, generateJSON, templateData, validateTemplate, type]);

  // Handle code changes
  const handleCodeChange = useCallback((newCode) => {
    setJsonCode(newCode);
    setHasChanges(newCode !== originalJsonCode);
    
    // Debounced validation
    const timeoutId = setTimeout(() => validateTemplate(newCode), 500);
    return () => clearTimeout(timeoutId);
  }, [originalJsonCode, validateTemplate]);

  // Handle save with proper array placeholder restoration
  const handleSave = useCallback(async () => {
    const validation = await validateTemplate(jsonCode);
    if (!validation.valid) {
      alert('Cannot save: Template has validation errors. Please fix them first.');
      return;
    }
    
    try {
      let template = JSON.parse(jsonCode);
      
      // Restore array placeholders for seller info
      if (type === 'seller-info') {
        template = restoreArrayPlaceholders(template);
      }
      
      console.log('=== SAVING TEMPLATE ===');
      console.log('Type:', type);
      console.log('Original JSON length:', jsonCode.length);
      console.log('Processed template:', template);
      console.log('======================');
      
      onTemplateUpdate?.(template);
      setHasChanges(false);
      
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Invalid JSON format. Please check your syntax.');
      return;
    }
  }, [jsonCode, onTemplateUpdate, validateTemplate, type, restoreArrayPlaceholders]);

  // Handle export JSON
  const handleExport = useCallback(() => {
    try {
      const dataToExport = {
        templateName: templateName || 'template',
        type: type,
        timestamp: new Date().toISOString(),
        template: JSON.parse(jsonCode)
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName || 'template'}-${type}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Template exported successfully!');
    } catch (error) {
      alert('Error exporting template: Invalid JSON format');
    }
  }, [jsonCode, templateName, type]);

  // Handle import JSON
  const handleImport = useCallback(() => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Import anyway? All changes will be lost.')) {
        return;
      }
    }
    fileInputRef.current?.click();
  }, [hasChanges]);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result);
        
        // Check if it's our export format
        if (importedData.template && importedData.type) {
          setJsonCode(JSON.stringify(importedData.template, null, 2));
          setHasChanges(true);
          validateTemplate(JSON.stringify(importedData.template, null, 2));
          alert(`Template imported successfully! (Type: ${importedData.type})`);
        } else {
          // Assume it's a raw template JSON
          setJsonCode(JSON.stringify(importedData, null, 2));
          setHasChanges(true);
          validateTemplate(JSON.stringify(importedData, null, 2));
          alert('JSON imported successfully!');
        }
      } catch (error) {
        alert('Error importing file: Invalid JSON format');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }, [validateTemplate]);

  // Handle reset - Reset to original selected template from templates system
  const handleReset = useCallback(() => {
  if (window.confirm('Reset to original selected template? All changes will be lost.')) {
    const original = getOriginalTemplate();
    if (original) {
      const rawTemplate = JSON.stringify(original, null, 2);
      const processedTemplate = generateJSON({ model: original });

      setRawJson(rawTemplate);
      setProcessedJson(processedTemplate);
      setJsonCode(rawTemplate);
      setOriginalJsonCode(rawTemplate);
      setShowProcessedData(false);
      setHasChanges(false);
      validateTemplate(rawTemplate);
    } else {
      alert('No original template available to reset to.');
    }
    onReset?.();
  }
}, [getOriginalTemplate, validateTemplate, onReset, generateJSON]);


  // Handle close
  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Close anyway?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">JSON Template Editor</h2>
              <p className="text-sm text-gray-500">{templateName} • Your actual content & images</p>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Unsaved changes
              </div>
            )}
            {validationResult && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                validationResult.valid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  validationResult.valid ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {validationResult.valid ? 'Valid JSON' : `${validationResult.errors.length} errors`}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Data Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  if (!showProcessedData) {
                    handleToggleDataMode();
                  }
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  showProcessedData 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Processed
              </button>
              <button
                onClick={() => {
                  if (showProcessedData) {
                    handleToggleDataMode();
                  }
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  !showProcessedData 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Raw
              </button>
            </div>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
            >
              <Upload size={16} />
              Import JSON
            </button>
            
            <button
              onClick={handleExport}
              disabled={!validationResult?.valid}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-all duration-200"
            >
              <Download size={16} />
              Export JSON
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={!validationResult?.valid}
              className="flex items-center gap-2 px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
            >
              <Save size={16} />
              Apply Changes
            </button>
            
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col`}>
            {/* Tab */}
            <div className="flex border-b bg-gray-50">
              <div className="px-4 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600 bg-white flex items-center gap-2">
                <Settings size={16} />
                JSON Template ({type === 'seller-info' ? 'Seller Data' : 'Product Data'}) • {showProcessedData ? 'Processed Data' : 'Raw Template'}
              </div>
            </div>
            
            {/* Editor */}
            <div className="flex-1 relative">
              <textarea
                value={jsonCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-full p-6 font-mono text-sm border-none outline-none resize-none bg-gray-900 text-gray-100 leading-relaxed"
                style={{
                  fontFamily: 'JetBrains Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  tabSize: 2,
                }}
                placeholder="Your JSON template with actual form data will appear here..."
                spellCheck={false}
              />
              
              {/* Editor Info */}
              <div className="absolute top-4 right-4 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                Lines: {jsonCode.split('\n').length} • Editable
              </div>
              
              {/* Better info for seller info */}
              {type === 'seller-info' && (
                <div className="absolute top-12 right-4 text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded">
                  Arrays auto-restored on save
                </div>
              )}
              
              {/* Validation Panel */}
              {validationResult && !validationResult.valid && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 backdrop-blur-sm text-red-100 p-4 rounded-lg max-h-32 overflow-y-auto">
                  <h4 className="font-semibold mb-2">Validation Errors:</h4>
                  <ul className="text-sm space-y-1">
                    {validationResult.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 flex flex-col border-l">
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Your {type === 'seller-info' ? 'Seller' : 'Product'} Content
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-white">
                <div className="p-4 h-full overflow-auto">
                  {(() => {
                    try {
                      const template = JSON.parse(jsonCode);
                      const actualData = getActualData();
                      return (
                        <div style={{ fontSize: '12px', transform: 'scale(0.7)', transformOrigin: 'top left', width: '142%' }}>
                          <EnhancedJSONModelRenderer
                            model={template}
                            content={actualData.content}
                            images={actualData.images}
                            isEditing={false}
                            styleVariables={{}}
                          />
                        </div>
                      );
                    } catch (error) {
                      return (
                        <div className="text-center py-8">
                          <div className="text-red-600 text-sm mb-2">Preview Error</div>
                          <div className="text-xs text-gray-500">{error.message}</div>
                          <div className="mt-4 text-xs text-gray-400">
                            Fix JSON syntax to see live preview
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-blue-500" />
              <span>
                JSON Template Editor • {showProcessedData 
                  ? `Your actual ${type === 'seller-info' ? 'seller' : 'product'} data filled in` 
                  : 'Raw template with placeholders'
                } • Fully editable
              </span>
            </div>
            {type === 'seller-info' && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                ℹ️ Specialties & Achievements arrays are automatically restored when saved
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!validationResult?.valid}
              className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}