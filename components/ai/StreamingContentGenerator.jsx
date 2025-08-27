'use client';

import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { Wand2, Loader2 } from 'lucide-react';
import LaunchButton from '../animated icon/LaunchButton';
import BackButton from '../animated icon/BackButton';

const StreamingContentGenerator = ({ onContentGenerated }) => {
  const [formData, setFormData] = useState({
    productTitle: '',
    productDescription: '',
    category: '',
    targetAudience: '',
    tone: 'professional'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [generateOptions, setGenerateOptions] = useState({
    features: true,
    specifications: true,
    seoKeywords: true,
    metaDescription: true
  });
  const [aiGenerationStates, setAiGenerationStates] = useState({
    productTitle: false,
    productDescription: false,
    category: false,
    targetAudience: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleGenerateClick = () => {
    if (!formData.productTitle.trim()) {
      setError('Please provide a product title');
      return;
    }

    if (!formData.productDescription.trim()) {
      setError('Please provide a product description');
      return;
    }

    if (formData.productDescription.trim().length < 10) {
      setError('Product description must be at least 10 characters long');
      return;
    }

    if (!formData.category.trim()) {
      setError('Please provide a product category');
      return;
    }

    if (!formData.targetAudience.trim()) {
      setError('Please provide a target audience');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmGenerate = async () => {
    setShowConfirmDialog(false);
    setIsGenerating(true);
    setError('');

    console.log('Sending form data:', formData);
    console.log('Generate options:', generateOptions);

    try {
      // Check if any options are selected for AI generation
      const hasSelectedOptions = Object.values(generateOptions).some(option => option === true);
      
      if (!hasSelectedOptions) {
        // No AI generation needed, just create basic content with user input
        const basicContent = {
          title: formData.productTitle,
          description: formData.productDescription,
          category: formData.category,
          targetAudience: formData.targetAudience,
          tone: formData.tone,
          features: [],
          specifications: {},
          seoKeywords: [],
          metaDescription: ''
        };
        
        onContentGenerated(basicContent);
        return;
      }

      // Make API call only if options are selected
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          generateOptions
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate content');
      }

      // Ensure the result has the basic structure with user-provided data
      const finalContent = {
        title: formData.productTitle,
        description: formData.productDescription,
        category: formData.category,
        targetAudience: formData.targetAudience,
        tone: formData.tone,
        features: result.data.features || [],
        specifications: result.data.specifications || {},
        seoKeywords: result.data.seoKeywords || [],
        metaDescription: result.data.metaDescription || ''
      };

      onContentGenerated(finalContent);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelGenerate = () => {
    setShowConfirmDialog(false);
  };

  const handleOptionChange = (option, checked) => {
    setGenerateOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  const handleIndividualAiGeneration = async (field) => {
    setAiGenerationStates(prev => ({ ...prev, [field]: true }));
    
    try {
      const response = await fetch('/api/ai/generate-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: field,
          context: formData,
          currentValue: formData[field]
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          [field]: result.data
        }));
      } else {
        setError(`Failed to generate ${field}: ${result.error}`);
      }
    } catch (err) {
      console.error('Individual generation error:', err);
      setError(`Failed to generate ${field}`);
    } finally {
      setAiGenerationStates(prev => ({ ...prev, [field]: false }));
    }
  };

  // Check if at least one option is selected for UI feedback
  const hasSelectedOptions = Object.values(generateOptions).some(option => option === true);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wand2 className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">AI Content Generator</h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Product Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Title *
            </label>
            <LaunchButton
              type="button"
              onClick={() => handleIndividualAiGeneration('productTitle')}
              disabled={aiGenerationStates.productTitle}
              >
              ✨ AI
            </LaunchButton>
          </div>
          <input
            type="text"
            value={formData.productTitle}
            onChange={(e) => handleInputChange('productTitle', e.target.value)}
            placeholder="e.g., Premium Wireless Headphones"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Product Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Description * (minimum 10 characters)
            </label>
            <LaunchButton
              type="button"
              onClick={() => handleIndividualAiGeneration('productDescription')}
              disabled={aiGenerationStates.productDescription}
              >
              ✨ AI
          </LaunchButton>
          </div>
          <textarea
            value={formData.productDescription}
            onChange={(e) => handleInputChange('productDescription', e.target.value)}
            placeholder="Describe your product in detail. Include key features, benefits, and what makes it unique..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
            rows={4}  
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.productDescription.length}/10 characters minimum
          </div>
        </div>

        {/* Category and Target Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
               <LaunchButton
                type="button"
                onClick={() => handleIndividualAiGeneration('category')}
                disabled={aiGenerationStates.category}
                >
                ✨ AI
              </LaunchButton> 
            </div>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="e.g., Electronics, Clothing, Home & Garden"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Target Audience *
              </label>
              <LaunchButton
                type="button"
                onClick={() => handleIndividualAiGeneration('targetAudience')}
                disabled={aiGenerationStates.targetAudience}
                >
                ✨ AI
              </LaunchButton>
            </div>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="e.g., Tech enthusiasts, Parents, Professionals"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tone
          </label>
          <select
            value={formData.tone}
            onChange={(e) => handleInputChange('tone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        {/* Generation Options */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">What to Generate:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries({
              features: 'Key Features',
              specifications: 'Specifications',
              seoKeywords: 'SEO Keywords',
              metaDescription: 'Meta Description'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={generateOptions[key]}
                  onChange={(e) => handleOptionChange(key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Uncheck all to create a basic product page with just your title and description.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleGenerateClick}
          disabled={isGenerating || !formData.productDescription.trim() || formData.productDescription.trim().length < 10}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              {hasSelectedOptions ? 'Generating Content...' : 'Creating Content...'}
            </>
          ) : (
            <>
              <Wand2 className="mr-2" size={16} />
              {hasSelectedOptions ? 'Generate Content' : 'Create Basic Content'}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          {hasSelectedOptions 
            ? 'AI-powered content generation for your product'
            : 'Create basic product page with your provided information'
          }
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {hasSelectedOptions ? 'Generate AI Content?' : 'Create Basic Content?'}
            </h3>
            <div className="space-y-3 mb-6">
              {hasSelectedOptions ? (
                <>
                  <p className="text-gray-600">
                    AI will generate the following content based on your input:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    {generateOptions.features && <li>• Key features list</li>}
                    {generateOptions.specifications && <li>• Technical specifications</li>}
                    {generateOptions.seoKeywords && <li>• SEO keywords</li>}
                    {generateOptions.metaDescription && <li>• Meta description</li>}
                  </ul>
                </>
              ) : (
                <p className="text-gray-600">
                  Create a basic product page with your provided title and description. 
                  You can add additional content later using the generate buttons in the next step.
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <BackButton variant="outline" onClick={handleCancelGenerate}>
                Cancel
              </BackButton>
              <Button onClick={handleConfirmGenerate}>
                <Wand2 className="mr-2" size={16} />
                {hasSelectedOptions ? 'Generate Content' : 'Create Basic Content'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingContentGenerator;