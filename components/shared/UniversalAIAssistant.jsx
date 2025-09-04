"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, User, CheckCircle, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';

export default function UniversalAIAssistant({ 
  isOpen, 
  onClose, 
  onTemplateUpdate,
  templateData,
  templateName,
  type = 'product' // 'product' or 'seller-info'
}) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate processed JSON with actual form data filled in
  const generateProcessedJSON = useCallback((template) => {
    if (!template?.model) return null;
    
    const actualData = {
      content: templateData?.content || {},
      images: templateData?.images || []
    };
    
    console.log('🔍 [AI ASSISTANT] Generating processed JSON with actual data:', {
      contentKeys: Object.keys(actualData.content),
      imageCount: actualData.images.length,
      hasBasics: !!actualData.content.basics,
      hasStory: !!actualData.content.story,
      hasProcess: !!actualData.content.process,
      hasImpact: !!actualData.content.impact
    });
    
    // Deep clone the template to avoid modifying original
    const processedTemplate = JSON.parse(JSON.stringify(template.model));
    
    // Function to recursively process template placeholders with ACTUAL data
    const processNode = (node) => {
      if (typeof node === 'string') {
        let result = node;
        
        // PRODUCT STORY REPLACEMENTS - Basics
        result = result.replace(/\{\{content\.basics\.name \|\| 'Amazing Product'\}\}/g, actualData.content.basics?.name || 'Amazing Product');
        result = result.replace(/\{\{content\.basics\.category \|\| 'Product'\}\}/g, actualData.content.basics?.category || 'Product');
        result = result.replace(/\{\{content\.basics\.value \|\| 'Discover the story behind our innovative solution that transforms the way you work and live\.'\}\}/g, actualData.content.basics?.value || 'Discover the story behind our innovative solution that transforms the way you work and live.');
        result = result.replace(/\{\{content\.basics\.audience \|\| 'everyone who values quality and innovation'\}\}/g, actualData.content.basics?.audience || 'everyone who values quality and innovation');
        result = result.replace(/\{\{content\.basics\.problem \|\| 'Every day, millions of people face challenges that could be solved with the right solution\. Our product addresses these pain points with innovative technology and thoughtful design\.'\}\}/g, actualData.content.basics?.problem || 'Every day, millions of people face challenges that could be solved with the right solution. Our product addresses these pain points with innovative technology and thoughtful design.');
        
        // PRODUCT STORY REPLACEMENTS - Story
        result = result.replace(/\{\{content\.story\.origin \|\| 'Every great product starts with a simple idea\. Our journey began when we recognized a gap in the market and decided to create something truly innovative that would make a difference in people\\'s lives\.'\}\}/g, actualData.content.story?.origin || 'Every great product starts with a simple idea. Our journey began when we recognized a gap in the market and decided to create something truly innovative that would make a difference in people\'s lives.');
        result = result.replace(/\{\{content\.story\.solution \|\| 'The path from idea to reality was filled with challenges and breakthroughs\. We spent countless hours researching, prototyping, and refining our approach to create the perfect solution\.'\}\}/g, actualData.content.story?.solution || 'The path from idea to reality was filled with challenges and breakthroughs. We spent countless hours researching, prototyping, and refining our approach to create the perfect solution.');
        result = result.replace(/\{\{content\.story\.unique \|\| 'What makes our product special is our unique approach to solving problems\. We\\'ve combined cutting-edge technology with user-centered design to create something truly remarkable\.'\}\}/g, actualData.content.story?.unique || 'What makes our product special is our unique approach to solving problems. We\'ve combined cutting-edge technology with user-centered design to create something truly remarkable.');
        result = result.replace(/\{\{content\.story\.vision \|\| 'Join thousands of satisfied customers who have transformed their lives with our innovative solution\. Your journey to success starts here\.'\}\}/g, actualData.content.story?.vision || 'Join thousands of satisfied customers who have transformed their lives with our innovative solution. Your journey to success starts here.');
        
        // PRODUCT STORY REPLACEMENTS - Process
        result = result.replace(/\{\{content\.process\.creation \|\| 'Our meticulous creation process ensures every detail is perfect\. We combine traditional craftsmanship with modern technology to deliver exceptional quality\.'\}\}/g, actualData.content.process?.creation || 'Our meticulous creation process ensures every detail is perfect. We combine traditional craftsmanship with modern technology to deliver exceptional quality.');
        result = result.replace(/\{\{content\.process\.materials \|\| 'We source only the finest materials and components\. Every element is carefully selected to ensure durability, performance, and sustainability\.'\}\}/g, actualData.content.process?.materials || 'We source only the finest materials and components. Every element is carefully selected to ensure durability, performance, and sustainability.');
        result = result.replace(/\{\{content\.process\.time \|\| 'Every product requires significant time investment and specialized expertise\. Our skilled craftspeople dedicate hours to perfecting each detail\.'\}\}/g, actualData.content.process?.time || 'Every product requires significant time investment and specialized expertise. Our skilled craftspeople dedicate hours to perfecting each detail.');
        result = result.replace(/\{\{content\.process\.quality \|\| 'Rigorous testing and quality control measures ensure that every product meets our high standards before reaching our customers\.'\}\}/g, actualData.content.process?.quality || 'Rigorous testing and quality control measures ensure that every product meets our high standards before reaching our customers.');
        result = result.replace(/\{\{content\.process\.ethics \|\| 'We are committed to sustainable and ethical practices throughout our entire production process, ensuring a positive impact on the environment and society\.'\}\}/g, actualData.content.process?.ethics || 'We are committed to sustainable and ethical practices throughout our entire production process, ensuring a positive impact on the environment and society.');
        
        // LEGACY PRODUCT REPLACEMENTS
        result = result.replace(/\{\{content\.title\}\}/g, actualData.content.title || 'Product Title');
        result = result.replace(/\{\{content\.description\}\}/g, actualData.content.description || 'Product description');
        result = result.replace(/\{\{content\.price\}\}/g, actualData.content.price || '$0.00');
        
        // SELLER INFO REPLACEMENTS
        result = result.replace(/\{\{content\.name\}\}/g, actualData.content.name || '');
        result = result.replace(/\{\{content\.bio\}\}/g, actualData.content.bio || '');
        result = result.replace(/\{\{content\.story\}\}/g, actualData.content.story || '');
        result = result.replace(/\{\{content\.experience\}\}/g, actualData.content.experience || '');
        
        // Handle OR expressions with fallbacks
        result = result.replace(/\{\{content\.name \|\| 'Your Name'\}\}/g, actualData.content.name || 'Your Name');
        result = result.replace(/\{\{content\.title \|\| 'Your Professional Title'\}\}/g, actualData.content.title || 'Your Professional Title');
        result = result.replace(/\{\{content\.bio \|\| 'Your professional bio will appear here\.\.\.'\}\}/g, actualData.content.bio || 'Your professional bio will appear here...');
        
        // Image replacements with actual uploaded images
        result = result.replace(/\{\{images\[0\]\}\}/g, actualData.images[0] || '');
        result = result.replace(/\{\{images\[1\]\}\}/g, actualData.images[1] || '');
        result = result.replace(/\{\{images\[2\]\}\}/g, actualData.images[2] || '');
        result = result.replace(/\{\{images\[3\]\}\}/g, actualData.images[3] || '');
        
        // Handle seller info arrays - expand them for editing
        if (result === 'SPECIALTIES_ARRAY') {
          const specialties = actualData.content.specialties || [];
          return specialties.map((specialty, index) => ({
            id: `specialty-${index}`,
            type: 'div',
            props: { className: 'bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm' },
            children: [specialty]
          }));
        }
        
        if (result === 'ACHIEVEMENTS_ARRAY') {
          const achievements = actualData.content.achievements || [];
          return achievements.map((achievement, index) => ({
            id: `achievement-${index}`,
            type: 'div',
            props: { className: 'bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm' },
            children: [achievement]
          }));
        }
        
        return result;
      }
      
      if (Array.isArray(node)) {
        return node.map(processNode).flat();
      }
      
      if (typeof node === 'object' && node !== null) {
        const processed = {};
        for (const [key, value] of Object.entries(node)) {
          processed[key] = processNode(value);
        }
        return processed;
      }
      
      return node;
    };
    
    // Process the entire template with actual data
    const finalTemplate = processNode(processedTemplate);
    
    return {
      model: finalTemplate,
      content: actualData.content,
      images: actualData.images
    };
  }, [templateData, type]);

  // Update preview when result changes
  useEffect(() => {
    if (result?.modifications && result.hasChanges) {
      // Create preview template with AI modifications
      const updatedTemplate = { ...templateData.model };
      
      if (result.modifications.styleVariables) {
        updatedTemplate.styleVariables = {
          ...updatedTemplate.styleVariables,
          ...result.modifications.styleVariables
        };
      }
      
      if (result.modifications.metadata) {
        updatedTemplate.metadata = {
          ...updatedTemplate.metadata,
          ...result.modifications.metadata
        };
      }
      
      if (result.modifications.component) {
        updatedTemplate.component = result.modifications.component;
      }
      
      // Generate processed version for preview
      const processedPreview = generateProcessedJSON({ model: updatedTemplate });
      setPreviewTemplate(processedPreview);
    } else {
      // Show current template when no changes
      setPreviewTemplate(generateProcessedJSON(templateData));
    }
  }, [result, templateData, generateProcessedJSON]);

  // Initialize preview on open
  useEffect(() => {
    if (isOpen && templateData) {
      setPreviewTemplate(generateProcessedJSON(templateData));
    }
  }, [isOpen, templateData, generateProcessedJSON]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, result, error]);

  // Generate AI response using Gemini API with processed JSON
  const generateAIResponse = useCallback(async (prompt, template) => {
    try {
      console.log('🤖 [AI ASSISTANT] Generating AI response with processed JSON');
      
      // Generate processed JSON for AI to work with
      const processedTemplate = generateProcessedJSON(template);
      
      if (!processedTemplate) {
        throw new Error('Failed to generate processed template');
      }
      
      console.log('📊 [AI ASSISTANT] Sending processed data to AI:', {
        hasProcessedModel: !!processedTemplate.model,
        contentKeys: Object.keys(processedTemplate.content),
        imageCount: processedTemplate.images.length
      });

      const response = await fetch('/api/ai/modify-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          templateData: {
            model: processedTemplate.model, // Send processed template with actual data filled in
            content: processedTemplate.content, // Send actual form content
            images: processedTemplate.images // Send actual uploaded images
          },
          type: type,
          isProcessed: true // Flag to indicate this is processed JSON
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate response');
      }

      return {
        success: true,
        modifications: data.modifications,
        explanation: data.explanation,
        hasChanges: data.hasChanges
      };

    } catch (error) {
      console.error('Error calling AI API:', error);
      throw new Error('Failed to connect to AI service. Please try again.');
    }
  }, [type]);

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
      status: 'processing'
    };

    // Add to end of history (newest at bottom)
    setHistory(prev => [...prev, newRequest]);

    try {
      const aiResult = await generateAIResponse(prompt.trim(), templateData);

      setResult(aiResult);
      setHistory(prev => prev.map(item => 
        item.id === newRequest.id 
          ? { ...item, status: 'completed', result: aiResult }
          : item
      ));

    } catch (err) {
      const errorMessage = err.message || 'Something went wrong. Please try again.';
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

  const handleApplyChanges = useCallback(() => {
    if (result?.modifications && result.hasChanges) {
      console.log('Applying validated changes:', result.modifications);
      
      // Create the updated template by properly merging all modifications
      const updatedTemplate = { ...templateData.model };
      
      // Apply styleVariables if provided
      if (result.modifications.styleVariables) {
        updatedTemplate.styleVariables = {
          ...updatedTemplate.styleVariables,
          ...result.modifications.styleVariables
        };
        console.log('Applied styleVariables:', updatedTemplate.styleVariables);
      }
      
      // Apply metadata if provided
      if (result.modifications.metadata) {
        updatedTemplate.metadata = {
          ...updatedTemplate.metadata,
          ...result.modifications.metadata
        };
        console.log('Applied metadata:', updatedTemplate.metadata);
      }
      
      // Apply component structure if provided (already validated)
      if (result.modifications.component) {
        updatedTemplate.component = result.modifications.component;
        console.log('Applied validated component structure');
      }
      
      console.log('Final updated template:', updatedTemplate);
      
      // Call the update function
      if (onTemplateUpdate) {
        onTemplateUpdate(updatedTemplate);
        setResult(null);
        
        // Add success message to history
        const successMessage = {
          id: Date.now(),
          prompt: '✅ Changes applied successfully!',
          timestamp: new Date().toLocaleTimeString(),
          status: 'completed',
          result: {
            explanation: 'Your template has been updated with the AI-generated changes. All modifications were validated for safety.',
            hasChanges: false
          }
        };
        setHistory(prev => [...prev, successMessage]);
      } else {
        console.error('onTemplateUpdate function not provided');
      }
    }
  }, [result, templateData, onTemplateUpdate]);

  // Get quick prompts based on type
  const getQuickPrompts = () => {
    if (type === 'seller-info') {
      return [
        "Make it more professional",
        "Add warm, personal touches",
        "Use elegant colors",
        "Make text more readable",
        "Add more spacing",
        "Use modern design"
      ];
    } else {
      return [
        "Make it blue and modern",
        "Apply a dark theme", 
        "Use elegant serif fonts",
        "Change to green colors",
        "Make text larger",
        "Add more spacing"
      ];
    }
  };

  const quickPrompts = getQuickPrompts();

  // Get data summary based on type
  const getDataSummary = () => {
    if (type === 'seller-info') {
      return (
        <div className="text-xs text-blue-800 space-y-1">
          <div>• Name: {templateData?.content?.name || 'Not set'}</div>
          <div>• Title: {templateData?.content?.title || 'Not set'}</div>
          <div>• Specialties: {templateData?.content?.specialties?.length || 0} items</div>
          <div>• Achievements: {templateData?.content?.achievements?.length || 0} items</div>
          <div>• Photos: {templateData?.images?.length || 0} uploaded images</div>
        </div>
      );
    } else {
      return (
        <div className="text-xs text-blue-800 space-y-1">
          <div>• Title: {templateData?.content?.title || 'Not set'}</div>
          <div>• Features: {templateData?.content?.features?.length || 0} features</div>
          <div>• Specs: {Object.keys(templateData?.content?.specifications || {}).length} specifications</div>
          <div>• Images: {templateData?.images?.length || 0} uploaded images</div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bot className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Template Assistant</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Shield size={12} className="text-green-600" />
                Protected by validation • {templateName} • Your actual content & images
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col border-r`}>
            {/* Chat Header */}
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">AI Chat</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Your {type === 'seller-info' ? 'Seller' : 'Product'} Assistant
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Welcome Message */}
          {history.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Bot className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Hi! I can safely edit your {type === 'seller-info' ? 'seller info' : 'product'} template with your actual content.
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    I have access to your {type === 'seller-info' ? 'seller' : 'form'} data and uploaded images, and will validate all changes.
                  </p>
                  
                  <div className="bg-blue-100 rounded-lg p-3 mb-3">
                    <h4 className="text-xs font-medium text-blue-900 mb-1">Your Actual Data Available:</h4>
                    {getDataSummary()}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(example)}
                        className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-blue-200"
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
            <div key={item.id} className="space-y-3">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="flex items-start gap-3 max-w-xs">
                  <div className="bg-blue-600 text-white rounded-lg px-3 py-2">
                    <p className="text-sm">{item.prompt}</p>
                  </div>
                  <div className="p-1.5 bg-blue-100 rounded-full">
                    <User size={14} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-sm">
                  <div className="p-1.5 bg-gray-100 rounded-full">
                    <Bot size={14} className="text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    {item.status === 'processing' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span>AI analyzing your {type === 'seller-info' ? 'seller' : 'product'} content...</span>
                      </div>
                    )}
                    
                    {item.status === 'completed' && item.result && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{item.result.explanation}</p>
                        {item.result.hasChanges && (
                          <button
                            onClick={() => setResult(item.result)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1"
                          >
                            <Shield size={10} className="text-green-600" />
                            Apply Safe Changes
                          </button>
                        )}
                      </div>
                    )}
                    
                    {item.status === 'error' && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle size={14} />
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <h3 className="font-medium text-green-900">Validated Changes Ready</h3>
                  <Shield size={14} className="text-green-600" />
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X size={14} />
                </button>
              </div>
              
              <p className="text-sm text-green-700 mb-3 whitespace-pre-line">{result.explanation}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleApplyChanges}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                >
                  <Shield size={12} />
                  Apply Safe Changes
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1.5 text-green-600 hover:text-green-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Tell me how to modify your ${type === 'seller-info' ? 'seller info' : 'product'} template...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || isProcessing}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 flex flex-col">
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {result?.hasChanges ? 'AI Changes Preview' : 'Current Template'}
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-white">
                <div className="p-4 h-full overflow-auto">
                  {previewTemplate ? (
                    <div style={{ fontSize: '12px', transform: 'scale(0.7)', transformOrigin: 'top left', width: '142%' }}>
                      <EnhancedJSONModelRenderer
                        model={previewTemplate.model}
                        content={previewTemplate.content}
                        images={previewTemplate.images}
                        isEditing={false}
                        styleVariables={previewTemplate.model?.styleVariables || {}}
                        debug={false}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-600 text-sm mb-2">Preview Loading...</div>
                      <div className="text-xs text-gray-400">
                        Generating preview with your actual content
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-purple-500" />
              <span>
                AI Template Assistant • {showPreview 
                  ? `Preview shows ${result?.hasChanges ? 'AI changes' : 'current template'} with your actual data` 
                  : 'Chat with AI to modify your template'
                } • Protected by validation
              </span>
            </div>
            {result?.hasChanges && (
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                ℹ️ Changes ready to apply - see preview on the right
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            {result?.hasChanges && (
              <button
                onClick={handleApplyChanges}
                className="px-6 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Shield size={14} />
                Apply Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}