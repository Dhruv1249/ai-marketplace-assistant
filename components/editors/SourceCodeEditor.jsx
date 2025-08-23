"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Eye, EyeOff, Code, Sparkles } from 'lucide-react';

export default function SourceCodeEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  onReset,
  templateData,
  templateName 
}) {
  const [code, setCode] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState('html');

  // Generate HTML from template data
  const generateHTML = (data) => {
    if (!data) return '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.content?.title || 'Product Page'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom styles */
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-6">
                <h1 class="text-3xl font-bold text-gray-900">${data.content?.title || 'Product Title'}</h1>
                <p class="text-gray-600 mt-2">${data.content?.description || 'Product description'}</p>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Gallery Section -->
                <div class="space-y-4">
                    <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        ${data.images && data.images.length > 0 
                          ? `<img src="${data.images[0]}" alt="Product Image" class="w-full h-full object-cover">`
                          : '<div class="flex items-center justify-center h-full text-gray-400">Product Image</div>'
                        }
                    </div>
                    ${data.images && data.images.length > 1 
                      ? `<div class="grid grid-cols-4 gap-2">
                           ${data.images.slice(1, 5).map((img, i) => 
                             `<img src="${img}" alt="Thumbnail ${i+1}" class="aspect-square object-cover rounded">`
                           ).join('')}
                         </div>`
                      : ''
                    }
                </div>

                <!-- Product Info -->
                <div class="space-y-6">
                    <!-- Features -->
                    <div class="bg-white rounded-lg p-6 shadow-sm">
                        <h2 class="text-xl font-semibold mb-4">Key Features</h2>
                        <div class="space-y-3">
                            ${data.content?.features?.map(feature => 
                              `<div class="flex items-start space-x-3">
                                 <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                 <div>
                                   <h3 class="font-medium">${feature}</h3>
                                   ${data.content?.featureExplanations?.[feature] 
                                     ? `<p class="text-sm text-gray-600 mt-1">${data.content.featureExplanations[feature]}</p>`
                                     : ''
                                   }
                                 </div>
                               </div>`
                            ).join('') || '<p class="text-gray-500">No features available</p>'}
                        </div>
                    </div>

                    <!-- Specifications -->
                    ${data.content?.specifications && Object.keys(data.content.specifications).length > 0
                      ? `<div class="bg-white rounded-lg p-6 shadow-sm">
                           <h2 class="text-xl font-semibold mb-4">Specifications</h2>
                           <div class="space-y-2">
                             ${Object.entries(data.content.specifications).map(([key, value]) =>
                               `<div class="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                                  <span class="text-gray-600">${key}</span>
                                  <span class="font-medium">${value}</span>
                                </div>`
                             ).join('')}
                           </div>
                         </div>`
                      : ''
                    }

                    <!-- CTA -->
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                        <button class="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;
  };

  useEffect(() => {
    if (isOpen && templateData) {
      const htmlCode = generateHTML(templateData);
      setCode(htmlCode);
      setHasChanges(false);
    }
  }, [isOpen, templateData]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setHasChanges(newCode !== generateHTML(templateData));
  };

  const handleSave = () => {
    onSave(code);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset to default template? All changes will be lost.')) {
      const defaultCode = generateHTML(templateData);
      setCode(defaultCode);
      setHasChanges(false);
      onReset();
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Close anyway?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

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
              <h2 className="text-xl font-semibold text-gray-900">Source Code Editor</h2>
              <p className="text-sm text-gray-500">{templateName}</p>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Unsaved changes
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
              disabled={!hasChanges}
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
                onClick={() => setActiveTab('html')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'html'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'css'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                CSS (Embedded)
              </button>
            </div>
            
            {/* Editor */}
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-full p-6 font-mono text-sm border-none outline-none resize-none bg-gray-900 text-gray-100 leading-relaxed"
                style={{
                  fontFamily: 'JetBrains Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  tabSize: 2,
                }}
                placeholder="Your HTML code will appear here..."
                spellCheck={false}
              />
              
              {/* Line numbers overlay could go here */}
              <div className="absolute top-4 right-4 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                Lines: {code.split('\n').length}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 flex flex-col border-l">
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Live
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-white">
                <iframe
                  srcDoc={code}
                  className="w-full h-full border-none"
                  title="Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              <span>Edit HTML directly • Changes apply to preview</span>
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
              disabled={!hasChanges}
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