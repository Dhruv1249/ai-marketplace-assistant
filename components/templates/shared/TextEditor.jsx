"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette } from 'lucide-react';

export default function TextEditor({
  elementId,
  currentText = '',
  currentStyle = {},
  onTextChange,
  onStyleChange,
  onClose,
  isOpen = false
}) {
  const [text, setText] = useState(currentText);
  const [style, setStyle] = useState({
    fontSize: '16px',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    color: '#000000',
    ...currentStyle
  });

  const textareaRef = useRef(null);

  useEffect(() => {
    setText(currentText);
  }, [currentText]);

  useEffect(() => {
    setStyle(prev => ({ ...prev, ...currentStyle }));
  }, [currentStyle]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleStyleChange = (property, value) => {
    const newStyle = { ...style, [property]: value };
    setStyle(newStyle);
  };

  const toggleBold = () => {
    handleStyleChange('fontWeight', style.fontWeight === 'bold' ? 'normal' : 'bold');
  };

  const toggleItalic = () => {
    handleStyleChange('fontStyle', style.fontStyle === 'italic' ? 'normal' : 'italic');
  };

  const toggleUnderline = () => {
    handleStyleChange('textDecoration', style.textDecoration === 'underline' ? 'none' : 'underline');
  };

  const handleSave = () => {
    if (onTextChange) onTextChange(elementId, text);
    if (onStyleChange) onStyleChange(elementId, style);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    setText(currentText);
    setStyle({ ...currentStyle });
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Text: {elementId}</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          {/* Text Formatting */}
          <div className="flex gap-1">
            <button
              onClick={toggleBold}
              className={`p-2 rounded ${style.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={toggleItalic}
              className={`p-2 rounded ${style.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={toggleUnderline}
              className={`p-2 rounded ${style.textDecoration === 'underline' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Underline"
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex gap-1">
            <button
              onClick={() => handleStyleChange('textAlign', 'left')}
              className={`p-2 rounded ${style.textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => handleStyleChange('textAlign', 'center')}
              className={`p-2 rounded ${style.textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => handleStyleChange('textAlign', 'right')}
              className={`p-2 rounded ${style.textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-2">
            <Type size={16} />
            <select
              value={style.fontSize}
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="32px">32px</option>
              <option value="48px">48px</option>
            </select>
          </div>

          {/* Color */}
          <div className="flex items-center gap-2">
            <Palette size={16} />
            <input
              type="color"
              value={style.color}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Text Editor */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Enter your text here..."
          style={style}
        />

        {/* Preview */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preview:</label>
          <div
            className="p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[60px]"
            style={style}
          >
            {text || 'Preview will appear here...'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}