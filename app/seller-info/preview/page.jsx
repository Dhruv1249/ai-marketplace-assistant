'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Eye, Code, Bot, Settings, Palette } from 'lucide-react';
import SimpleSellerInfoRenderer from '@/components/seller-info/SimpleSellerInfoRenderer';
import SellerInfoTemplatePreview from '@/components/seller-info/SellerInfoTemplatePreview';
import EnhancedSourceCodeEditor from '@/components/editors/EnhancedSourceCodeEditor';
import EnhancedAIAssistant from '@/components/editors/EnhancedAIAssistant';

// Template imports
import professionalTemplate from '@/components/seller-info/templates/professional-template.json';
import creativeTemplate from '@/components/seller-info/templates/creative-template.json';
import executiveTemplate from '@/components/seller-info/templates/executive-template.json';
import personalTemplate from '@/components/seller-info/templates/personal-template.json';

const TEMPLATE_MAP = {
  'professional': professionalTemplate,
  'creative': creativeTemplate,
  'executive': executiveTemplate,
  'personal': personalTemplate,
};

export default function SellerInfoPreviewPage() {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [useEnhancedRenderer, setUseEnhancedRenderer] = useState(true);
  const [sourceCodeEditorOpen, setSourceCodeEditorOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [styleVariables, setStyleVariables] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sellerInfoPreviewData');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.sellerData && parsed.templateType) {
          setData(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to read sellerInfoPreviewData:', e);
    }
  }, []);

  // Handle template updates from enhanced editors
  const handleTemplateUpdate = useCallback((updatedTemplate) => {
    console.log('Template updated:', updatedTemplate);
  }, []);

  // Handle component selection in edit mode
  const handleComponentSelect = useCallback((component) => {
    setSelectedComponentId(component?.id || null);
  }, []);

  // Handle source code editor actions
  const handleSourceCodeSave = useCallback((newHTML) => {
    setSourceCodeEditorOpen(false);
  }, []);

  const handleSourceCodeReset = useCallback(() => {
    setStyleVariables({});
  }, []);

  // Handle AI assistant template updates
  const handleAITemplateUpdate = useCallback((updatedTemplate) => {
    handleTemplateUpdate(updatedTemplate);
    setAiAssistantOpen(false);
  }, [handleTemplateUpdate]);

  const getTemplateName = () => {
    if (!data?.templateType) return 'SellerInfoTemplate.jsx';
    return data.templateType.charAt(0).toUpperCase() + data.templateType.slice(1) + 'SellerInfoTemplate.jsx';
  };

  const getCurrentTemplate = () => {
    if (!data?.templateType) return professionalTemplate;
    return TEMPLATE_MAP[data.templateType] || professionalTemplate;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller-info" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Seller Info Preview</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Renderer:</label>
              <select
                value={useEnhancedRenderer ? 'enhanced' : 'legacy'}
                onChange={(e) => setUseEnhancedRenderer(e.target.value === 'enhanced')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="enhanced">Enhanced JSON</option>
                <option value="legacy">Legacy React</option>
              </select>
            </div>

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

            {useEnhancedRenderer && (
              <>
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
              </>
            )}
            
            <div className="text-xs text-gray-500">
              Keep the seller info tab open to maintain your data.
            </div>
          </div>
        </div>
      </div>

      {/* Template Info Bar */}
      {data && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {data.templateType?.charAt(0).toUpperCase() + data.templateType?.slice(1)} Template
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Palette size={14} className="text-gray-500" />
              <span className="text-xs text-gray-600">
                Seller Info Layout
              </span>
            </div>
            <div className="flex gap-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                {useEnhancedRenderer ? 'JSON Model' : 'React Component'}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            v1.0
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
                Go back to the Seller Info page, fill in your information, and click Preview.
              </p>
            </div>
          </div>
        ) : (
          <>
            {useEnhancedRenderer ? (
              <SimpleSellerInfoRenderer
                templateType={data.templateType}
                sellerData={data.sellerData}
                isEditing={isEditing}
                onUpdate={handleTemplateUpdate}
                onComponentSelect={handleComponentSelect}
                selectedComponentId={selectedComponentId}
              />
            ) : (
              <SellerInfoTemplatePreview 
                templateType={data.templateType} 
                sellerData={data.sellerData} 
              />
            )}
          </>
        )}
      </div>

      {/* Edit Mode Helper */}
      {isEditing && useEnhancedRenderer && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold mb-2">Edit Mode Active</h3>
          <ul className="text-sm space-y-1">
            <li>• Click elements to select them</li>
            <li>• Double-click text to edit content</li>
            <li>• Use the component dialog for advanced editing</li>
            <li>• Click outside to deselect elements</li>
          </ul>
        </div>
      )}

      {/* Enhanced Editors */}
      {useEnhancedRenderer && (
        <>
          <EnhancedSourceCodeEditor
            isOpen={sourceCodeEditorOpen}
            onClose={() => setSourceCodeEditorOpen(false)}
            onSave={handleSourceCodeSave}
            onReset={handleSourceCodeReset}
            templateData={{
              model: getCurrentTemplate(),
              content: data?.sellerData || {},
              images: data?.sellerData?.photos?.map(photo => photo.url) || []
            }}
            templateName={getTemplateName()}
            onTemplateUpdate={handleTemplateUpdate}
          />

          <EnhancedAIAssistant
            isOpen={aiAssistantOpen}
            onClose={() => setAiAssistantOpen(false)}
            onTemplateUpdate={handleAITemplateUpdate}
            templateData={{
              model: getCurrentTemplate(),
              content: data?.sellerData || {},
              images: data?.sellerData?.photos?.map(photo => photo.url) || []
            }}
            templateName={getTemplateName()}
          />
        </>
      )}
    </div>
  );
}