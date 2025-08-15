'use client';

import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { Wand2, Loader2, Zap } from 'lucide-react';

const StreamingContentGenerator = ({ onContentGenerated }) => {
  const [formData, setFormData] = useState({
    productDescription: '',
    category: '',
    targetAudience: '',
    tone: 'professional'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleGenerateStreaming = async () => {
    if (!formData.productDescription.trim()) {
      setError('Please provide a product description');
      return;
    }

    setIsGenerating(true);
    setError('');
    setStreamingText('');

    try {
      const response = await fetch('/api/ai/generate-content-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk') {
                setStreamingText(prev => prev + data.chunk);
              } else if (data.type === 'complete') {
                onContentGenerated(data.data);
                setStreamingText('');
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to generate content');
      setStreamingText('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRegular = async () => {
    if (!formData.productDescription.trim()) {
      setError('Please provide a product description');
      return;
    }

    setIsGenerating(true);
    setError('');

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
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = useStreaming ? handleGenerateStreaming : handleGenerateRegular;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wand2 className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">AI Content Generator</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Zap size={16} />
            Streaming
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Description *
          </label>
          <textarea
            value={formData.productDescription}
            onChange={(e) => handleInputChange('productDescription', e.target.value)}
            placeholder="Describe your product in detail. Include key features, benefits, and what makes it unique..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        {/* Streaming Preview */}
        {isGenerating && useStreaming && streamingText && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">AI is generating...</h3>
            <div className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
              {streamingText}
              <span className="animate-pulse">|</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.productDescription.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              {useStreaming ? 'Streaming Content...' : 'Generating Content...'}
            </>
          ) : (
            <>
              {useStreaming ? <Zap className="mr-2" size={16} /> : <Wand2 className="mr-2" size={16} />}
              {useStreaming ? 'Generate with Streaming' : 'Generate Content'}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          {useStreaming 
            ? 'Streaming mode shows AI generation in real-time' 
            : 'Standard mode waits for complete response'
          }
        </div>
      </div>
    </div>
  );
};

export default StreamingContentGenerator;