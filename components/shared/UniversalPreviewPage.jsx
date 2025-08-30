'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Eye, Code, Bot, Settings, Palette } from 'lucide-react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';
import SimpleSellerInfoRenderer from '@/components/seller-info/SimpleSellerInfoRenderer';
import UniversalSourceCodeEditor from '@/components/shared/UniversalSourceCodeEditor';
import UniversalAIAssistant from '@/components/shared/UniversalAIAssistant';

// Import seller info templates
import professionalTemplate from '@/components/seller-info/templates/professional-template.json';
import creativeTemplate from '@/components/seller-info/templates/creative-template.json';
import executiveTemplate from '@/components/seller-info/templates/executive-template.json';
import personalTemplate from '@/components/seller-info/templates/personal-template.json';

const SELLER_TEMPLATE_MAP = {
  'professional': professionalTemplate,
  'creative': creativeTemplate,
  'executive': executiveTemplate,
  'personal': personalTemplate,
};

export default function UniversalPreviewPage({ 
  type = 'product', // 'product' or 'seller-info'
  backUrl = '/create',
  storageKey = 'previewData',
  title = 'Template Preview',
  helpText = 'Keep the creation tab open to view uploaded images in this preview.'
}) {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sourceCodeEditorOpen, setSourceCodeEditorOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [styleVariables, setStyleVariables] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      console.log(`Raw ${storageKey} from localStorage:`, raw);
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log(`Parsed ${storageKey}:`, parsed);
        
        // Handle different data structures
        if (type === 'seller-info') {
          // Check for new format (same as product page)
          if (parsed?.model && parsed.model.metadata && parsed.model.component && parsed.content) {
            console.log('Seller info using new format (same as product)');
            setData(parsed);
          }
          // Check for old format (legacy)
          else if (parsed?.sellerData && parsed.templateType) {
            console.log('Seller info using old format (legacy)');
            setData(parsed);
          } else {
            console.error('Invalid seller info data structure:', parsed);
          }
        } else {
          // Product type
          if (parsed?.model && parsed.model.metadata && parsed.model.component && parsed.content) {
            setData(parsed);
          } else {
            console.error('Invalid product data structure:', parsed);
          }
        }
      } else {
        console.error(`No ${storageKey} found in localStorage`);
      }
    } catch (e) {
      console.error(`Failed to read or parse ${storageKey}:`, e);
    }
  }, [storageKey, type]);

  // Handle template updates from enhanced editors
  const handleTemplateUpdate = useCallback((updatedTemplate) => {
    console.log('Template updated:', updatedTemplate);
    if (type === 'seller-info') {
      // For seller info, we need to update the template in the template map
      // This is more complex since we're dealing with JSON templates
      setData(prevData => ({
        ...prevData,
        // We could store custom template modifications here
        customTemplate: updatedTemplate
      }));
    } else {
      setData(prevData => ({
        ...prevData,
        model: updatedTemplate
      }));
    }
    
    // Update style variables if they changed
    if (updatedTemplate.styleVariables) {
      setStyleVariables(updatedTemplate.styleVariables);
    }
  }, [type]);

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
    if (type === 'seller-info') {
      // Handle both new and old formats
      if (data?.model?.metadata?.template) {
        return data.model.metadata.template.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join('') + 'Template.jsx';
      } else if (data?.templateType) {
        return data.templateType.charAt(0).toUpperCase() + data.templateType.slice(1) + 'SellerInfoTemplate.jsx';
      }
      return 'SellerInfoTemplate.jsx';
    } else {
      if (!data?.model?.metadata?.template) return 'Template';
      return data.model.metadata.template.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('') + 'Template.jsx';
    }
  };

  const getTemplateData = () => {
    if (type === 'seller-info') {
      // Handle new format (already in correct structure)
      if (data?.model && data.model.metadata && data.model.component && data.content) {
        return data;
      }
      // Handle old format (convert to new structure)
      else if (data?.sellerData && data.templateType) {
        const template = data?.customTemplate || SELLER_TEMPLATE_MAP[data?.templateType] || professionalTemplate;
        
        return {
          model: template,
          content: {
            // Map seller data to content format expected by editors
            title: data?.sellerData?.name || 'Seller Name',
            description: data?.sellerData?.bio || 'Professional bio...',
            story: data?.sellerData?.story || '',
            experience: data?.sellerData?.experience || '',
            specialties: data?.sellerData?.specialties || [],
            achievements: data?.sellerData?.achievements || [],
            contact: data?.sellerData?.contact || {},
            businessInfo: data?.sellerData?.businessInfo || {},
            // Add all seller data for AI to understand
            ...data?.sellerData
          },
          images: data?.sellerData?.photos?.map(photo => photo.url) || []
        };
      }
    } else {
      return data;
    }
  };

  const renderPreviewContent = () => {
    if (!data) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-4">
              No preview data found.
            </p>
            <p className="text-gray-500">
              {type === 'seller-info' 
                ? 'Go back to the Seller Info page, fill in your information, and click Preview.'
                : 'Go back to the Create page, generate content, choose a layout, and click Preview.'
              }
            </p>
          </div>
        </div>
      );
    }

    if (type === 'seller-info') {
      // Check if using new format (same as product page)
      if (data?.model && data.model.metadata && data.model.component && data.content) {
        console.log('Rendering seller info with new format (EnhancedJSONModelRenderer)');
        return (
          <EnhancedJSONModelRenderer
            model={data.model}
            content={data.content}
            images={data.images}
            isEditing={isEditing}
            onUpdate={handleTemplateUpdate}
            onComponentSelect={handleComponentSelect}
            selectedComponentId={selectedComponentId}
            styleVariables={styleVariables}
            debug={true}
          />
        );
      }
      // Fallback to old format (legacy)
      else if (data?.sellerData && data.templateType) {
        console.log('Rendering seller info with old format (SimpleSellerInfoRenderer)');
        return (
          <SimpleSellerInfoRenderer
            templateType={data.templateType}
            sellerData={data.sellerData}
            isEditing={isEditing}
            onUpdate={handleTemplateUpdate}
            onComponentSelect={handleComponentSelect}
            selectedComponentId={selectedComponentId}
            debug={true}
          />
        );
      } else {
        console.error('Invalid seller info data format:', data);
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-red-600 text-lg mb-4">Invalid seller info data format</p>
              <p className="text-gray-500">Please go back and try again.</p>
              <div className="mt-4 text-xs text-gray-400 font-mono">
                <p>Expected: model + content + images</p>
                <p>Or: sellerData + templateType</p>
                <p>Got: {JSON.stringify(Object.keys(data || {}))}</p>
              </div>
            </div>
          </div>
        );
      }
    } else {
      return (
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
      );
    }
  };

  const getTemplateInfoBar = () => {
    if (type === 'seller-info' && data) {
      // Handle both new and old formats
      let templateName = 'Template';
      if (data?.model?.metadata?.name) {
        templateName = data.model.metadata.name;
      } else if (data?.templateType) {
        templateName = data.templateType.charAt(0).toUpperCase() + data.templateType.slice(1) + ' Template';
      }

      return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {templateName}
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
                Enhanced JSON Renderer
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            v1.0
          </div>
        </div>
      );
    } else if (data?.model?.metadata) {
      return (
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
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={backUrl} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
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
              {helpText}
            </div>
          </div>
        </div>
      </div>

      {/* Template Info Bar */}
      {getTemplateInfoBar()}

      {/* Full Screen Preview */}
      <div className="w-full">
        {renderPreviewContent()}
      </div>

      {/* Edit Mode Helper */}
      {isEditing && (
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

      {/* Universal Editors */}
      <UniversalSourceCodeEditor
        isOpen={sourceCodeEditorOpen}
        onClose={() => setSourceCodeEditorOpen(false)}
        onSave={handleSourceCodeSave}
        onReset={handleSourceCodeReset}
        templateData={getTemplateData()}
        templateName={getTemplateName()}
        onTemplateUpdate={handleTemplateUpdate}
        type={type}
      />

      <UniversalAIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onTemplateUpdate={handleAITemplateUpdate}
        templateData={getTemplateData()}
        templateName={getTemplateName()}
        type={type}
      />
    </div>
  );
}