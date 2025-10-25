"use client";

import React, { useState } from 'react';
import { Loader, Send, X } from 'lucide-react';

export default function AITemplateGenerator({ onGenerate, onCancel }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe your advertisement');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/advert/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const data = await response.json();

      // Create template object
      const generatedTemplate = {
        id: `ai-${Date.now()}`,
        name: 'AI Generated Template',
        description: prompt.substring(0, 100) + '...',
        icon: null,
        tags: ['AI Generated', 'Custom'],
        data: data.template,
      };

      onGenerate(generatedTemplate);
    } catch (err) {
      console.error('Error generating template:', err);
      setError(err.message || 'Failed to generate template. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerate();
    }
  };

  return (
    <div className="bg-white border border-purple-200 rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Describe Your Advertisement
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="E.g., 'Create a modern template for a fitness app with bold colors, testimonials section, and pricing plans. Include features like workout tracking, community, and personalized coaching.'"
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500">
          Tip: Be specific about your product, target audience, and desired style
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={isGenerating}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          <X size={16} className="inline mr-2" />
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send size={16} />
              Generate Template
            </>
          )}
        </button>
      </div>
    </div>
  );
}
