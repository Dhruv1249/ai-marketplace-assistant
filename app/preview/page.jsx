// app/preview/page.jsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Eye } from 'lucide-react';
import FullTemplatePreview from '@/components/templates/FullPreview';
import SourceCodeEditor from '@/components/editors/SourceCodeEditor';
import AIAssistant from '@/components/editors/AIAssistant';

export default function PreviewPage() {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sourceCodeEditorOpen, setSourceCodeEditorOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [customHTML, setCustomHTML] = useState('');
  const [useCustomHTML, setUseCustomHTML] = useState(false);

  useEffect(() => {
    try {
      // Try to get data from temporary localStorage first
      let raw = localStorage.getItem('tempPreviewData');
      console.log('Raw localStorage data:', raw);
      
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log('Parsed preview data:', parsed);
        setData(parsed);
        // Clean up the temporary data after reading
        localStorage.removeItem('tempPreviewData');
      } else {
        // Fallback to sessionStorage for same-tab previews
        raw = sessionStorage.getItem('previewData');
        console.log('Fallback to sessionStorage:', raw);
        if (raw) {
          const parsed = JSON.parse(raw);
          console.log('Parsed sessionStorage data:', parsed);
          setData(parsed);
        } else {
          console.log('No preview data found in localStorage or sessionStorage');
        }
      }
    } catch (e) {
      console.error('Failed to read preview data:', e);
    }
  }, []);

  const handleContentChange = (elementId, newText, newStyle) => {
    // Update the content based on element changes
    console.log('Content changed:', elementId, newText, newStyle);
    // No saving logic - changes are temporary only
  };

  const handleSourceCodeSave = (newHTML) => {
    setCustomHTML(newHTML);
    setUseCustomHTML(true);
    setSourceCodeEditorOpen(false);
    console.log('HTML code updated:', newHTML);
  };

  const handleSourceCodeReset = () => {
    setCustomHTML('');
    setUseCustomHTML(false);
    console.log('Template reset to default');
  };

  const handleAIApplyChanges = (changes) => {
    // AI changes are HTML fragments, so we need to integrate them
    if (customHTML) {
      // Insert AI changes into existing HTML
      const updatedHTML = customHTML.replace(
        '</main>',
        `${changes}\n    </main>`
      );
      setCustomHTML(updatedHTML);
    } else {
      // Create new HTML with AI changes
      setCustomHTML(changes);
    }
    setUseCustomHTML(true);
    setAiAssistantOpen(false);
    console.log('AI changes applied:', changes);
  };

  const getTemplateName = () => {
    if (!data?.layoutType) return 'Template';
    return data.layoutType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Template.jsx';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Source Code
            </button>

            <button
              onClick={() => setAiAssistantOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Assistant
            </button>
            
            <div className="text-xs text-gray-500">
              Keep the creation tab open to view uploaded images in this preview.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!data ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-700">
              No preview data found. Go back to the Create page, generate content, choose a layout, and click Preview.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {useCustomHTML ? (
              // Show custom HTML in iframe
              <div className="w-full">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Custom HTML Preview:</strong> Showing your edited HTML code
                  </p>
                </div>
                <iframe
                  srcDoc={customHTML}
                  className="w-full h-[80vh] border rounded-lg"
                  title="Custom HTML Preview"
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              // Use FullTemplatePreview for both preview and "edit mode" (keeps UI consistent and avoids missing import)
              <FullTemplatePreview 
                layoutType={data.layoutType} 
                content={data.content} 
                images={data.images}
                isEditing={isEditing}
                onContentChange={handleContentChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Edit Mode Instructions */}
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

      {/* Source Code Editor */}
      <SourceCodeEditor
        isOpen={sourceCodeEditorOpen}
        onClose={() => setSourceCodeEditorOpen(false)}
        onSave={handleSourceCodeSave}
        onReset={handleSourceCodeReset}
        templateData={data}
        templateName={getTemplateName()}
      />

      {/* AI Assistant */}
      <AIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onApplyChanges={handleAIApplyChanges}
        currentTemplate={customHTML || 'No custom template yet'}
        templateName={getTemplateName()}
      />
    </div>
  );
}
