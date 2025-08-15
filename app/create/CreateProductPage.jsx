'use client';

import React, { useState } from 'react';
import StreamingContentGenerator from '@/components/ai/StreamingContentGenerator';
import { Button } from '@/components/ui';
import { ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';

const CreateProductPage = () => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

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
            <Button variant="outline" size="sm">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setGeneratedContent(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Features
                    </label>
                    <div className="space-y-2">
                      {generatedContent.features.map((feature, index) => (
                        <input
                          key={index}
                          type="text"
                          value={feature}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => {
                            const newFeatures = [...generatedContent.features];
                            newFeatures[index] = e.target.value;
                            setGeneratedContent(prev => ({ ...prev, features: newFeatures }));
                          }}
                        />
                      ))}
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
                <p className="text-gray-600">Layout selection coming soon...</p>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
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
    </div>
  );
};

export default CreateProductPage;