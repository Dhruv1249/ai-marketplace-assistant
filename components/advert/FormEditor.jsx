"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FormEditor({ template, data, onChange }) {
  const [expandedSections, setExpandedSections] = useState(
    data.sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  );

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSectionUpdate = (sectionId, updates) => {
    const newData = {
      ...data,
      sections: data.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    };
    onChange(newData);
  };

  const handleItemUpdate = (sectionId, itemIndex, updates) => {
    const newData = {
      ...data,
      sections: data.sections.map((section) => {
        if (section.id === sectionId && section.items) {
          return {
            ...section,
            items: section.items.map((item, idx) =>
              idx === itemIndex ? { ...item, ...updates } : item
            ),
          };
        }
        return section;
      }),
    };
    onChange(newData);
  };

  const handleAddItem = (sectionId) => {
    const newData = {
      ...data,
      sections: data.sections.map((section) => {
        if (section.id === sectionId) {
          const newItem = {};
          if (section.type === 'features') {
            newItem.title = 'New Feature';
            newItem.description = 'Feature description';
          } else if (section.type === 'testimonials') {
            newItem.text = 'Testimonial text';
            newItem.author = 'Author Name';
          } else if (section.type === 'stats') {
            newItem.number = '0';
            newItem.label = 'Label';
          } else if (section.type === 'highlights') {
            newItem.icon = '⭐';
            newItem.title = 'Highlight';
            newItem.description = 'Description';
          } else if (section.type === 'gallery') {
            newItem.image = null;
            newItem.caption = 'Image caption';
          }
          return {
            ...section,
            items: [...(section.items || []), newItem],
          };
        }
        return section;
      }),
    };
    onChange(newData);
  };

  const handleRemoveItem = (sectionId, itemIndex) => {
    const newData = {
      ...data,
      sections: data.sections.map((section) => {
        if (section.id === sectionId && section.items) {
          return {
            ...section,
            items: section.items.filter((_, idx) => idx !== itemIndex),
          };
        }
        return section;
      }),
    };
    onChange(newData);
  };

  const renderItemFields = (section, item, itemIndex) => {
    switch (section.type) {
      case 'features':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={item.title || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, { title: e.target.value })
              }
              placeholder="Feature title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              value={item.description || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, {
                  description: e.target.value,
                })
              }
              placeholder="Feature description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
            />
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-3">
            <textarea
              value={item.text || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, { text: e.target.value })
              }
              placeholder="Testimonial text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
            />
            <input
              type="text"
              value={item.author || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, { author: e.target.value })
              }
              placeholder="Author name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={item.number || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, { number: e.target.value })
              }
              placeholder="Number (e.g., 10K+)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={item.label || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, { label: e.target.value })
              }
              placeholder="Label"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'highlights':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={item.icon || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, { icon: e.target.value })
              }
              placeholder="Icon (emoji)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength="2"
            />
            <input
              type="text"
              value={item.title || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, { title: e.target.value })
              }
              placeholder="Title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              value={item.description || ''}
              onChange={(e) =>
                handleItemUpdate(section.id, itemIndex, {
                  description: e.target.value,
                })
              }
              placeholder="Description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {data.sections.map((section) => (
        <div key={section.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">
                {section.title || section.type}
              </h3>
              <p className="text-sm text-gray-600">{section.type}</p>
            </div>
            {expandedSections[section.id] ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>

          {/* Section Content */}
          {expandedSections[section.id] && (
            <div className="border-t p-4 space-y-4 bg-gray-50">
              {/* Basic Fields */}
              {section.title !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      handleSectionUpdate(section.id, { title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {section.subtitle !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={section.subtitle || ''}
                    onChange={(e) =>
                      handleSectionUpdate(section.id, { subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {section.content !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      handleSectionUpdate(section.id, { content: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                  />
                </div>
              )}

              {section.text !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={section.text}
                    onChange={(e) =>
                      handleSectionUpdate(section.id, { text: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Items */}
              {section.items && section.items.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 text-sm">Items</h4>
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="p-3 bg-white border border-gray-200 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          Item {itemIndex + 1}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(section.id, itemIndex)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      {renderItemFields(section, item, itemIndex)}
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddItem(section.id)}
                    className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    + Add Item
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
