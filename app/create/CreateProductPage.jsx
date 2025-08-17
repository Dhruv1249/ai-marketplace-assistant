'use client';

import React, { useState, useEffect, useRef } from 'react';
import StreamingContentGenerator from '@/components/ai/StreamingContentGenerator';
import { Button } from '@/components/ui';
import { ArrowLeft, Eye, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import TemplateSelector from '@/components/templates/TemplateSelector';
// Removed modal-based preview in favor of new tab preview

const CreateProductPage = () => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLayout, setSelectedLayout] = useState('gallery-focused');
  const [images, setImages] = useState([]); // array of preview URLs
  const prevUrlsRef = useRef([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      try {
        prevUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      } catch {}
    };
  }, []);

  const handleContentGenerated = (content) => {
    setGeneratedContent(content);
    setCurrentStep(2);
  };

  const handleEditContent = () => {
    setCurrentStep(2);
  };

  const steps = [
    { id: 1, name: 'Generate Content', description: 'Use AI to create your product page content' },
    { id: 2, name: 'Review & Edit', description: 'Review and customize the generated content' },
    { id: 3, name: 'Design Layout', description: 'Choose and customize your page layout' },
    { id: 4, name: 'Publish', description: 'Publish your product page to the marketplace' }
  ];

  const openPreview = () => {
    if (!generatedContent) return;
    try {
      const payload = {
        layoutType: selectedLayout,
        content: generatedContent,
        images,
      };
      localStorage.setItem('previewData', JSON.stringify(payload));
      window.open('/preview', '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Failed to open preview:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Create Product Page</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openPreview}
              disabled={!generatedContent}
            >
              <Eye className="mr-2" size={16} />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <StreamingContentGenerator onContentGenerated={handleContentGenerated} />
            )}

            {currentStep === 2 && generatedContent && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Content</h2>
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                    Regenerate
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title
                    </label>
                    <input
                      type="text"
                      value={generatedContent.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                      onChange={(e) => setGeneratedContent(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={generatedContent.description}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                      onChange={(e) => setGeneratedContent(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Features
                    </label>
                    <div className="space-y-2">
                      {generatedContent.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={feature}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            style={{ color: '#111827', backgroundColor: '#ffffff' }}
                            onChange={(e) => {
                              const newFeatures = [...generatedContent.features];
                              newFeatures[index] = e.target.value;
                              setGeneratedContent(prev => ({ ...prev, features: newFeatures }));
                            }}
                          />
                          <button
                            type="button"
                            className="p-2 text-gray-500 hover:text-red-600"
                            onClick={() => {
                              const newFeatures = generatedContent.features.filter((_, i) => i !== index);
                              setGeneratedContent(prev => ({ ...prev, features: newFeatures }));
                            }}
                            aria-label="Remove feature"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          const newFeatures = [...(generatedContent.features || []), ''];
                          setGeneratedContent(prev => ({ ...prev, features: newFeatures }));
                        }}
                      >
                        <Plus size={16} className="mr-1.5" /> Add feature
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(3)}>
                      Continue to Layout
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Layout</h2>
                <TemplateSelector
                  content={generatedContent}
                  value={selectedLayout}
                  onChange={setSelectedLayout}
                />

                {/* Image upload */}
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Upload Images (3-5)</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      // Limit to 5 and at least 3 advised
                      const slice = files.slice(0, 5);
                      // Create object URLs for preview
                      const urls = slice.map((file) => URL.createObjectURL(file));
                      // Revoke previously-created URLs to avoid leaks
                      try {
                        prevUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
                      } catch {}
                      prevUrlsRef.current = urls;
                      setImages(urls);
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {images?.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {images.map((src, i) => (
                        <div key={i} className="aspect-square rounded border overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {images?.length > 0 && images.length < 3 && (
                    <p className="text-xs text-amber-600 mt-1">Consider uploading at least 3 images for a better preview.</p>
                  )}
                </div>

                <div className="mt-6 bg-gray-50 border rounded p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Layout Config</p>
                  <pre className="text-xs text-gray-700 overflow-auto">
{JSON.stringify({
  type: selectedLayout,
  sections: [
    { id: 'hero', type: 'hero', order: 1, visible: true, config: {} },
    { id: 'gallery', type: 'gallery', order: 2, visible: selectedLayout !== 'single-column', config: {} },
    { id: 'description', type: 'description', order: 3, visible: true, config: {} },
    { id: 'features', type: 'features', order: 4, visible: true, config: {} },
    { id: 'specs', type: 'specifications', order: 5, visible: selectedLayout !== 'feature-blocks', config: {} },
    { id: 'cta', type: 'cta', order: 6, visible: true, config: {} },
  ],
  theme: { primaryColor: '#2563eb', secondaryColor: '#111827', fontFamily: 'Inter' }
}, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button variant="outline" onClick={openPreview}>
                    <Eye className="mr-2" size={16} /> Preview Template
                  </Button>
                  <Button onClick={() => setCurrentStep(4)}>
                    Continue to Publish
                  </Button>
                </div>

                </div>
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Publish Product</h2>
                <p className="text-gray-600">Publishing functionality coming soon...</p>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button>
                    Publish to Marketplace
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Be specific in your product description for better AI results</li>
                <li>• Include key features and benefits</li>
                <li>• Mention your target audience</li>
                <li>• Review and edit generated content before proceeding</li>
              </ul>
            </div>

            {generatedContent && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Preview</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Meta Title</p>
                    <p className="text-sm text-gray-600">{generatedContent.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Meta Description</p>
                    <p className="text-sm text-gray-600">{generatedContent.metaDescription}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Keywords</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {generatedContent.seoKeywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New tab preview uses /preview route and localStorage */}
    </div>
  );
};

export default CreateProductPage;