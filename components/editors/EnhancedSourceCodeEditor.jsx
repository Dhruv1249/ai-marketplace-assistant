"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, RotateCcw, Eye, EyeOff, Code, FileText, Settings } from 'lucide-react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';

export default function EnhancedSourceCodeEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  onReset,
  templateData,
  templateName,
  onTemplateUpdate
}) {
  const [activeTab, setActiveTab] = useState('json');
  const [jsonCode, setJsonCode] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
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
      specifications: {}
    },
    images: templateData?.images || []
  });

  // Generate JSON with actual form data filled in
  const generateJSON = useCallback((data) => {
    if (!data?.model) return '';
    
    const actualData = getActualData();
    
    // Deep clone the template to avoid modifying original
    const processedTemplate = JSON.parse(JSON.stringify(data.model));
    
    // Function to recursively process template placeholders with ACTUAL data
    const processNode = (node) => {
      if (typeof node === 'string') {
        // Replace template placeholders with actual form data
        let result = node;
        
        // Simple replacements with actual data
        result = result.replace(/\{\{content\.title\}\}/g, actualData.content.title || 'Product Title');
        result = result.replace(/\{\{content\.description\}\}/g, actualData.content.description || 'Product description');
        result = result.replace(/\{\{content\.price\}\}/g, actualData.content.price || '$0.00');
        
        // Image replacements with actual uploaded images
        result = result.replace(/\{\{images\[0\]\}\}/g, actualData.images[0] || '');
        result = result.replace(/\{\{images\[1\]\}\}/g, actualData.images[1] || '');
        result = result.replace(/\{\{images\[2\]\}\}/g, actualData.images[2] || '');
        result = result.replace(/\{\{images\[3\]\}\}/g, actualData.images[3] || '');
        
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
  }, [templateData]);

  // Generate HTML that matches the actual template structure
  const generateHTML = useCallback((data) => {
    if (!data) return '';
    
    const actualData = getActualData();
    const template = data.model || {};
    
    // Convert the JSON template to HTML using the same logic as the renderer
    const componentToHTML = (comp, depth = 0) => {
      if (!comp) return '';
      
      if (typeof comp === 'string') {
        return comp;
      }
      
      if (Array.isArray(comp)) {
        return comp.map(child => componentToHTML(child, depth)).join('\n');
      }
      
      if (typeof comp === 'object' && comp.type) {
        const { type, props = {}, children, id } = comp;
        const indent = '  '.repeat(depth);
        
        // Handle special gallery sections
        if (id && (id.includes('gallery') || id.includes('image'))) {
          const images = actualData.images || [];
          if (images.length > 0) {
            return `${indent}<div class="${props.className || ''}" id="${id}">
${indent}  <img src="${images[0]}" alt="Product Image" class="w-full h-full object-cover" />
${indent}</div>`;
          }
        }
        
        // Build attributes
        let attributes = '';
        if (id) attributes += ` id="${id}"`;
        if (props.className) attributes += ` class="${props.className}"`;
        if (props.style) {
          const styleStr = Object.entries(props.style)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');
          attributes += ` style="${styleStr}"`;
        }
        
        // Add other props
        Object.entries(props).forEach(([key, value]) => {
          if (!['className', 'style'].includes(key) && typeof value === 'string') {
            attributes += ` ${key}="${value}"`;
          }
        });
        
        // Handle void elements
        const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link'];
        if (voidElements.includes(type)) {
          return `${indent}<${type}${attributes} />`;
        }
        
        // Handle children
        let childrenHTML = '';
        if (children) {
          if (Array.isArray(children)) {
            childrenHTML = children.map(child => componentToHTML(child, depth + 1)).join('\n');
          } else {
            childrenHTML = componentToHTML(children, depth + 1);
          }
        }
        
        if (childrenHTML) {
          return `${indent}<${type}${attributes}>
${childrenHTML}
${indent}</${type}>`;
        } else {
          return `${indent}<${type}${attributes}></${type}>`;
        }
      }
      
      return '';
    };
    
    // Generate CSS variables
    const cssVars = Object.entries(template.styleVariables || {})
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return Object.entries(value)
            .map(([subKey, subValue]) => `    --${key}-${subKey}: ${subValue};`)
            .join('\n');
        }
        return `    --${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`;
      })
      .join('\n');
    
    // Generate the complete HTML that matches the template structure
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${actualData.content.title || 'Product Page'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
${cssVars}
        }
        
        /* Template Styles */
        body {
            font-family: var(--font-family, Inter, sans-serif);
            color: var(--text-color, #111827);
            background-color: var(--background-color, #ffffff);
        }
        
        /* Component Styles */
        .cta-button {
            background-color: var(--primary-color, #3b82f6);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
        }
        
        .cta-button:hover {
            background-color: var(--secondary-color, #2563eb);
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
${componentToHTML(template.component)}
</body>
</html>`;
  }, [templateData]);

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
      const html = generateHTML(templateData);
      setJsonCode(json);
      setHtmlCode(html);
      setHasChanges(false);
      
      // Validate initial template
      if (json) {
        validateTemplate(json);
      }
    }
  }, [isOpen, templateData, generateJSON, generateHTML, validateTemplate]);

  // Handle code changes
  const handleCodeChange = useCallback((newCode, type) => {
    if (type === 'json') {
      setJsonCode(newCode);
      setHasChanges(newCode !== generateJSON(templateData));
      
      // Debounced validation
      const timeoutId = setTimeout(() => validateTemplate(newCode), 500);
      return () => clearTimeout(timeoutId);
    } else if (type === 'html') {
      setHtmlCode(newCode);
      setHasChanges(newCode !== generateHTML(templateData));
    }
  }, [templateData, generateJSON, generateHTML, validateTemplate]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (activeTab === 'json') {
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
    } else if (activeTab === 'html') {
      // For HTML, we could parse it back to template structure or just save as HTML
      onSave?.(htmlCode);
      setHasChanges(false);
    }
  }, [activeTab, jsonCode, htmlCode, onSave, onTemplateUpdate, validateTemplate]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (window.confirm('Reset to default template? All changes will be lost.')) {
      const json = generateJSON(templateData);
      const html = generateHTML(templateData);
      setJsonCode(json);
      setHtmlCode(html);
      setHasChanges(false);
      onReset?.();
    }
  }, [templateData, generateJSON, generateHTML, onReset]);

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

  const currentCode = activeTab === 'json' ? jsonCode : htmlCode;

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
              <h2 className="text-xl font-semibold text-gray-900">Source Code Editor</h2>
              <p className="text-sm text-gray-500">{templateName} • Your actual content & images</p>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Unsaved changes
              </div>
            )}
            {validationResult && activeTab === 'json' && (
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
              disabled={!hasChanges || (activeTab === 'json' && !validationResult?.valid)}
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
            {/* Tabs */}
            <div className="flex border-b bg-gray-50">
              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'json'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings size={16} />
                JSON Template (Your Data)
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'html'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={16} />
                HTML Output (Template Structure)
              </button>
            </div>
            
            {/* Editor */}
            <div className="flex-1 relative">
              <textarea
                value={currentCode}
                onChange={(e) => handleCodeChange(e.target.value, activeTab)}
                className="w-full h-full p-6 font-mono text-sm border-none outline-none resize-none bg-gray-900 text-gray-100 leading-relaxed"
                style={{
                  fontFamily: 'JetBrains Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  tabSize: 2,
                }}
                placeholder={`Your ${activeTab.toUpperCase()} code with actual form data will appear here...`}
                spellCheck={false}
              />
              
              {/* Editor Info */}
              <div className="absolute top-4 right-4 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                Lines: {currentCode.split('\n').length} • {activeTab === 'html' ? 'Template Structure' : 'JSON'}
              </div>
              
              {/* Validation Panel */}
              {activeTab === 'json' && validationResult && !validationResult.valid && (
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
                  Your Content
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-white">
                {activeTab === 'html' ? (
                  <iframe
                    srcDoc={htmlCode}
                    className="w-full h-full border-none"
                    title="HTML Preview"
                    sandbox="allow-scripts"
                  />
                ) : (
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
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              <span>
                {activeTab === 'json' 
                  ? 'JSON Template • Your actual form data filled in' 
                  : 'HTML Output • Matches template structure • Your content & images'
                }
              </span>
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
              disabled={!hasChanges || (activeTab === 'json' && !validationResult?.valid)}
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