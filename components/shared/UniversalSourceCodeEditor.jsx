"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, RotateCcw, Eye, EyeOff, Code, Settings } from 'lucide-react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';

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
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [validationResult, setValidationResult] = useState(null);

  // Use actual form data and uploaded images
  const getActualData = () => ({
    content: templateData?.content || {
      title: "Product Title",
      description: "Product description...",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      featureExplanations: {},
      specifications: {},
      // Seller info defaults
      name: "",
      bio: "",
      story: "",
      experience: "",
      specialties: [],
      achievements: [],
      contact: {},
      businessInfo: {},
      photos: []
    },
    images: templateData?.images || []
  });

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
        // Replace template placeholders with actual form data
        let result = node;
        
        // PRODUCT REPLACEMENTS
        result = result.replace(/\{\{content\.title\}\}/g, actualData.content.title || 'Product Title');
        result = result.replace(/\{\{content\.description\}\}/g, actualData.content.description || 'Product description');
        result = result.replace(/\{\{content\.price\}\}/g, actualData.content.price || '$0.00');
        
        // SELLER INFO REPLACEMENTS
        // Basic seller info
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
        
        // Handle seller info arrays
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
        
        // Complex replacements for features and specs with actual data
        if (result.includes('{{content.features') && result.includes('map')) {
          // Replace with actual feature components from form
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
          // Replace with actual spec components from form
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

  // Initialize codes when template data changes
  useEffect(() => {
    if (isOpen && templateData) {
      const json = generateJSON(templateData);
      setJsonCode(json);
      setHasChanges(false);
      
      // Validate initial template
      if (json) {
        validateTemplate(json);
      }
    }
  }, [isOpen, templateData, generateJSON, validateTemplate]);

  // Handle code changes
  const handleCodeChange = useCallback((newCode) => {
    setJsonCode(newCode);
    setHasChanges(newCode !== generateJSON(templateData));
    
    // Debounced validation
    const timeoutId = setTimeout(() => validateTemplate(newCode), 500);
    return () => clearTimeout(timeoutId);
  }, [templateData, generateJSON, validateTemplate]);

  // Handle save
  const handleSave = useCallback(async () => {
    const validation = await validateTemplate(jsonCode);
    if (!validation.valid) {
      alert('Cannot save: Template has validation errors. Please fix them first.');
      return;
    }
    
    try {
      const template = JSON.parse(jsonCode);
      onTemplateUpdate?.(template);
      setHasChanges(false);
    } catch (error) {
      alert('Invalid JSON format. Please check your syntax.');
      return;
    }
  }, [jsonCode, onTemplateUpdate, validateTemplate]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (window.confirm('Reset to default template? All changes will be lost.')) {
      const json = generateJSON(templateData);
      setJsonCode(json);
      setHasChanges(false);
      onReset?.();
    }
  }, [templateData, generateJSON, onReset]);

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
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
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
              disabled={!hasChanges || !validationResult?.valid}
              className="flex items-center gap-2 px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
            >
              <Save size={16} />
              Save Changes
            </button>
            
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col`}>
            {/* Tab */}
            <div className="flex border-b bg-gray-50">
              <div className="px-4 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600 bg-white flex items-center gap-2">
                <Settings size={16} />
                JSON Template ({type === 'seller-info' ? 'Seller Data' : 'Product Data'})
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
              <span>JSON Template Editor • Your actual {type === 'seller-info' ? 'seller' : 'product'} data filled in • Fully editable</span>
            </div>
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
              disabled={!hasChanges || !validationResult?.valid}
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