"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, RotateCcw, Eye, EyeOff, Code, Sparkles, FileText, Palette, Settings, Download, Upload } from 'lucide-react';
import { TemplateValidator } from '@/lib/TemplateValidator';
import { ComponentRegistry } from '@/lib/ComponentRegistry';
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
  const [cssCode, setCssCode] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [previewMode, setPreviewMode] = useState('template'); // 'template' or 'html'

  // Generate JSON from template data
  const generateJSON = useCallback((data) => {
    if (!data?.model) return '';
    return JSON.stringify(data.model, null, 2);
  }, []);

  // Generate HTML from template data
  const generateHTML = useCallback((data) => {
    if (!data) return '';
    
    const template = data.model || {};
    const content = data.content || {};
    const images = data.images || [];
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title || 'Product Page'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Template Variables */
        :root {
            ${Object.entries(template.styleVariables || {}).map(([key, value]) => {
              if (typeof value === 'object') {
                return Object.entries(value).map(([subKey, subValue]) => 
                  `--${key}-${subKey}: ${subValue};`
                ).join('\n            ');
              }
              return `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`;
            }).join('\n            ')}
        }
        
        /* Custom Styles */
        .template-container {
            font-family: var(--font-family, Inter, sans-serif);
            color: var(--text-color, #111827);
            background-color: var(--background-color, #ffffff);
        }
        
        .gradient-bg { 
            background: var(--gradients-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%)); 
        }
        
        .shadow-custom { 
            box-shadow: var(--shadows-medium, 0 4px 6px rgba(0,0,0,0.1)); 
        }
        
        /* Component Styles */
        .hero-section {
            padding: var(--spacing, 2rem);
            border-radius: var(--border-radius, 8px);
        }
        
        .feature-item {
            margin-bottom: var(--spacing, 1rem);
            padding: calc(var(--spacing, 1rem) * 0.75);
            border-radius: var(--border-radius, 8px);
            border-left: 4px solid var(--primary-color, #3b82f6);
        }
        
        .spec-item {
            padding: calc(var(--spacing, 1rem) * 0.5) 0;
            border-bottom: 1px solid var(--border-color, #e5e7eb);
        }
        
        .cta-button {
            background-color: var(--primary-color, #3b82f6);
            color: white;
            padding: var(--spacing, 1rem) calc(var(--spacing, 1rem) * 1.5);
            border-radius: var(--border-radius, 8px);
            font-weight: 600;
            transition: all 0.2s ease;
        }
        
        .cta-button:hover {
            background-color: var(--secondary-color, #2563eb);
            transform: translateY(-1px);
            box-shadow: var(--shadows-large, 0 10px 25px rgba(0,0,0,0.1));
        }
    </style>
</head>
<body class="template-container">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="hero-section shadow-custom">
            <div class="max-w-7xl mx-auto px-4 py-8">
                <h1 class="text-4xl font-bold mb-4" style="color: var(--text-color)">${content.title || 'Product Title'}</h1>
                <p class="text-lg opacity-80" style="color: var(--text-color)">${content.description || 'Product description'}</p>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Gallery Section -->
                <div class="space-y-4">
                    <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-custom">
                        ${images.length > 0 
                          ? `<img src="${images[0]}" alt="Product Image" class="w-full h-full object-cover">`
                          : '<div class="flex items-center justify-center h-full text-gray-400">Product Image</div>'
                        }
                    </div>
                    ${images.length > 1 
                      ? `<div class="grid grid-cols-4 gap-2">
                           ${images.slice(1, 5).map((img, i) => 
                             `<img src="${img}" alt="Thumbnail ${i+1}" class="aspect-square object-cover rounded shadow-sm">`
                           ).join('')}
                         </div>`
                      : ''
                    }
                </div>

                <!-- Product Info -->
                <div class="space-y-6">
                    <!-- Features -->
                    <div class="bg-white rounded-lg p-6 shadow-custom">
                        <h2 class="text-2xl font-semibold mb-6" style="color: var(--text-color)">Key Features</h2>
                        <div class="space-y-4">
                            ${content.features?.map(feature => 
                              `<div class="feature-item bg-gray-50">
                                 <h3 class="font-semibold text-lg mb-2" style="color: var(--text-color)">${feature}</h3>
                                 ${content.featureExplanations?.[feature] 
                                   ? `<p class="text-sm opacity-75" style="color: var(--text-color)">${content.featureExplanations[feature]}</p>`
                                   : ''
                                 }
                               </div>`
                            ).join('') || '<p class="text-gray-500">No features available</p>'}
                        </div>
                    </div>

                    <!-- Specifications -->
                    ${content.specifications && Object.keys(content.specifications).length > 0
                      ? `<div class="bg-white rounded-lg p-6 shadow-custom">
                           <h2 class="text-2xl font-semibold mb-6" style="color: var(--text-color)">Specifications</h2>
                           <div class="space-y-2">
                             ${Object.entries(content.specifications).map(([key, value]) =>
                               `<div class="spec-item flex justify-between">
                                  <span class="font-medium" style="color: var(--text-color)">${key}</span>
                                  <span style="color: var(--text-color); opacity: 0.8">${value}</span>
                                </div>`
                             ).join('')}
                           </div>
                         </div>`
                      : ''
                    }

                    <!-- CTA -->
                    <div class="text-center">
                        <button class="cta-button">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;
  }, []);

  // Generate CSS from template variables
  const generateCSS = useCallback((data) => {
    if (!data?.model?.styleVariables) return '';
    
    const vars = data.model.styleVariables;
    return `/* Template CSS Variables */
:root {
${Object.entries(vars).map(([key, value]) => {
  if (typeof value === 'object') {
    return Object.entries(value).map(([subKey, subValue]) => 
      `  --${key}-${subKey}: ${subValue};`
    ).join('\n');
  }
  return `  --${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`;
}).join('\n')}
}

/* Base Styles */
.template-container {
  font-family: var(--font-family);
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: var(--line-height);
}

/* Component Styles */
.hero-section {
  padding: var(--spacing);
  border-radius: var(--border-radius);
}

.feature-item {
  margin-bottom: var(--spacing);
  padding: calc(var(--spacing) * 0.75);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
  background-color: rgba(var(--primary-color), 0.05);
}

.cta-button {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing) calc(var(--spacing) * 1.5);
  border-radius: var(--border-radius);
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.cta-button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadows-large);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: calc(var(--spacing) * 0.75);
  }
  
  .template-container {
    font-size: calc(var(--font-size) * 0.9);
  }
}`;
  }, []);

  // Validate JSON template
  const validateTemplate = useCallback(async (jsonString) => {
    setIsValidating(true);
    try {
      const template = JSON.parse(jsonString);
      
      // Basic validation - just check if it has required structure
      const basicValidation = {
        valid: true,
        errors: [],
        warnings: [],
        summary: { errorCount: 0, warningCount: 0 }
      };

      if (!template.metadata) {
        basicValidation.warnings.push('Template metadata is missing');
        basicValidation.summary.warningCount++;
      }

      if (!template.component) {
        basicValidation.errors.push('Template component is required');
        basicValidation.valid = false;
        basicValidation.summary.errorCount++;
      }

      setValidationResult(basicValidation);
      return basicValidation;
    } catch (error) {
      const result = {
        valid: false,
        errors: [`JSON Parse Error: ${error.message}`],
        warnings: [],
        summary: { errorCount: 1, warningCount: 0 }
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Initialize codes when template data changes
  useEffect(() => {
    if (isOpen && templateData) {
      const json = generateJSON(templateData);
      const html = generateHTML(templateData);
      const css = generateCSS(templateData);
      
      setJsonCode(json);
      setHtmlCode(html);
      setCssCode(css);
      setHasChanges(false);
      
      // Validate initial template
      if (json) {
        validateTemplate(json);
      }
    }
  }, [isOpen, templateData, generateJSON, generateHTML, generateCSS, validateTemplate]);

  // Handle code changes
  const handleCodeChange = useCallback((newCode, type) => {
    switch (type) {
      case 'json':
        setJsonCode(newCode);
        setHasChanges(newCode !== generateJSON(templateData));
        // Debounced validation
        const timeoutId = setTimeout(() => validateTemplate(newCode), 500);
        return () => clearTimeout(timeoutId);
      case 'html':
        setHtmlCode(newCode);
        setHasChanges(newCode !== generateHTML(templateData));
        break;
      case 'css':
        setCssCode(newCode);
        setHasChanges(newCode !== generateCSS(templateData));
        break;
    }
  }, [templateData, generateJSON, generateHTML, generateCSS, validateTemplate]);

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
      onSave(htmlCode);
      setHasChanges(false);
    }
  }, [activeTab, jsonCode, htmlCode, onSave, onTemplateUpdate, validateTemplate]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (window.confirm('Reset to default template? All changes will be lost.')) {
      const json = generateJSON(templateData);
      const html = generateHTML(templateData);
      const css = generateCSS(templateData);
      
      setJsonCode(json);
      setHtmlCode(html);
      setCssCode(css);
      setHasChanges(false);
      onReset?.();
    }
  }, [templateData, generateJSON, generateHTML, generateCSS, onReset]);

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

  // Export template
  const handleExport = useCallback(() => {
    const dataToExport = activeTab === 'json' ? jsonCode : activeTab === 'html' ? htmlCode : cssCode;
    const blob = new Blob([dataToExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.replace('.jsx', '')}.${activeTab}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeTab, jsonCode, htmlCode, cssCode, templateName]);

  // Import template
  const handleImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        handleCodeChange(content, activeTab);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, [activeTab, handleCodeChange]);

  if (!isOpen) return null;

  const currentCode = activeTab === 'json' ? jsonCode : activeTab === 'html' ? htmlCode : cssCode;

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
              <h2 className="text-xl font-semibold text-gray-900">Enhanced Source Code Editor</h2>
              <p className="text-sm text-gray-500">{templateName}</p>
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
                {validationResult.valid ? 'Valid' : `${validationResult.errors.length} errors`}
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
            
            <input
              type="file"
              accept={`.${activeTab}`}
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 cursor-pointer"
            >
              <Upload size={16} />
              Import
            </label>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
            >
              <Download size={16} />
              Export
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
                JSON Template
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
                HTML Output
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'css'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Palette size={16} />
                CSS Variables
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
                placeholder={`Your ${activeTab.toUpperCase()} code will appear here...`}
                spellCheck={false}
                readOnly={activeTab === 'html' || activeTab === 'css'}
              />
              
              {/* Editor Info */}
              <div className="absolute top-4 right-4 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded flex items-center gap-2">
                <span>Lines: {currentCode.split('\n').length}</span>
                {activeTab === 'json' && isValidating && (
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                )}
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
                <div className="flex items-center gap-3">
                  <select
                    value={previewMode}
                    onChange={(e) => setPreviewMode(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="template">Template Renderer</option>
                    <option value="html">HTML Output</option>
                  </select>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Live
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-white">
                {previewMode === 'html' ? (
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
                        return (
                          <div style={{ fontSize: '12px', transform: 'scale(0.7)', transformOrigin: 'top left', width: '142%' }}>
                            <EnhancedJSONModelRenderer
                              model={template}
                              content={templateData?.content || {}}
                              images={templateData?.images || []}
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
              <Sparkles size={16} className="text-blue-500" />
              <span>Enhanced JSON Template Editor • Real-time validation</span>
            </div>
            {validationResult && (
              <div className="text-xs">
                {validationResult.summary.errorCount} errors, {validationResult.summary.warningCount} warnings
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