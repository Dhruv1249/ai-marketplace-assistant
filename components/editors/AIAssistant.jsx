"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Image, AlertCircle, CheckCircle, Bot, User, Zap, Wand2 } from 'lucide-react';

export default function AIAssistant({ 
  isOpen, 
  onClose, 
  onApplyChanges,
  currentTemplate,
  templateName 
}) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, result, error]);

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
      // Simulate AI processing with more realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
      
      // Generate more realistic AI response based on prompt
      const mockResult = generateAIResponse(prompt.trim());

      setResult(mockResult);
      setHistory(prev => prev.map(item => 
        item.id === newRequest.id 
          ? { ...item, status: 'completed', result: mockResult }
          : item
      ));

    } catch (err) {
      const errorMessage = 'AI processing failed. Please try again or rephrase your request.';
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
    if (lower.includes('color') || lower.includes('style') || lower.includes('theme')) return 'design';
    if (lower.includes('layout') || lower.includes('grid') || lower.includes('column')) return 'layout';
    if (lower.includes('text') || lower.includes('content') || lower.includes('copy')) return 'content';
    if (lower.includes('image') || lower.includes('photo') || lower.includes('picture')) return 'media';
    return 'general';
  };

  const generateAIResponse = (prompt) => {
    const lower = prompt.toLowerCase();
    let changes = '';
    let explanation = '';

    if (lower.includes('blue') && lower.includes('header')) {
      changes = `<!-- Updated header with blue styling -->
<header class="bg-blue-600 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-4xl font-bold">${templateName.replace('Template.jsx', '')} Product</h1>
        <p class="text-blue-100 mt-2">Enhanced with blue theme</p>
    </div>
</header>`;
      explanation = "I've updated the header with a blue background and white text for better contrast.";
    } else if (lower.includes('contact') && lower.includes('form')) {
      changes = `<!-- New contact form section -->
<section class="bg-gray-50 py-12">
    <div class="max-w-2xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-center mb-8">Contact Us</h2>
        <form class="space-y-6 bg-white p-8 rounded-lg shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Your Name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <input type="email" placeholder="Your Email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <textarea placeholder="Your Message" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Send Message</button>
        </form>
    </div>
</section>`;
      explanation = "I've added a professional contact form with name, email, and message fields.";
    } else if (lower.includes('3') && lower.includes('column')) {
      changes = `<!-- Updated to 3-column layout -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold mb-3">Column 1</h3>
        <p class="text-gray-600">Content for first column</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold mb-3">Column 2</h3>
        <p class="text-gray-600">Content for second column</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold mb-3">Column 3</h3>
        <p class="text-gray-600">Content for third column</p>
    </div>
</div>`;
      explanation = "I've restructured the layout to use a responsive 3-column grid system.";
    } else {
      changes = `<!-- AI-generated enhancement for: "${prompt}" -->
<div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-lg">
    <h2 class="text-2xl font-bold mb-4">✨ AI Enhancement Applied</h2>
    <p class="mb-4">Based on your request: "${prompt}"</p>
    <div class="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
        <p class="text-sm">This is a simulated AI response. In the full implementation, 
        the AI would analyze your request and make specific modifications to your template.</p>
    </div>
</div>`;
      explanation = `I've analyzed your request and prepared enhancements for your ${templateName}.`;
    }

    return {
      success: true,
      changes,
      explanation,
      category: detectCategory(prompt)
    };
  };

  const handleApplyChanges = () => {
    if (result?.changes) {
      onApplyChanges(result.changes);
      setResult(null);
    }
  };

  const examplePrompts = {
    design: [
      "Make the header blue with white text",
      "Add a dark theme toggle",
      "Use a gradient background",
      "Change the color scheme to green"
    ],
    layout: [
      "Change to 3-column layout",
      "Make it mobile-first responsive",
      "Add a sidebar navigation",
      "Create a hero section"
    ],
    content: [
      "Make the text more professional",
      "Add testimonials section",
      "Include pricing information",
      "Add FAQ section"
    ],
    media: [
      "Generate a hero image of a modern office",
      "Add product gallery",
      "Create icon set for features",
      "Add background patterns"
    ]
  };

  const categories = [
    { id: 'all', name: 'All', icon: Sparkles },
    { id: 'design', name: 'Design', icon: Wand2 },
    { id: 'layout', name: 'Layout', icon: Zap },
    { id: 'content', name: 'Content', icon: User },
    { id: 'media', name: 'Media', icon: Image }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-500">Powered by advanced AI • {templateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Welcome Message */}
            {history.length === 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 mb-3">Welcome to AI Assistant! ✨</h3>
                    <p className="text-purple-800 text-sm mb-4">
                      I can help you transform your template using natural language. Just describe what you want!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-purple-900 text-sm">🎨 Design & Styling</h4>
                        <ul className="text-purple-800 text-xs space-y-1">
                          <li>• Change colors and themes</li>
                          <li>• Modify fonts and typography</li>
                          <li>• Add animations and effects</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-purple-900 text-sm">🏗️ Layout & Structure</h4>
                        <ul className="text-purple-800 text-xs space-y-1">
                          <li>• Reorganize sections</li>
                          <li>• Add new components</li>
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
                  <div className="flex items-start gap-3 max-w-md">
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
                  <div className="flex items-start gap-3 max-w-md">
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
                          <span>Analyzing your request...</span>
                        </div>
                      )}
                      
                      {item.status === 'completed' && item.result && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle size={16} />
                            <span className="font-medium">Changes ready!</span>
                          </div>
                          <p className="text-sm text-gray-700">{item.result.explanation}</p>
                          <button
                            onClick={() => setResult(item.result)}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                          >
                            View & Apply Changes
                          </button>
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
            {result && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Changes Ready to Apply</h3>
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
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
                    {result.changes}
                  </pre>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleApplyChanges}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <Zap size={16} />
                    Apply Changes
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
                    placeholder="Describe what you want to change... (e.g., 'Make the header blue and add a contact form')"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={isProcessing}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Sparkles size={16} />
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

        {/* Footer */}
        <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Bot size={16} className="text-purple-500" />
              <span>AI Assistant • Powered by MCP Server & Pollination AI</span>
            </div>
            <div className="text-xs text-gray-500">
              Changes are temporary • Max 3 retry attempts per request
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}