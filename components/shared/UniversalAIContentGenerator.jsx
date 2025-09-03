"use client";

import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui';

export default function UniversalAIContentGenerator({ 
  isOpen, 
  onClose, 
  onContentGenerated, 
  currentData,
  type = 'seller-info' // 'seller-info' or 'product'
}) {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Define prompts based on type
  const getContentPrompts = () => {
    if (type === 'seller-info') {
      return [
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
    } else {
      // Product prompts
      return [
        {
          id: 'complete-product',
          title: 'Complete Product Description',
          description: 'Generate comprehensive product content including description, features, and benefits',
          prompt: 'Create comprehensive product content including: 1) A compelling product description (2-3 sentences), 2) Key features list (5-7 items), 3) Benefits and value proposition (3-4 sentences), 4) Target audience description, 5) Use cases or applications. Make it persuasive and market-ready.'
        },
        {
          id: 'description-only',
          title: 'Product Description',
          description: 'Generate just a product description',
          prompt: 'Write a compelling product description that highlights the key value proposition, main benefits, and what makes this product unique. Keep it concise but persuasive (2-3 sentences).'
        },
        {
          id: 'features-only',
          title: 'Product Features',
          description: 'Generate a list of product features',
          prompt: 'Create a list of 5-8 key product features that highlight the main capabilities, specifications, and unique selling points. Focus on what the product does and how it works.'
        },
        {
          id: 'benefits-only',
          title: 'Benefits & Value',
          description: 'Generate benefits and value proposition',
          prompt: 'Write about the key benefits and value proposition of this product. Focus on how it solves problems, saves time, improves outcomes, or provides value to users. Make it benefit-focused rather than feature-focused.'
        },
        {
          id: 'marketing-copy',
          title: 'Marketing Copy',
          description: 'Generate persuasive marketing content',
          prompt: 'Create persuasive marketing copy for this product including a catchy headline, compelling description, key selling points, and a call-to-action. Make it conversion-focused and engaging.'
        }
      ];
    }
  };

  const contentPrompts = getContentPrompts();

  const generateContent = async (prompt) => {
    setIsGenerating(true);
    try {
      const contextInfo = type === 'seller-info' 
        ? `${currentData.name ? `Name: ${currentData.name}` : ''} ${currentData.title ? `Title: ${currentData.title}` : ''} ${currentData.bio ? `Current bio: ${currentData.bio}` : ''}`
        : `${currentData.title ? `Product: ${currentData.title}` : ''} ${currentData.description ? `Description: ${currentData.description}` : ''} ${currentData.category ? `Category: ${currentData.category}` : ''}`;

      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: type === 'seller-info' 
                ? 'You are a professional copywriter specializing in creating compelling professional profiles and bios. Always respond with well-structured, engaging content that sounds authentic and professional.'
                : 'You are a professional copywriter specializing in product marketing and descriptions. Always respond with compelling, benefit-focused content that drives conversions and clearly communicates value.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nContext: ${contextInfo}`
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
    const lines = content.split('\n').filter(line => line.trim());
    
    if (type === 'seller-info') {
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
          return { type: 'bio', bio: content.trim() };
        
        case 'story-only':
          return { type: 'story', story: content.trim() };
        
        case 'experience-only':
          return { type: 'experience', experience: content.trim() };
        
        case 'specialties-achievements':
          return {
            type: 'lists',
            specialties: extractList(content, ['specialties', 'skills', 'expertise']) || ['Skill 1', 'Skill 2', 'Skill 3'],
            achievements: extractList(content, ['achievements', 'accomplishments', 'successes']) || ['Achievement 1', 'Achievement 2', 'Achievement 3']
          };
        
        default:
          return { type: 'custom', content: content.trim() };
      }
    } else {
      // Product parsing
      switch (promptId) {
        case 'complete-product':
          return {
            type: 'complete',
            description: extractSection(content, ['description', 'overview', 'about']) || lines[0] || content.substring(0, 200),
            features: extractList(content, ['features', 'capabilities', 'specifications']) || ['Feature 1', 'Feature 2', 'Feature 3'],
            benefits: extractSection(content, ['benefits', 'value', 'advantages']) || lines[1] || content.substring(200, 400),
            targetAudience: extractSection(content, ['audience', 'users', 'customers']) || 'Target customers',
            useCases: extractList(content, ['uses', 'applications', 'cases']) || ['Use case 1', 'Use case 2']
          };
        
        case 'description-only':
          return { type: 'description', description: content.trim() };
        
        case 'features-only':
          return { 
            type: 'features', 
            features: extractList(content, ['features', 'capabilities', 'specifications']) || content.split('\n').filter(l => l.trim())
          };
        
        case 'benefits-only':
          return { type: 'benefits', benefits: content.trim() };
        
        case 'marketing-copy':
          return { type: 'marketing', content: content.trim() };
        
        default:
          return { type: 'custom', content: content.trim() };
      }
    }
  };

  const extractSection = (content, keywords) => {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (keywords.some(keyword => line.includes(keyword))) {
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
        if (items.length >= 7) break;
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
    
    if (type === 'seller-info') {
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
          updatedData.bio = generatedContent.content;
      }
    } else {
      // Product content application
      switch (generatedContent.type) {
        case 'complete':
          updatedData.description = generatedContent.description;
          updatedData.features = generatedContent.features;
          updatedData.benefits = generatedContent.benefits;
          updatedData.targetAudience = generatedContent.targetAudience;
          updatedData.useCases = generatedContent.useCases;
          break;
        case 'description':
          updatedData.description = generatedContent.description;
          break;
        case 'features':
          updatedData.features = generatedContent.features;
          break;
        case 'benefits':
          updatedData.benefits = generatedContent.benefits;
          break;
        default:
          updatedData.description = generatedContent.content;
      }
    }
    
    onContentGenerated(updatedData);
    onClose();
  };

  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    if (type === 'seller-info') {
      return (
        <div className="space-y-6">
          {generatedContent.type === 'complete' && (
            <>
              <ContentField label="Professional Bio" content={generatedContent.bio} field="bio" />
              <ContentField label="Your Story" content={generatedContent.story} field="story" />
              <ContentField label="Experience" content={generatedContent.experience} field="experience" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContentList label="Specialties" items={generatedContent.specialties} />
                <ContentList label="Achievements" items={generatedContent.achievements} />
              </div>
            </>
          )}
          {generatedContent.type === 'bio' && <ContentField label="Professional Bio" content={generatedContent.bio} field="bio" />}
          {generatedContent.type === 'story' && <ContentField label="Your Story" content={generatedContent.story} field="story" />}
          {generatedContent.type === 'experience' && <ContentField label="Experience" content={generatedContent.experience} field="experience" />}
          {generatedContent.type === 'lists' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContentList label="Specialties" items={generatedContent.specialties} />
              <ContentList label="Achievements" items={generatedContent.achievements} />
            </div>
          )}
          {generatedContent.type === 'custom' && <ContentField label="Generated Content" content={generatedContent.content} field="custom" />}
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          {generatedContent.type === 'complete' && (
            <>
              <ContentField label="Product Description" content={generatedContent.description} field="description" />
              <ContentList label="Features" items={generatedContent.features} />
              <ContentField label="Benefits" content={generatedContent.benefits} field="benefits" />
              <ContentField label="Target Audience" content={generatedContent.targetAudience} field="audience" />
              <ContentList label="Use Cases" items={generatedContent.useCases} />
            </>
          )}
          {generatedContent.type === 'description' && <ContentField label="Product Description" content={generatedContent.description} field="description" />}
          {generatedContent.type === 'features' && <ContentList label="Features" items={generatedContent.features} />}
          {generatedContent.type === 'benefits' && <ContentField label="Benefits" content={generatedContent.benefits} field="benefits" />}
          {generatedContent.type === 'marketing' && <ContentField label="Marketing Copy" content={generatedContent.content} field="marketing" />}
          {generatedContent.type === 'custom' && <ContentField label="Generated Content" content={generatedContent.content} field="custom" />}
        </div>
      );
    }
  };

  const ContentField = ({ label, content, field }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          onClick={() => copyToClipboard(content, field)}
          className="text-gray-400 hover:text-gray-600"
        >
          {copiedField === field ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg text-sm">
        {content}
      </div>
    </div>
  );

  const ContentList = ({ label, items }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="p-2 bg-blue-50 rounded text-sm">
            {item}
          </div>
        ))}
      </div>
    </div>
  );

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

              {renderGeneratedContent()}

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