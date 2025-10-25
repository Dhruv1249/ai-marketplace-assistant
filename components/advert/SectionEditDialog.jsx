"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export default function SectionEditDialog({ isOpen, onClose, section, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    text: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  });

  const [activeTab, setActiveTab] = useState('content');
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
  });

  const dialogRef = useRef(null);

  useEffect(() => {
    if (section && isOpen) {
      setFormData({
        title: section.title || '',
        subtitle: section.subtitle || '',
        content: section.content || '',
        text: section.text || '',
        backgroundColor: section.backgroundColor || '#ffffff',
        textColor: section.textColor || '#000000',
      });
    }
  }, [section, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!section) return;

    const updatedSection = {
      ...section,
      title: formData.title,
      subtitle: formData.subtitle,
      content: formData.content,
      text: formData.text,
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor,
    };

    onSave(updatedSection);
  };

  const handleClose = () => {
    setActiveTab('content');
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Section</h2>
            <p className="text-sm text-gray-500 mt-1">{section?.type}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['content', 'style'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'content' && (
            <div className="space-y-4">
              {section?.title !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Section title"
                  />
                </div>
              )}

              {section?.subtitle !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Section subtitle"
                  />
                </div>
              )}

              {section?.content !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                    placeholder="Section content"
                  />
                </div>
              )}

              {section?.text !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.text}
                    onChange={(e) => handleInputChange('text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Button text"
                  />
                </div>
              )}

              {section?.items && section.items.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This section has {section.items.length} items. Edit them in the form editor.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg border-2 border-gray-200">
                <p className="text-xs text-gray-600 mb-3 font-medium">PREVIEW</p>
                <div
                  style={{
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                  }}
                  className="p-4 rounded"
                >
                  {formData.title && <h3 className="font-semibold text-lg mb-2">{formData.title}</h3>}
                  {formData.content && <p className="text-sm">{formData.content}</p>}
                  {formData.text && (
                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded font-semibold">
                      {formData.text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
