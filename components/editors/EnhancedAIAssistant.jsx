"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, Image, AlertCircle, CheckCircle, Bot, User, Zap, Wand2, Palette, Layout, Type, Settings } from 'lucide-react';
import { ComponentRegistry } from '@/lib/ComponentRegistry';
import { TemplateValidator } from '@/lib/TemplateValidator';

export default function EnhancedAIAssistant({ 
  isOpen, 
  onClose, 
  onTemplateUpdate,
  templateData,
  templateName 
}) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [analysisMode, setAnalysisMode] = useState('template'); // 'template', 'content', 'style'
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, result, error]);

  // Analyze current template structure
  const analyzeTemplate = useCallback((template) => {
    if (!template?.model) return null;

    const model = template.model;
    const sections = [];
    const styleVars = model.styleVariables || {};
    const editingConfig = model.editingConfig || {};

    // Extract sections from component tree
    const extractSections = (component) => {
      if (component.sectionType) {
        sections.push({
          id: component.id,
          type: component.sectionType,
          name: component.editingMeta?.name || component.sectionType,
          editable: component.editable || {}
        });
      }
      if (component.children && Array.isArray(component.children)) {
        component.children.forEach(child => {
          if (typeof child === 'object' && child !== null) {
            extractSections(child);
          }
        });
      }
    };

    extractSections(model.component);

    return {
      templateType: model.metadata?.template || 'unknown',
      templateName: model.metadata?.name || 'Unknown Template',
      sections,
      styleVariables: styleVars,
      editingConfig,
      totalSections: sections.length,
      editableSections: sections.filter(s => s.editable.styleEditable || s.editable.contentEditable).length
    };
  }, []);

  // Generate AI response based on prompt and template analysis
  const generateAIResponse = useCallback(async (prompt, template) => {
    const analysis = analyzeTemplate(template);
    const lower = prompt.toLowerCase();
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    let modifications = {};
    let explanation = '';
    let category = 'general';

    // Color/Style modifications
    if (lower.includes('color') || lower.includes('theme')) {
      category = 'design';
      
      if (lower.includes('blue')) {
        modifications = {
          styleVariables: {
            ...template.model.styleVariables,
            primaryColor: '#3b82f6',
            secondaryColor: '#1e40af',
            accentColor: '#60a5fa'
          }
        };
        explanation = "I've updated the color scheme to use various shades of blue as requested.";
      } else if (lower.includes('green')) {
        modifications = {
          styleVariables: {
            ...template.model.styleVariables,
            primaryColor: '#10b981',
            secondaryColor: '#059669',
            accentColor: '#34d399'
          }
        };
        explanation = "I've changed the color palette to a green theme.";
      } else if (lower.includes('dark')) {
        modifications = {
          styleVariables: {
            ...template.model.styleVariables,
            backgroundColor: '#1f2937',
            textColor: '#f9fafb',
            primaryColor: '#3b82f6',
            secondaryColor: '#1e40af'
          }
        };
        explanation = "I've applied a dark theme with light text and blue accents.";
      }
    }
    
    // Layout modifications
    else if (lower.includes('layout') || lower.includes('section') || lower.includes('add')) {
      category = 'layout';
      
      if (lower.includes('testimonial')) {
        const newSection = {
          id: 'testimonials-section',
          type: 'div',
          sectionType: 'testimonials',
          editable: {
            moveable: true,
            removeable: true,
            duplicatable: false,
            styleEditable: true,
            contentEditable: true
          },
          editingMeta: {
            name: 'Testimonials',
            description: 'Customer reviews and testimonials',
            icon: 'quote',
            category: 'social'
          },
          props: {
            className: 'testimonials-section bg-gray-50 py-12',
            style: {
              backgroundColor: 'var(--testimonials-bg, #f9fafb)',
              padding: 'var(--section-padding, 3rem)'
            }
          },
          children: [
            {
              id: 'testimonials-title',
              type: 'h2',
              props: {
                className: 'text-2xl font-bold text-center mb-8',
                style: {
                  color: 'var(--text-color, #111827)',
                  marginBottom: 'var(--spacing-lg, 2rem)'
                }
              },
              children: ['What Our Customers Say']
            },
            {
              id: 'testimonials-grid',
              type: 'div',
              props: {
                className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4'
              },
              children: [
                {
                  id: 'testimonial-1',
                  type: 'div',
                  props: {
                    className: 'bg-white p-6 rounded-lg shadow-sm'
                  },
                  children: [
                    {
                      id: 'testimonial-1-text',
                      type: 'p',
                      props: { className: 'text-gray-600 mb-4' },
                      children: ['"This product exceeded my expectations. Highly recommended!"']
                    },
                    {
                      id: 'testimonial-1-author',
                      type: 'p',
                      props: { className: 'font-semibold text-gray-900' },
                      children: ['- Sarah Johnson']
                    }
                  ]
                }
              ]
            }
          ]
        };

        // Add testimonials section to the template
        const updatedComponent = { ...template.model.component };
        if (updatedComponent.children && Array.isArray(updatedComponent.children)) {
          // Find container and add testimonials before CTA
          const container = updatedComponent.children.find(child => child.id === 'container');
          if (container && container.children) {
            const insertIndex = container.children.length - 1; // Before last element (usually CTA)
            container.children.splice(insertIndex, 0, newSection);
          }
        }

        modifications = {
          component: updatedComponent,
          metadata: {
            ...template.model.metadata,
            sections: [...(template.model.metadata.sections || []), 'testimonials']
          }
        };
        explanation = "I've added a testimonials section with customer reviews to build trust and credibility.";
      }
    }
    
    // Content modifications
    else if (lower.includes('text') || lower.includes('content') || lower.includes('copy')) {
      category = 'content';
      explanation = "I can help you modify text content, but I'll need more specific instructions about which text to change and how.";
    }
    
    // Font/Typography modifications
    else if (lower.includes('font') || lower.includes('typography')) {
      category = 'design';
      
      if (lower.includes('serif')) {
        modifications = {
          styleVariables: {
            ...template.model.styleVariables,
            fontFamily: 'Georgia, serif',
            headingFont: 'Georgia, serif'
          }
        };
        explanation = "I've changed the typography to use serif fonts for a more traditional, elegant look.";
      } else if (lower.includes('modern') || lower.includes('sans')) {
        modifications = {
          styleVariables: {
            ...template.model.styleVariables,
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Inter, sans-serif'
          }
        };
        explanation = "I've updated the typography to use modern sans-serif fonts.";
      }
    }
    
    // Spacing modifications
    else if (lower.includes('spacing') || lower.includes('padding') || lower.includes('margin')) {
      category = 'design';
      
      if (lower.includes('more') || lower.includes('increase')) {
        modifications = {
          styleVariables: {
            ...template.model.styleVariables,
            spacing: '2rem'
          }
        };
        explanation = "I've increased the spacing throughout the template for a more open, breathable design.";
      } else if (lower.includes('less') || lower.includes('decrease') || lower.includes('compact')) {
        modifications = {
          styleVariables: {
            ...template.model.styleVariables,
            spacing: '1rem'
          }
        };
        explanation = "I've reduced the spacing to create a more compact layout.";
      }
    }
    
    // Default response
    else {
      explanation = `I understand you want to "${prompt}". Based on your ${analysis?.templateName || 'template'} with ${analysis?.totalSections || 0} sections, I can help you modify colors, layout, typography, spacing, or add new sections. Could you be more specific about what changes you'd like?`;
    }

    // Validate modifications if any
    if (Object.keys(modifications).length > 0) {
      const updatedTemplate = {
        ...template.model,
        ...modifications
      };
      
      const validator = new TemplateValidator();
      const validation = validator.validateTemplate(updatedTemplate);
      
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }
    }

    return {
      success: true,
      modifications,
      explanation,
      category,
      analysis,
      hasChanges: Object.keys(modifications).length > 0
    };
  }, [analyzeTemplate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    const newRequest = {
      id: Date.now(),
      prompt: prompt.trim(),
      timestamp: new Date().toLocaleTimeString(),
      status: 'processing',
      category: detectCategory(prompt.trim())
    };

    setHistory(prev => [newRequest, ...prev]);

    try {
      const aiResult = await generateAIResponse(prompt.trim(), templateData);

      setResult(aiResult);
      setHistory(prev => prev.map(item => 
        item.id === newRequest.id 
          ? { ...item, status: 'completed', result: aiResult }
          : item
      ));

    } catch (err) {
      const errorMessage = err.message || 'AI processing failed. Please try again or rephrase your request.';
      setError(errorMessage);
      setHistory(prev => prev.map(item => 
        item.id === newRequest.id 
          ? { ...item, status: 'error', error: errorMessage }
          : item
      ));
    } finally {
      setIsProcessing(false);
      setPrompt('');
    }
  };

  const detectCategory = (prompt) => {
    const lower = prompt.toLowerCase();
    if (lower.includes('color') || lower.includes('style') || lower.includes('theme') || lower.includes('font')) return 'design';
    if (lower.includes('layout') || lower.includes('section') || lower.includes('add') || lower.includes('remove')) return 'layout';
    if (lower.includes('text') || lower.includes('content') || lower.includes('copy')) return 'content';
    if (lower.includes('image') || lower.includes('photo') || lower.includes('picture')) return 'media';
    return 'general';
  };

  const handleApplyChanges = useCallback(() => {
    if (result?.modifications && Object.keys(result.modifications).length > 0) {
      const updatedTemplate = {
        ...templateData.model,
        ...result.modifications
      };
      
      onTemplateUpdate?.(updatedTemplate);
      setResult(null);
    }
  }, [result, templateData, onTemplateUpdate]);

  const examplePrompts = {
    design: [
      "Change the color scheme to blue",
      "Apply a dark theme",
      "Use serif fonts for a classic look",
      "Increase spacing for a more open design",
      "Make the buttons more rounded",
      "Add gradient backgrounds"
    ],
    layout: [
      "Add a testimonials section",
      "Create a FAQ section",
      "Add a contact form",
      "Rearrange sections",
      "Make it single column",
      "Add a sidebar"
    ],
    content: [
      "Make the text more professional",
      "Add call-to-action text",
      "Include pricing information",
      "Add product benefits",
      "Create urgency in copy",
      "Improve readability"
    ],
    media: [
      "Add hero background image",
      "Create product gallery",
      "Add icons for features",
      "Include video section",
      "Add background patterns",
      "Optimize image layout"
    ]
  };

  const categories = [
    { id: 'all', name: 'All', icon: Sparkles },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'content', name: 'Content', icon: Type },
    { id: 'media', name: 'Media', icon: Image }
  ];

  const analysisData = analyzeTemplate(templateData);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Enhanced AI Assistant</h2>
              <p className="text-sm text-gray-500">
                Template-aware AI • {templateName} • {analysisData?.totalSections || 0} sections
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={analysisMode}
              onChange={(e) => setAnalysisMode(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="template">Template Analysis</option>
              <option value="content">Content Analysis</option>
              <option value="style">Style Analysis</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Template Analysis Panel */}
        {analysisData && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-gray-500 text-xs">Template Type</div>
                <div className="font-semibold text-gray-900">{analysisData.templateName}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-gray-500 text-xs">Sections</div>
                <div className="font-semibold text-gray-900">{analysisData.totalSections} total</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-gray-500 text-xs">Editable</div>
                <div className="font-semibold text-gray-900">{analysisData.editableSections} sections</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-gray-500 text-xs">Primary Color</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: analysisData.styleVariables.primaryColor }}
                  ></div>
                  <span className="font-semibold text-gray-900 text-xs">
                    {analysisData.styleVariables.primaryColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex items-center gap-2 p-4 border-b bg-gray-50 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Welcome Message */}
              {history.length === 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Sparkles className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 mb-3">
                        Welcome to Enhanced AI Assistant! ✨
                      </h3>
                      <p className="text-purple-800 text-sm mb-4">
                        I can intelligently modify your {analysisData?.templateName || 'template'} using natural language. 
                        I understand your template structure and can make precise changes.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-purple-900 text-sm">🎨 Smart Design Changes</h4>
                          <ul className="text-purple-800 text-xs space-y-1">
                            <li>• Color schemes and themes</li>
                            <li>• Typography and fonts</li>
                            <li>• Spacing and layout</li>
                            <li>• Visual effects and animations</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-purple-900 text-sm">🏗️ Template Structure</h4>
                          <ul className="text-purple-800 text-xs space-y-1">
                            <li>• Add/remove sections</li>
                            <li>• Rearrange components</li>
                            <li>• Modify content areas</li>
                            <li>• Responsive adjustments</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {(activeCategory === 'all' 
                          ? Object.values(examplePrompts).flat().slice(0, 4)
                          : examplePrompts[activeCategory] || examplePrompts.design
                        ).map((example, i) => (
                          <button
                            key={i}
                            onClick={() => setPrompt(example)}
                            className="text-xs bg-white/80 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 border border-purple-200"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat History */}
              {history.map((item) => (
                <div key={item.id} className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="flex items-start gap-3 max-w-2xl">
                      <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-sm">
                        <p className="text-sm">{item.prompt}</p>
                        <p className="text-xs opacity-75 mt-2">{item.timestamp}</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User size={16} className="text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-2xl">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                        {item.status === 'processing' && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span>Analyzing template and generating changes...</span>
                          </div>
                        )}
                        
                        {item.status === 'completed' && item.result && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle size={16} />
                              <span className="font-medium">
                                {item.result.hasChanges ? 'Changes ready!' : 'Analysis complete'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{item.result.explanation}</p>
                            {item.result.hasChanges && (
                              <button
                                onClick={() => setResult(item.result)}
                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                              >
                                View & Apply Changes
                              </button>
                            )}
                          </div>
                        )}
                        
                        {item.status === 'error' && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle size={16} />
                            <span>{item.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Current Result */}
              {result && result.hasChanges && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <CheckCircle className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Template Changes Ready</h3>
                        <p className="text-sm text-green-700">{result.explanation}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setResult(null)}
                      className="text-green-600 hover:text-green-800 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="bg-white/80 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Modifications Preview:</h4>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto max-h-32">
                      {JSON.stringify(result.modifications, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleApplyChanges}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                      <Zap size={16} />
                      Apply to Template
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="px-4 py-2 text-green-600 hover:text-green-800 transition-colors text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-6 bg-gray-50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your template changes... (e.g., 'Change to blue theme and add testimonials section')"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      disabled={isProcessing}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Settings size={16} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isProcessing}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send size={16} />
                    )}
                    {isProcessing ? 'Processing...' : 'Send'}
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 py-2">Quick actions:</span>
                  {(activeCategory === 'all' 
                    ? Object.values(examplePrompts).flat().slice(4, 8)
                    : examplePrompts[activeCategory]?.slice(0, 4) || examplePrompts.design.slice(0, 4)
                  ).map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(example)}
                      className="text-xs bg-white text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      disabled={isProcessing}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </div>

          {/* Template Structure Panel */}
          <div className="w-80 border-l bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-gray-900 mb-2">Template Structure</h3>
              <p className="text-xs text-gray-600">Current sections and components</p>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {analysisData?.sections.map((section, index) => (
                <div key={section.id} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{section.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Type: {section.type}</div>
                    <div className="flex gap-2">
                      {section.editable.styleEditable && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Style</span>
                      )}
                      {section.editable.contentEditable && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Content</span>
                      )}
                      {section.editable.moveable && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Moveable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Bot size={16} className="text-purple-500" />
              <span>Enhanced AI Assistant • Template-aware • Real-time validation</span>
            </div>
            <div className="text-xs text-gray-500">
              Changes are validated before application
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}