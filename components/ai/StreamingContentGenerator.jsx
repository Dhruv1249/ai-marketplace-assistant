'use client';

import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { Wand2, Loader2 } from 'lucide-react';

const StreamingContentGenerator = ({ onContentGenerated }) => {
  const [formData, setFormData] = useState({
    productDescription: '',
    category: '',
    targetAudience: '',
    tone: 'professional'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleGenerate = async () => {
    if (!formData.productDescription.trim()) {
      setError('Please provide a product description');
      return;
    }

    if (formData.productDescription.trim().length < 10) {
      setError('Product description must be at least 10 characters long');
      return;
    }

    setIsGenerating(true);
    setError('');

    console.log('Sending form data:', formData);

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate content');
      }

      onContentGenerated(result.data);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wand2 className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">AI Content Generator</h2>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Description * (minimum 10 characters)
          </label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="e.g., Electronics, Clothing, Home & Garden"
          />

          <Input
            label="Target Audience"
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            placeholder="e.g., Tech enthusiasts, Parents, Professionals"
          />
        </div>

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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.productDescription.trim() || formData.productDescription.trim().length < 10}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Generating Content...
            </>
          ) : (
            <>
              <Wand2 className="mr-2" size={16} />
              Generate Content
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          AI-powered content generation for your product
        </div>
      </div>
    </div>
  );
};

export default StreamingContentGenerator;