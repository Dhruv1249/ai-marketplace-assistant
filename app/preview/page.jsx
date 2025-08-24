'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Eye, Code, Bot, Settings, Palette } from 'lucide-react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';
import EnhancedSourceCodeEditor from '@/components/editors/EnhancedSourceCodeEditor';
import EnhancedAIAssistant from '@/components/editors/EnhancedAIAssistant';

export default function PreviewPage() {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sourceCodeEditorOpen, setSourceCodeEditorOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [styleVariables, setStyleVariables] = useState({});

  useEffect(() => {
  try {
    const raw = localStorage.getItem('previewData');
    console.log('Raw previewData from localStorage:', raw);
    if (raw) {
      const parsed = JSON.parse(raw);
      console.log('Parsed previewData:', parsed);
      if (parsed?.model && parsed.model.metadata && parsed.model.component && parsed.content) {
        setData(parsed);
        localStorage.removeItem('previewData'); // Clear to prevent stale data
      } else {
        console.error('Invalid previewData structure:', parsed);
      }
    } else {
      console.error('No previewData found in localStorage');
    }
  } catch (e) {
    console.error('Failed to read or parse previewData:', e);
  }
}, []);

  // Handle template updates from enhanced editors
  const handleTemplateUpdate = useCallback((updatedTemplate) => {
    console.log('Template updated:', updatedTemplate);
    setData(prevData => ({
      ...prevData,
      model: updatedTemplate
    }));
    
    // Update style variables if they changed
    if (updatedTemplate.styleVariables) {
      setStyleVariables(updatedTemplate.styleVariables);
    }
  }, []);

  // Handle component selection in edit mode
  const handleComponentSelect = useCallback((component) => {
    console.log('Component selected:', component);
    setSelectedComponentId(component?.id || null);
  }, []);

  // Handle source code editor actions
  const handleSourceCodeSave = useCallback((newHTML) => {
    console.log('Source code saved');
    setSourceCodeEditorOpen(false);
  }, []);

  const handleSourceCodeReset = useCallback(() => {
    console.log('Template reset to default');
    if (data?.model) {
      // Reset any custom style variables
      setStyleVariables({});
    }
  }, [data]);

  // Handle AI assistant template updates
  const handleAITemplateUpdate = useCallback((updatedTemplate) => {
    console.log('AI template update:', updatedTemplate);
    handleTemplateUpdate(updatedTemplate);
    setAiAssistantOpen(false);
  }, [handleTemplateUpdate]);

  const getTemplateName = () => {
    if (!data?.model?.metadata?.template) return 'Template';
    return data.model.metadata.template.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Template.jsx';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/create" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Template Preview</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isEditing ? (
                <>
                  <Eye size={16} />
                  Preview Mode
                </>
              ) : (
                <>
                  <Edit3 size={16} />
                  Edit Mode
                </>
              )}
            </button>

            <button
              onClick={() => setSourceCodeEditorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Code size={16} />
              Source Code
            </button>

            <button
              onClick={() => setAiAssistantOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors"
            >
              <Bot size={16} />
              AI Assistant
            </button>
            
            <div className="text-xs text-gray-500">
              Keep the creation tab open to view uploaded images in this preview.
            </div>
          </div>
        </div>
      </div>

      {/* Template Info Bar */}
      {data?.model?.metadata && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {data.model.metadata.name || 'Template'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Palette size={14} className="text-gray-500" />
              <span className="text-xs text-gray-600">
                {data.model.metadata.sections?.length || 0} sections
              </span>
            </div>
            {data.model.metadata.tags && (
              <div className="flex gap-1">
                {data.model.metadata.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            v{data.model.metadata.version || '1.0'}
          </div>
        </div>
      )}

      {/* Full Screen Preview - No Container, No Box */}
      <div className="w-full">
        {!data ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-gray-700 text-lg mb-4">
                No preview data found.
              </p>
              <p className="text-gray-500">
                Go back to the Create page, generate content, choose a layout, and click Preview.
              </p>
            </div>
          </div>
        ) : (
          <EnhancedJSONModelRenderer
            model={data.model}
            content={data.content}
            images={data.images}
            isEditing={isEditing}
            onUpdate={handleTemplateUpdate}
            onComponentSelect={handleComponentSelect}
            selectedComponentId={selectedComponentId}
            styleVariables={styleVariables}
          />
        )}
      </div>

      {/* Edit Mode Helper */}
      {isEditing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold mb-2">Edit Mode Active</h3>
          <ul className="text-sm space-y-1">
            <li>• Click and drag elements to move them</li>
            <li>• Double-click text to edit content</li>
            <li>• Use resize handles to adjust size</li>
            <li>• Click outside to deselect elements</li>
          </ul>
        </div>
      )}

      {/* Enhanced Editors */}
      <EnhancedSourceCodeEditor
        isOpen={sourceCodeEditorOpen}
        onClose={() => setSourceCodeEditorOpen(false)}
        onSave={handleSourceCodeSave}
        onReset={handleSourceCodeReset}
        templateData={data}
        templateName={getTemplateName()}
        onTemplateUpdate={handleTemplateUpdate}
      />

      <EnhancedAIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onTemplateUpdate={handleAITemplateUpdate}
        templateData={data}
        templateName={getTemplateName()}
      />
    </div>
  );
}