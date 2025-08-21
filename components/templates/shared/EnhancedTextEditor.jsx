"use client";

import React, { useState, useEffect } from "react";

/* =================
   Enhanced text editor modal for different element types
   ================= */
function EnhancedTextEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  initialText = "", 
  initialStyle = {}, 
  initialProps = {},
  elementType = "text" // text, button, link, image, shape
}) {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialStyle.fontSize || "16px");
  const [fontWeight, setFontWeight] = useState(initialStyle.fontWeight || "normal");
  const [color, setColor] = useState(initialStyle.color || "#000000");
  const [backgroundColor, setBackgroundColor] = useState(initialStyle.backgroundColor || "transparent");
  const [textAlign, setTextAlign] = useState(initialStyle.textAlign || "left");
  const [borderRadius, setBorderRadius] = useState(initialStyle.borderRadius || "0px");
  const [padding, setPadding] = useState(initialStyle.padding || "8px");
  const [href, setHref] = useState(initialProps.href || "");
  const [src, setSrc] = useState(initialProps.src || "");

  useEffect(() => {
    setText(initialText);
    setFontSize(initialStyle.fontSize || "16px");
    setFontWeight(initialStyle.fontWeight || "normal");
    setColor(initialStyle.color || "#000000");
    setBackgroundColor(initialStyle.backgroundColor || "transparent");
    setTextAlign(initialStyle.textAlign || "left");
    setBorderRadius(initialStyle.borderRadius || "0px");
    setPadding(initialStyle.padding || "8px");
    setHref(initialProps.href || "");
    setSrc(initialProps.src || "");
  }, [initialText, initialStyle, initialProps]);

  const handleSave = () => {
    const style = {
      fontSize,
      fontWeight,
      color,
      backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor,
      textAlign,
      borderRadius: borderRadius === "0px" ? undefined : borderRadius,
      padding: padding === "8px" ? undefined : padding,
    };

    const props = {
      href: href || undefined,
      src: src || undefined,
    };

    onSave(text, style, props);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          Edit {elementType === "text" ? "Text" : elementType === "button" ? "Button" : elementType === "link" ? "Link" : elementType === "image" ? "Image" : "Element"}
        </h3>

        <div className="space-y-4">
          {/* Text Content */}
          {(elementType === "text" || elementType === "button" || elementType === "link") && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {elementType === "image" ? "Alt Text" : "Text Content"}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-2 border rounded-lg"
                rows={elementType === "text" ? 3 : 1}
              />
            </div>
          )}

          {/* Image Source */}
          {elementType === "image" && (
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {/* Link URL */}
          {(elementType === "button" || elementType === "link") && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {elementType === "button" ? "Button Link (optional)" : "Link URL"}
              </label>
              <input
                type="url"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="https://example.com"
              />
            </div>
          )}

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
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full p-1 border rounded-lg h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor === "transparent" ? "#ffffff" : backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 p-1 border rounded-lg h-10"
                  disabled={backgroundColor === "transparent"}
                />
                <button
                  onClick={() => setBackgroundColor(backgroundColor === "transparent" ? "#ffffff" : "transparent")}
                  className="px-2 py-1 text-xs border rounded"
                >
                  {backgroundColor === "transparent" ? "Add" : "Clear"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium mb-2">Border Radius</label>
              <select
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="0px">None</option>
                <option value="4px">Small</option>
                <option value="8px">Medium</option>
                <option value="12px">Large</option>
                <option value="50%">Round</option>
              </select>
            </div>
          </div>

          {(elementType === "button" || elementType === "shape") && (
            <div>
              <label className="block text-sm font-medium mb-2">Padding</label>
              <select
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="4px">Small</option>
                <option value="8px">Medium</option>
                <option value="12px">Large</option>
                <option value="16px">Extra Large</option>
              </select>
            </div>
          )}
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

export default EnhancedTextEditor;