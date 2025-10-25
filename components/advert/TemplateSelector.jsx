"use client";

import React, { useState } from 'react';
import { Sparkles, Zap, Layout, Wand2, Palette, Target } from 'lucide-react';
import AITemplateGenerator from './AITemplateGenerator';
import { PRESET_TEMPLATES } from '@/lib/advert/presetTemplates';

const ICON_MAP = {
  'Layout': Layout,
  'Zap': Zap,
  'Palette': Palette,
  'Target': Target,
};

const TemplateCard = ({ template, onClick, isSelected }) => {
  const Icon = ICON_MAP[template.icon];

  if (!Icon) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-lg border-2 transition-all p-6 hover:shadow-lg ${
        isSelected
          ? 'border-blue-600 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
          <Zap size={16} />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Icon size={24} className="text-gray-700" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
          <div className="flex gap-2 flex-wrap">
            {template.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

export default function TemplateSelector({ onSelectTemplate, onAIGenerate }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const handleSelectTemplate = (template) => {
    setSelectedId(template.id);
    onSelectTemplate(template);
  };

  return (
    <div className="space-y-8">
      {/* Preset Templates */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Template</h2>
          <p className="text-gray-600">
            Select from our professionally designed templates or create a custom one with AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedId === template.id}
              onClick={() => handleSelectTemplate(template)}
            />
          ))}
        </div>
      </div>

      {/* AI Generator */}
      <div className="border-t pt-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={24} className="text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Template</h2>
          </div>
          <p className="text-gray-600">
            Describe your advertisement and let AI create a custom template for you
          </p>
        </div>

        {!showAIGenerator ? (
          <button
            onClick={() => setShowAIGenerator(true)}
            className="w-full p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition flex items-center justify-center gap-3 text-purple-700 font-medium"
          >
            <Wand2 size={20} />
            Generate Template with AI
          </button>
        ) : (
          <AITemplateGenerator
            onGenerate={onAIGenerate}
            onCancel={() => setShowAIGenerator(false)}
          />
        )}
      </div>
    </div>
  );
}
