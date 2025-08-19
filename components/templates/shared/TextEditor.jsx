"use client";

import React, { useState, useEffect } from "react";

/* =================
   Text editor modal
   ================= */
export default function TextEditor({ isOpen, onClose, onSave, initialText = "", initialStyle = {} }) {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialStyle.fontSize || "16px");
  const [fontWeight, setFontWeight] = useState(initialStyle.fontWeight || "normal");
  const [color, setColor] = useState(initialStyle.color || "#000000");
  const [textAlign, setTextAlign] = useState(initialStyle.textAlign || "left");

  useEffect(() => {
    setText(initialText);
    setFontSize(initialStyle.fontSize || "16px");
    setFontWeight(initialStyle.fontWeight || "normal");
    setColor(initialStyle.color || "#000000");
    setTextAlign(initialStyle.textAlign || "left");
  }, [initialText, initialStyle]);

  const handleSave = () => {
    onSave(text, {
      fontSize,
      fontWeight,
      color,
      textAlign,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Edit Text</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Text Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full p-2 border rounded-lg"
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

            <div>
              <label className="block text-sm font-medium mb-2">Font Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="600">Semi Bold</option>
                <option value="300">Light</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full p-1 border rounded-lg h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Align</label>
              <select
                value={textAlign}
                onChange={(e) => setTextAlign(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}