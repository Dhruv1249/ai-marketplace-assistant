"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, User, CheckCircle, AlertCircle } from 'lucide-react';

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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, result, error]);

  // Generate AI response using Gemini API
  const generateAIResponse = useCallback(async (prompt, template) => {
    try {
      const response = await fetch('/api/ai/modify-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          templateData: template,
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
  }, []);

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
      console.log('Applying changes:', result.modifications);
      
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
      
      // Apply component structure if provided
      if (result.modifications.component) {
        updatedTemplate.component = result.modifications.component;
        console.log('Applied component structure');
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
            explanation: 'Your template has been updated with the AI-generated changes.',
            hasChanges: false
          }
        };
        setHistory(prev => [...prev, successMessage]);
      } else {
        console.error('onTemplateUpdate function not provided');
      }
    }
  }, [result, templateData, onTemplateUpdate]);

  const quickPrompts = [
    "Make it blue and modern",
    "Apply a dark theme", 
    "Use elegant serif fonts",
    "Add more breathing room",
    "Create a green nature theme",
    "Add testimonials section"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Template Editor</h2>
              <p className="text-sm text-gray-500">Powered by Gemini AI • {templateName}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
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
                    Hi! I can edit your entire JSON template structure.
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    I can modify colors, fonts, layout, add sections, change structure, and more!
                  </p>
                  
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
                        <span>AI is editing JSON...</span>
                      </div>
                    )}
                    
                    {item.status === 'completed' && item.result && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{item.result.explanation}</p>
                        {item.result.hasChanges && (
                          <button
                            onClick={() => setResult(item.result)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Apply JSON Changes
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
                  <h3 className="font-medium text-green-900">JSON Template Changes Ready</h3>
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
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Apply to Template
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
              placeholder="Tell me how to modify the JSON template..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
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
    </div>
  );
}