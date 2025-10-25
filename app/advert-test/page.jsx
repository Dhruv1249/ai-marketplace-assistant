"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateSelector from '@/components/advert/TemplateSelector';
import VisualEditor from '@/components/advert/VisualEditor';
import FormEditor from '@/components/advert/FormEditor';
import AdvertPreview from '@/components/advert/AdvertPreview';
import JSONRenderer from '@/components/advert/JSONRenderer';
import { PRESET_TEMPLATES } from '@/lib/advert/presetTemplates';
import { Copy, Download, Eye } from 'lucide-react';

export default function AdvertTestPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(PRESET_TEMPLATES[0]);
  const [templateData, setTemplateData] = useState(PRESET_TEMPLATES[0].data);
  const [editMode, setEditMode] = useState('visual');
  const [showJSON, setShowJSON] = useState(false);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateData(template.data);
  };

  const handleAIGenerate = (generatedTemplate) => {
    setSelectedTemplate(generatedTemplate);
    setTemplateData(generatedTemplate.data);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(templateData, null, 2));
    alert('Template JSON copied to clipboard!');
  };

  const downloadJSON = () => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(templateData, null, 2))
    );
    element.setAttribute('download', `template-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advert System Testing</h1>
            <p className="text-sm text-gray-600">
              {selectedTemplate?.name || 'Select a template'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJSON(!showJSON)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Eye size={16} />
              {showJSON ? 'Hide' : 'Show'} JSON
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
            >
              <Copy size={16} />
              Copy
            </button>
            <button
              onClick={downloadJSON}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="form">Form Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            <TemplateSelector
              onSelectTemplate={handleTemplateSelect}
              onAIGenerate={handleAIGenerate}
            />
          </TabsContent>

          {/* Visual Editor Tab */}
          <TabsContent value="visual" className="mt-6">
            <VisualEditor
              template={selectedTemplate}
              data={templateData}
              onChange={setTemplateData}
            />
          </TabsContent>

          {/* Form Editor Tab */}
          <TabsContent value="form" className="mt-6">
            <FormEditor
              template={selectedTemplate}
              data={templateData}
              onChange={setTemplateData}
            />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-6 space-y-6">
            <AdvertPreview data={templateData} />
            
            {/* Template Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Colors */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Colors</h3>
                <div className="space-y-3">
                  {templateData.colors &&
                    Object.entries(templateData.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: value }}
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 capitalize">{key}</p>
                          <p className="text-sm font-mono text-gray-900">{value}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Fonts */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Fonts</h3>
                <div className="space-y-3">
                  {templateData.fonts &&
                    Object.entries(templateData.fonts).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-600 capitalize mb-1">{key}</p>
                        <p className="text-sm font-medium text-gray-900">{value}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Sections</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {templateData.sections?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {templateData.sections?.reduce(
                        (sum, s) => sum + (s.items?.length || 0),
                        0
                      ) || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Layout Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {templateData.layout || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* JSON Display */}
        {showJSON && (
          <div className="mt-8 bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Template JSON</h3>
            </div>
            <pre className="p-4 overflow-auto max-h-96 bg-gray-900 text-gray-100 text-xs font-mono">
              {JSON.stringify(templateData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
