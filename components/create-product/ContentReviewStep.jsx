'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Plus, Trash2, Wand2 } from 'lucide-react';

const ContentReviewStep = ({
  generatedContent,
  setGeneratedContent,
  featureExplanations,
  setFeatureExplanations,
  featuresConfirmed,
  setFeaturesConfirmed,
  isGeneratingExplanations,
  isGeneratingContent,
  onRegenerateSection,
  onRegenerateAll,
  onGenerateFeatureExplanations,
  onGenerateSingleFeatureExplanation,
  onBack,
  onContinue
}) => {
  if (!generatedContent) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Generated Content</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRegenerateAll}
          disabled={isGeneratingContent}
        >
          {isGeneratingContent ? 'Regenerating...' : 'Regenerate All'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Product Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Title
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerateSection('title')}
              disabled={isGeneratingContent}
            >
              <Wand2 className="mr-1" size={12} />
              {generatedContent.title ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          <input
            type="text"
            value={generatedContent.title}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
            onChange={(e) => setGeneratedContent(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerateSection('description')}
              disabled={isGeneratingContent}
            >
              <Wand2 className="mr-1" size={12} />
              {generatedContent.description ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          <textarea
            value={generatedContent.description}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
            onChange={(e) => setGeneratedContent(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {/* Key Features */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Key Features
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFeaturesConfirmed(true);
                  onGenerateFeatureExplanations();
                }}
                disabled={isGeneratingExplanations}
              >
                {isGeneratingExplanations ? 'Generating...' : 'Add Description using AI'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegenerateSection('features')}
                disabled={isGeneratingExplanations}
              >
                <Wand2 className="mr-1" size={12} />
                {generatedContent.features && generatedContent.features.length > 0 ? 'Regenerate' : 'Generate'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {generatedContent.features && generatedContent.features.map((feature, index) => (
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
                        onGenerateSingleFeatureExplanation(feature, index);
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
                
                {!featureExplanations[feature] && feature.trim() && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                    <textarea
                      value=""
                      onChange={(e) => {
                        setFeatureExplanations(prev => ({
                          ...prev,
                          [feature]: e.target.value
                        }));
                      }}
                      className="w-full text-sm text-gray-700 leading-relaxed bg-transparent border-none resize-none focus:outline-none"
                      rows={2}
                      placeholder="Add manual explanation for this feature..."
                    />
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
          
          {!featuresConfirmed && generatedContent.features && generatedContent.features.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Click "Add Description using AI" to generate detailed explanations for each feature. 
                Explanations will help customers better understand your product's benefits.
              </p>
            </div>
          )}
        </div>

        {/* Specifications Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Specifications
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerateSection('specifications')}
              disabled={isGeneratingContent}
            >
              <Wand2 className="mr-1" size={12} />
              {generatedContent.specifications && Object.keys(generatedContent.specifications).length > 0 ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          <div className="space-y-2">
            {generatedContent.specifications && Object.entries(generatedContent.specifications).map(([key, value], index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={key}
                  placeholder="Specification name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  onChange={(e) => {
                    const newSpecs = { ...generatedContent.specifications };
                    delete newSpecs[key];
                    newSpecs[e.target.value] = value;
                    setGeneratedContent(prev => ({ ...prev, specifications: newSpecs }));
                  }}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    placeholder="Specification value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    onChange={(e) => {
                      const newSpecs = { ...generatedContent.specifications };
                      newSpecs[key] = e.target.value;
                      setGeneratedContent(prev => ({ ...prev, specifications: newSpecs }));
                    }}
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-red-600"
                    onClick={() => {
                      const newSpecs = { ...generatedContent.specifications };
                      delete newSpecs[key];
                      setGeneratedContent(prev => ({ ...prev, specifications: newSpecs }));
                    }}
                    aria-label="Remove specification"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => {
              const newSpecs = { ...(generatedContent.specifications || {}), '': '' };
              setGeneratedContent(prev => ({ ...prev, specifications: newSpecs }));
            }}
          >
            <Plus size={16} className="mr-1.5" /> Add specification
          </button>
        </div>

        {/* SEO Keywords Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              SEO Keywords
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerateSection('seoKeywords')}
              disabled={isGeneratingContent}
            >
              <Wand2 className="mr-1" size={12} />
              {generatedContent.seoKeywords && generatedContent.seoKeywords.length > 0 ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          <div className="space-y-2">
            {generatedContent.seoKeywords && generatedContent.seoKeywords.map((keyword, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={keyword}
                  placeholder="SEO keyword"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  onChange={(e) => {
                    const newKeywords = [...generatedContent.seoKeywords];
                    newKeywords[index] = e.target.value;
                    setGeneratedContent(prev => ({ ...prev, seoKeywords: newKeywords }));
                  }}
                />
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-red-600"
                  onClick={() => {
                    const newKeywords = generatedContent.seoKeywords.filter((_, i) => i !== index);
                    setGeneratedContent(prev => ({ ...prev, seoKeywords: newKeywords }));
                  }}
                  aria-label="Remove keyword"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => {
              const newKeywords = [...(generatedContent.seoKeywords || []), ''];
              setGeneratedContent(prev => ({ ...prev, seoKeywords: newKeywords }));
            }}
          >
            <Plus size={16} className="mr-1.5" /> Add keyword
          </button>
        </div>

        {/* Meta Description Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerateSection('metaDescription')}
              disabled={isGeneratingContent}
            >
              <Wand2 className="mr-1" size={12} />
              {generatedContent.metaDescription ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          <textarea
            value={generatedContent.metaDescription || ''}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
            placeholder="SEO meta description (recommended: under 160 characters)"
            onChange={(e) => setGeneratedContent(prev => ({ ...prev, metaDescription: e.target.value }))}
          />
          <div className="text-xs text-gray-500 mt-1">
            {(generatedContent.metaDescription || '').length}/160 characters recommended
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={isGeneratingExplanations}
          >
            Back
          </Button>
          {!featuresConfirmed && generatedContent.features && generatedContent.features.length > 0 ? (
            <>
              <Button 
                onClick={() => {
                  setFeaturesConfirmed(true);
                  onGenerateFeatureExplanations().then(() => onContinue());
                }}
                disabled={isGeneratingExplanations}
              >
                {isGeneratingExplanations 
                  ? 'Generating Explanations...' 
                  : 'Generate Explanations & Continue'
                }
              </Button>
              <Button 
                variant="outline"
                onClick={onContinue}
                disabled={isGeneratingExplanations}
              >
                Continue Without Explanations
              </Button>
            </>
          ) : (
            <Button 
              onClick={onContinue}
              disabled={isGeneratingExplanations}
            >
              Continue to Pricing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentReviewStep;