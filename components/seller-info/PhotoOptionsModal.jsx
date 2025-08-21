"use client";

import React, { useState } from 'react';
import { X, Camera, Sparkles, User, Upload } from 'lucide-react';
import { Button } from '@/components/ui';

export default function PhotoOptionsModal({ isOpen, onClose, onPhotoGenerated }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const photoPrompts = [
    {
      id: 'professional-headshot',
      title: 'Professional Headshot',
      description: 'Clean, professional portrait for business use',
      prompt: 'Professional headshot portrait, business attire, clean background, confident expression, high quality, studio lighting'
    },
    {
      id: 'casual-professional',
      title: 'Casual Professional',
      description: 'Approachable yet professional look',
      prompt: 'Casual professional portrait, friendly smile, modern office background, natural lighting, approachable demeanor'
    },
    {
      id: 'creative-professional',
      title: 'Creative Professional',
      description: 'Artistic and creative professional image',
      prompt: 'Creative professional portrait, artistic background, modern style, confident and innovative look, creative workspace'
    },
    {
      id: 'entrepreneur',
      title: 'Entrepreneur',
      description: 'Dynamic business leader portrait',
      prompt: 'Entrepreneur portrait, business suit, modern office, confident leadership pose, professional lighting, success-oriented'
    },
    {
      id: 'consultant',
      title: 'Consultant',
      description: 'Trustworthy advisor appearance',
      prompt: 'Professional consultant portrait, trustworthy appearance, business casual, clean office background, approachable expert'
    },
    {
      id: 'tech-professional',
      title: 'Tech Professional',
      description: 'Modern technology professional',
      prompt: 'Tech professional portrait, modern casual attire, tech office background, innovative and forward-thinking appearance'
    }
  ];

  const generateAIPhoto = async (prompt) => {
    setIsGenerating(true);
    try {
      // Generate a unique seed for variation
      const seed = Math.floor(Math.random() * 1000000);
      const width = 512;
      const height = 512;
      const model = 'flux';

      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
      
      // Test if the image loads successfully
      const img = new Image();
      img.onload = () => {
        onPhotoGenerated(imageUrl, prompt);
        onClose();
        setIsGenerating(false);
      };
      img.onerror = () => {
        alert('Failed to generate image. Please try again.');
        setIsGenerating(false);
      };
      img.src = imageUrl;
      
    } catch (error) {
      console.error('Error generating AI photo:', error);
      alert('Failed to generate image. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleGenerateCustom = () => {
    if (!customPrompt.trim()) {
      alert('Please enter a custom prompt');
      return;
    }
    generateAIPhoto(customPrompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Profile Photo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* No Photo Option */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No Photo</h3>
              <p className="text-sm text-gray-600 mb-4">Use a default avatar or no image</p>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Continue Without Photo
              </Button>
            </div>

            {/* Upload Photo Option */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Upload Photo</h3>
              <p className="text-sm text-gray-600 mb-4">Upload your own professional photo</p>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Choose File
              </Button>
            </div>

            {/* AI Generated Option */}
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6 text-center">
              <Sparkles size={48} className="mx-auto text-blue-600 mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">AI Generated</h3>
              <p className="text-sm text-gray-600 mb-4">Create a professional photo with AI</p>
              <Button
                onClick={() => setSelectedOption('ai')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Generate with AI
              </Button>
            </div>
          </div>

          {/* AI Photo Generation Section */}
          {selectedOption === 'ai' && (
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Choose AI Photo Style</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {photoPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      aiPrompt === prompt.prompt
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setAiPrompt(prompt.prompt)}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{prompt.title}</h4>
                    <p className="text-sm text-gray-600">{prompt.description}</p>
                  </div>
                ))}
              </div>

              {/* Custom Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or create a custom prompt
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the type of professional photo you want..."
                />
              </div>

              {/* Generate Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => generateAIPhoto(aiPrompt)}
                  disabled={!aiPrompt || isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Camera size={16} />
                      Generate Selected Style
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateCustom}
                  disabled={!customPrompt.trim() || isGenerating}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Generate Custom
                </Button>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Tips for better AI photos:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Be specific about style (professional, casual, creative)</li>
                  <li>• Mention background preferences (office, studio, outdoor)</li>
                  <li>• Include lighting preferences (natural, studio, soft)</li>
                  <li>• Specify attire (business suit, casual, creative)</li>
                  <li>• You can generate multiple variations by clicking again</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}