'use client';

import React, { useState, useEffect, useRef } from 'react';
import StreamingContentGenerator from '@/components/ai/StreamingContentGenerator';
import { Button } from '@/components/ui';
import { ArrowLeft, Eye, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import TemplateSelector from '@/components/templates/TemplateSelector';
import DeleteButton from '@/components/animated icon/DeleteButton';

// Removed modal-based preview in favor of new tab preview

const CreateProductPage = () => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [pageModel, setPageModel] = useState(galleryFocused);
  const [images, setImages] = useState([]); // array of preview URLs
  const [featureExplanations, setFeatureExplanations] = useState({});
  const [isGeneratingExplanations, setIsGeneratingExplanations] = useState(false);
  const [featuresConfirmed, setFeaturesConfirmed] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generationError, setGenerationError] = useState('');
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

  const generateFeatureExplanations = async () => {
    if (!generatedContent?.features || generatedContent.features.length === 0) return;
    
    setIsGeneratingExplanations(true);
    try {
      const response = await fetch('/api/ai/generate-feature-explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: generatedContent.features,
          productTitle: generatedContent.title,
          productDescription: generatedContent.description
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFeatureExplanations(result.data);
      } else {
        console.error('Failed to generate feature explanations:', result.error);
      }
    } catch (error) {
      console.error('Error generating feature explanations:', error);
    } finally {
      setIsGeneratingExplanations(false);
    }
  };

  const generateSingleFeatureExplanation = async (feature, index) => {
    if (!feature.trim()) return;
    
    try {
      const response = await fetch('/api/ai/generate-feature-explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: [feature],
          productTitle: generatedContent.title,
          productDescription: generatedContent.description
        }),
      });

      const result = await response.json();
      if (result.success && result.data[feature]) {
        setFeatureExplanations(prev => ({
          ...prev,
          [feature]: result.data[feature]
        }));
      }
    } catch (error) {
      console.error('Error generating single feature explanation:', error);
    }
  };

  const handleStepChange = (targetStep) => {
    // Prevent navigation if AI is generating
    if (isGeneratingExplanations || isGeneratingContent) {
      return;
    }

    // If going back and there are changes or AI is generating, show warning
    if (targetStep < currentStep) {
      setShowBackWarning(true);
      setPendingStep(targetStep);
    } else {
      setCurrentStep(targetStep);
    }
  };

  const confirmStepChange = () => {
    // Reset all state when going back
    if (pendingStep === 1) {
      setGeneratedContent(null);
      setFeatureExplanations({});
      setFeaturesConfirmed(false);
      setImages([]);
      setPageModel(galleryFocused);
    } else if (pendingStep === 2) {
      setFeatureExplanations({});
      setFeaturesConfirmed(false);
    }
    
    setCurrentStep(pendingStep);
    setShowBackWarning(false);
    setPendingStep(null);
  };

  const cancelStepChange = () => {
    setShowBackWarning(false);
    setPendingStep(null);
  };

  const handleConfirmFeaturesAndContinue = async () => {
    if (!featuresConfirmed) {
      setFeaturesConfirmed(true);
      await generateFeatureExplanations();
    }
    setCurrentStep(3);
  };

  const openPreview = () => {
  if (!generatedContent) {
    console.error('Cannot open preview: missing generatedContent');
    return;
  }
  if (!pageModel || !pageModel.metadata || !pageModel.component) {
    console.error('Cannot open preview: invalid pageModel', pageModel);
    setPageModel(galleryFocused); // Fallback to default
    return;
  }
  try {
    const payload = {
      model: pageModel,
      content: {
        ...generatedContent,
        featureExplanations: featureExplanations || {}
      },
      images: images || []
    };
    console.log('Saving previewData:', JSON.stringify(payload, null, 2));
    localStorage.setItem('previewData', JSON.stringify(payload));
    window.open('/preview', '_blank', 'noopener,noreferrer');
  } catch (e) {
    console.error('Failed to save previewData:', e);
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
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={openPreview}
                disabled={!generatedContent}
              >
                <Eye className="mr-2" size={16} />
                Preview
              </Button>
            )}
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Key Features
                      </label>
                      {!featuresConfirmed && generatedContent.features.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFeaturesConfirmed(true);
                            generateFeatureExplanations();
                          }}
                          disabled={isGeneratingExplanations}
                        >
                          {isGeneratingExplanations ? 'Generating...' : 'Confirm Features'}
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {generatedContent.features.map((feature, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={feature}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                              style={{ color: '#111827', backgroundColor: '#ffffff' }}
                              onChange={(e) => {
                                const oldFeature = feature;
                                const newFeature = e.target.value;
                                const newFeatures = [...generatedContent.features];
                                newFeatures[index] = newFeature;
                                setGeneratedContent(prev => ({ ...prev, features: newFeatures }));
                                
                                // Update explanation key if feature name changed
                                if (featuresConfirmed && featureExplanations[oldFeature]) {
                                  const newExplanations = { ...featureExplanations };
                                  newExplanations[newFeature] = newExplanations[oldFeature];
                                  delete newExplanations[oldFeature];
                                  setFeatureExplanations(newExplanations);
                                }
                              }}
                              onBlur={() => {
                                // Generate explanation for user-added features
                                if (featuresConfirmed && feature.trim() && !featureExplanations[feature]) {
                                  generateSingleFeatureExplanation(feature, index);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="p-2 text-gray-500 hover:text-red-600"
                              onClick={() => {
                                const featureToRemove = feature;
                                const newFeatures = generatedContent.features.filter((_, i) => i !== index);
                                setGeneratedContent(prev => ({ ...prev, features: newFeatures }));
                                
                                // Remove explanation for deleted feature
                                if (featureExplanations[featureToRemove]) {
                                  const newExplanations = { ...featureExplanations };
                                  delete newExplanations[featureToRemove];
                                  setFeatureExplanations(newExplanations);
                                }
                              }}
                              aria-label="Remove feature"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          {featuresConfirmed && featureExplanations[feature] && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <textarea
                                value={featureExplanations[feature]}
                                onChange={(e) => {
                                  setFeatureExplanations(prev => ({
                                    ...prev,
                                    [feature]: e.target.value
                                  }));
                                }}
                                className="w-full text-sm text-blue-800 leading-relaxed bg-transparent border-none resize-none focus:outline-none"
                                rows={Math.max(2, Math.ceil(featureExplanations[feature].length / 80))}
                                placeholder="Edit feature explanation..."
                              />
                            </div>
                          )}
                          
                          {featuresConfirmed && !featureExplanations[feature] && feature.trim() && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-500 italic">
                                Explanation will be generated when you finish editing this feature...
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 flex gap-2">
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
                      
                      {featuresConfirmed && (
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 text-sm rounded border border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setFeaturesConfirmed(false);
                            setFeatureExplanations({});
                          }}
                        >
                          Reset Confirmations
                        </button>
                      )}
                    </div>
                    
                    {!featuresConfirmed && generatedContent.features.length > 0 && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <strong>Tip:</strong> Click "Confirm Features" to generate detailed explanations for each feature. 
                          Explanations will help customers better understand your product's benefits.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleStepChange(1)}
                      disabled={isGeneratingExplanations}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleConfirmFeaturesAndContinue}
                      disabled={isGeneratingExplanations}
                    >
                      {isGeneratingExplanations 
                        ? 'Generating Explanations...' 
                        : featuresConfirmed 
                          ? 'Continue to Layout' 
                          : 'Generate Explanations & Continue'
                      }
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
                  value={pageModel?.metadata?.template || 'gallery-focused'}
                  onChange={setPageModel}
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

                {/* <div className="mt-6 bg-gray-50 border rounded p-4">
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
                </div> */}

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => handleStepChange(2)}>
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
                  <Button variant="outline" onClick={() => handleStepChange(3)}>
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
                <li>• Click "Confirm Features" to generate detailed explanations</li>
                <li>• Feature explanations help customers understand benefits</li>
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

      {/* Warning Modal */}
      {showBackWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Discard Changes?
            </h3>
            <p className="text-gray-600 mb-6">
              Going back will discard all your changes and any AI generation in progress will be cancelled. 
              Are you sure you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={cancelStepChange}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmStepChange}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isGeneratingExplanations && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generating Feature Explanations
            </h3>
            <p className="text-gray-600 text-sm">
              AI is creating detailed explanations for your features. This may take a moment...
            </p>
          </div>
        </div>
      )}

      {/* New tab preview uses /preview route and localStorage */}
    </div>
  );
};

export default CreateProductPage;