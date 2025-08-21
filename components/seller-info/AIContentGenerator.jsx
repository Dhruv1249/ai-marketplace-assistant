"use client";

import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AIContentGenerator({ isOpen, onClose, onContentGenerated, currentData }) {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const contentPrompts = [
    {
      id: 'complete-profile',
      title: 'Complete Professional Profile',
      description: 'Generate a comprehensive professional profile including bio, story, and experience',
      prompt: 'Create a comprehensive professional profile for a seller/service provider. Include: 1) A compelling professional bio (2-3 sentences), 2) A personal story about their journey and what drives them (4-5 sentences), 3) Professional experience and background (3-4 sentences), 4) 5 key specialties/skills, 5) 5 notable achievements. Make it authentic, engaging, and professional.'
    },
    {
      id: 'bio-only',
      title: 'Professional Bio',
      description: 'Generate just a professional bio summary',
      prompt: 'Write a compelling professional bio for a service provider. Keep it concise (2-3 sentences), highlight expertise and value proposition, and make it engaging for potential clients.'
    },
    {
      id: 'story-only',
      title: 'Personal Story',
      description: 'Generate an engaging personal/professional story',
      prompt: 'Write an engaging personal story for a professional service provider. Include their journey, what drives them, challenges overcome, and what makes them unique. Make it authentic and relatable (4-6 sentences).'
    },
    {
      id: 'experience-only',
      title: 'Experience & Background',
      description: 'Generate professional experience description',
      prompt: 'Write a professional experience and background summary for a service provider. Include education, career progression, key roles, and relevant expertise. Keep it professional yet engaging (3-4 sentences).'
    },
    {
      id: 'specialties-achievements',
      title: 'Specialties & Achievements',
      description: 'Generate lists of specialties and achievements',
      prompt: 'Create two lists for a professional service provider: 1) 5-7 key specialties/skills that showcase their expertise, 2) 5-7 notable achievements or accomplishments that demonstrate their success and impact.'
    }
  ];

  const generateContent = async (prompt) => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a professional copywriter specializing in creating compelling professional profiles and bios. Always respond with well-structured, engaging content that sounds authentic and professional.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nContext: ${currentData.name ? `Name: ${currentData.name}` : ''} ${currentData.title ? `Title: ${currentData.title}` : ''} ${currentData.bio ? `Current bio: ${currentData.bio}` : ''}`
            }
          ],
          model: 'openai',
          private: true
        })
      });

      const data = await response.text();
      
      // Parse the generated content
      const parsedContent = parseGeneratedContent(data, selectedPrompt);
      setGeneratedContent(parsedContent);
      
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseGeneratedContent = (content, promptId) => {
    // Basic parsing - in a real app, you might want more sophisticated parsing
    const lines = content.split('\n').filter(line => line.trim());
    
    switch (promptId) {
      case 'complete-profile':
        return {
          type: 'complete',
          bio: extractSection(content, ['bio', 'summary', 'about']) || lines[0] || content.substring(0, 200),
          story: extractSection(content, ['story', 'journey', 'background']) || lines[1] || content.substring(200, 500),
          experience: extractSection(content, ['experience', 'career', 'professional']) || lines[2] || content.substring(500, 700),
          specialties: extractList(content, ['specialties', 'skills', 'expertise']) || ['Skill 1', 'Skill 2', 'Skill 3'],
          achievements: extractList(content, ['achievements', 'accomplishments', 'successes']) || ['Achievement 1', 'Achievement 2', 'Achievement 3']
        };
      
      case 'bio-only':
        return {
          type: 'bio',
          bio: content.trim()
        };
      
      case 'story-only':
        return {
          type: 'story',
          story: content.trim()
        };
      
      case 'experience-only':
        return {
          type: 'experience',
          experience: content.trim()
        };
      
      case 'specialties-achievements':
        return {
          type: 'lists',
          specialties: extractList(content, ['specialties', 'skills', 'expertise']) || ['Skill 1', 'Skill 2', 'Skill 3'],
          achievements: extractList(content, ['achievements', 'accomplishments', 'successes']) || ['Achievement 1', 'Achievement 2', 'Achievement 3']
        };
      
      default:
        return {
          type: 'custom',
          content: content.trim()
        };
    }
  };

  const extractSection = (content, keywords) => {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (keywords.some(keyword => line.includes(keyword))) {
        // Return the next few lines as the section
        return lines.slice(i + 1, i + 4).join(' ').trim();
      }
    }
    return null;
  };

  const extractList = (content, keywords) => {
    const lines = content.split('\n');
    const items = [];
    let inList = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (keywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
        inList = true;
        continue;
      }
      
      if (inList && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./))) {
        items.push(trimmed.replace(/^[-•\d.]\s*/, ''));
        if (items.length >= 5) break;
      } else if (inList && trimmed === '') {
        continue;
      } else if (inList) {
        break;
      }
    }
    
    return items.length > 0 ? items : null;
  };

  const handleGenerateCustom = () => {
    if (!customPrompt.trim()) {
      alert('Please enter a custom prompt');
      return;
    }
    generateContent(customPrompt);
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const applyContent = () => {
    if (!generatedContent) return;
    
    const updatedData = { ...currentData };
    
    switch (generatedContent.type) {
      case 'complete':
        updatedData.bio = generatedContent.bio;
        updatedData.story = generatedContent.story;
        updatedData.experience = generatedContent.experience;
        updatedData.specialties = generatedContent.specialties;
        updatedData.achievements = generatedContent.achievements;
        break;
      
      case 'bio':
        updatedData.bio = generatedContent.bio;
        break;
      
      case 'story':
        updatedData.story = generatedContent.story;
        break;
      
      case 'experience':
        updatedData.experience = generatedContent.experience;
        break;
      
      case 'lists':
        updatedData.specialties = generatedContent.specialties;
        updatedData.achievements = generatedContent.achievements;
        break;
      
      default:
        // For custom content, try to apply to bio
        updatedData.bio = generatedContent.content;
    }
    
    onContentGenerated(updatedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            AI Content Generator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!generatedContent ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Content Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentPrompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPrompt === prompt.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPrompt(prompt.id)}
                    >
                      <h4 className="font-medium text-gray-900 mb-2">{prompt.title}</h4>
                      <p className="text-sm text-gray-600">{prompt.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or write a custom prompt
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what kind of content you want to generate..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => generateContent(contentPrompts.find(p => p.id === selectedPrompt)?.prompt)}
                  disabled={!selectedPrompt || isGenerating}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Selected
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
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setGeneratedContent(null)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Generate New
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {generatedContent.type === 'complete' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Professional Bio</label>
                        <button
                          onClick={() => copyToClipboard(generatedContent.bio, 'bio')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedField === 'bio' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {generatedContent.bio}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Your Story</label>
                        <button
                          onClick={() => copyToClipboard(generatedContent.story, 'story')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedField === 'story' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {generatedContent.story}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Experience</label>
                        <button
                          onClick={() => copyToClipboard(generatedContent.experience, 'experience')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedField === 'experience' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {generatedContent.experience}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                        <div className="space-y-2">
                          {generatedContent.specialties.map((specialty, index) => (
                            <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                              {specialty}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                        <div className="space-y-2">
                          {generatedContent.achievements.map((achievement, index) => (
                            <div key={index} className="p-2 bg-green-50 rounded text-sm">
                              {achievement}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {generatedContent.type === 'bio' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Professional Bio</label>
                      <button
                        onClick={() => copyToClipboard(generatedContent.bio, 'bio')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedField === 'bio' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {generatedContent.bio}
                    </div>
                  </div>
                )}

                {generatedContent.type === 'story' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Your Story</label>
                      <button
                        onClick={() => copyToClipboard(generatedContent.story, 'story')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedField === 'story' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {generatedContent.story}
                    </div>
                  </div>
                )}

                {generatedContent.type === 'experience' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Experience</label>
                      <button
                        onClick={() => copyToClipboard(generatedContent.experience, 'experience')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedField === 'experience' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {generatedContent.experience}
                    </div>
                  </div>
                )}

                {generatedContent.type === 'lists' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                      <div className="space-y-2">
                        {generatedContent.specialties.map((specialty, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                            {specialty}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                      <div className="space-y-2">
                        {generatedContent.achievements.map((achievement, index) => (
                          <div key={index} className="p-2 bg-green-50 rounded text-sm">
                            {achievement}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {generatedContent.type === 'custom' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Generated Content</label>
                      <button
                        onClick={() => copyToClipboard(generatedContent.content, 'custom')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedField === 'custom' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {generatedContent.content}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  onClick={applyContent}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Apply Content
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}