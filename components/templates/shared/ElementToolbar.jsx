"use client";

import React from "react";
import { Type, Square, Link, Image, MousePointer } from "lucide-react";

/* =================
   Element insertion toolbar
   ================= */
function ElementToolbar({ isEditing, onAddElement, onSave }) {
  if (!isEditing) return null;

  const elements = [
    {
      type: "text",
      icon: Type,
      label: "Text",
      defaultContent: "New text element",
      defaultStyle: { fontSize: "16px", color: "#000000" }
    },
    {
      type: "button",
      icon: MousePointer,
      label: "Button",
      defaultContent: "Click me",
      defaultStyle: { 
        fontSize: "16px", 
        color: "#ffffff", 
        backgroundColor: "#3b82f6",
        padding: "12px 24px",
        borderRadius: "8px",
        textAlign: "center"
      }
    },
    {
      type: "link",
      icon: Link,
      label: "Link",
      defaultContent: "Click here",
      defaultStyle: { fontSize: "16px", color: "#3b82f6", textDecoration: "underline" },
      defaultProps: { href: "https://example.com" }
    },
    {
      type: "image",
      icon: Image,
      label: "Image",
      defaultContent: "Image",
      defaultStyle: { width: "200px", height: "150px" },
      defaultProps: { src: "https://via.placeholder.com/200x150" }
    },
    {
      type: "shape",
      icon: Square,
      label: "Shape",
      defaultContent: "",
      defaultStyle: { 
        width: "100px", 
        height: "100px", 
        backgroundColor: "#e5e7eb",
        borderRadius: "8px"
      }
    }
  ];

  return (
    <div className="fixed top-20 right-4 bg-white border rounded-lg shadow-lg p-4 z-40">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Elements</h3>
        
        {elements.map((element) => {
          const Icon = element.icon;
          return (
            <button
              key={element.type}
              onClick={() => onAddElement(element)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={`Add ${element.label}`}
            >
              <Icon size={16} />
              {element.label}
            </button>
          );
        })}

        <div className="border-t pt-2 mt-2">
          <button
            onClick={onSave}
            className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ElementToolbar;