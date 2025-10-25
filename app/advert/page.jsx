"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateSelector from '@/components/advert/TemplateSelector';
import VisualEditor from '@/components/advert/VisualEditor';
import FormEditor from '@/components/advert/FormEditor';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdvertPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [editMode, setEditMode] = useState('visual'); // 'visual' or 'form'

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateData(template.data);
    setActiveTab('editor');
  };

  const handleAIGenerate = (generatedTemplate) => {
    setSelectedTemplate(generatedTemplate);
    setTemplateData(generatedTemplate.data);
    setActiveTab('editor');
  };

  const handleSave = () => {
    console.log('Saving template:', templateData);
    alert('Template saved successfully!');
  };

  const handlePreview = () => {
    if (!templateData) {
      alert('No template data to preview');
      return;
    }

    try {
      localStorage.setItem('advertPreviewData', JSON.stringify(templateData));
      window.open('/advert-preview', '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening preview:', error);
      alert('Failed to open preview');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedTemplate ? 'Edit Advertisement' : 'Create Advertisement'}
              </h1>
              <p className="text-sm text-gray-500">
                {selectedTemplate?.name || 'Choose a template to get started'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedTemplate && (
              <>
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  <Save size={16} />
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="editor" disabled={!selectedTemplate}>
              Editor
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <TemplateSelector
              onSelectTemplate={handleTemplateSelect}
              onAIGenerate={handleAIGenerate}
            />
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            {selectedTemplate && templateData && (
              <div className="space-y-4">
                {/* Edit Mode Selector */}
                <div className="flex gap-2 bg-white p-4 rounded-lg border">
                  <button
                    onClick={() => setEditMode('visual')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      editMode === 'visual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Visual Editor
                  </button>
                  <button
                    onClick={() => setEditMode('form')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      editMode === 'form'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Form Editor
                  </button>
                </div>

                {/* Editor Content */}
                {editMode === 'visual' ? (
                  <VisualEditor
                    template={selectedTemplate}
                    data={templateData}
                    onChange={setTemplateData}
                  />
                ) : (
                  <FormEditor
                    template={selectedTemplate}
                    data={templateData}
                    onChange={setTemplateData}
                  />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
