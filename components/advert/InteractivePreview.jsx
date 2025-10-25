"use client";

import React, { useState, useRef } from 'react';
import { GripVertical, Edit2, Trash2, Copy, Plus } from 'lucide-react';

export default function InteractivePreview({ data, onChange }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);

  const handleDragStart = (e, sectionId) => {
    setDraggedId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, sectionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(sectionId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    setDragOverId(null);

    if (draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = data.sections.findIndex((s) => s.id === draggedId);
    const targetIndex = data.sections.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newSections = [...data.sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    onChange({
      ...data,
      sections: newSections,
    });
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const startEdit = (sectionId, field, value) => {
    setEditingId(sectionId);
    setEditingField(field);
    setEditValue(value || '');
  };

  const saveEdit = (sectionId) => {
    const newSections = data.sections.map((section) =>
      section.id === sectionId
        ? { ...section, [editingField]: editValue }
        : section
    );
    onChange({
      ...data,
      sections: newSections,
    });
    setEditingId(null);
    setEditingField(null);
  };

  const updateSectionColor = (sectionId, colorType, color) => {
    const newSections = data.sections.map((section) =>
      section.id === sectionId
        ? { ...section, [colorType]: color }
        : section
    );
    onChange({
      ...data,
      sections: newSections,
    });
  };

  const deleteSection = (sectionId) => {
    const newSections = data.sections.filter((s) => s.id !== sectionId);
    onChange({
      ...data,
      sections: newSections,
    });
    setSelectedSectionId(null);
  };

  const duplicateSection = (sectionId) => {
    const section = data.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newSection = {
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
    };

    const sectionIndex = data.sections.findIndex((s) => s.id === sectionId);
    const newSections = [...data.sections];
    newSections.splice(sectionIndex + 1, 0, newSection);

    onChange({
      ...data,
      sections: newSections,
    });
  };

  const updateItemField = (sectionId, itemIndex, field, value) => {
    const newSections = data.sections.map((section) => {
      if (section.id === sectionId && section.items) {
        return {
          ...section,
          items: section.items.map((item, idx) =>
            idx === itemIndex ? { ...item, [field]: value } : item
          ),
        };
      }
      return section;
    });
    onChange({
      ...data,
      sections: newSections,
    });
  };

  return (
    <div
      className="rounded-lg border shadow-sm overflow-hidden"
      style={{ backgroundColor: data.colors?.background || '#ffffff' }}
    >
      <style>{`
        .interactive-preview {
          font-family: ${data.fonts?.body || 'Inter'}, sans-serif;
          color: ${data.colors?.text || '#1f2937'};
        }
        .interactive-preview h1, .interactive-preview h2, .interactive-preview h3 {
          font-family: ${data.fonts?.heading || 'Inter'}, sans-serif;
        }
        .section-dragging {
          opacity: 0.5;
        }
        .section-drag-over {
          border-t-4 border-blue-500;
        }
      `}</style>

      <div className="interactive-preview space-y-0">
        {data.sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragEnd={handleDragEnd}
            onClick={() => setSelectedSectionId(section.id)}
            className={`relative group cursor-move transition-all ${
              draggedId === section.id ? 'section-dragging' : ''
            } ${dragOverId === section.id ? 'section-drag-over' : ''} ${
              selectedSectionId === section.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              backgroundColor: section.backgroundColor || data.colors?.background || '#ffffff',
              color: section.textColor || data.colors?.text || '#1f2937',
            }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-2 p-3 bg-gray-100 bg-opacity-50 border-b opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {section.title || section.type}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateSection(section.id);
                  }}
                  className="p-1.5 hover:bg-blue-100 rounded transition"
                  title="Duplicate"
                >
                  <Copy size={14} className="text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(section.id);
                  }}
                  className="p-1.5 hover:bg-red-100 rounded transition"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-red-600" />
                </button>
              </div>
            </div>

            {/* Section Content */}
            <div className="p-6 space-y-4">
              {/* Title */}
              {section.title !== undefined && (
                <div
                  className="group/title cursor-text"
                  onClick={() => startEdit(section.id, 'title', section.title)}
                >
                  {editingId === section.id && editingField === 'title' ? (
                    <input
                      autoFocus
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(section.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full px-2 py-1 border border-blue-500 rounded bg-white text-gray-900 font-semibold text-2xl"
                    />
                  ) : (
                    <h2 className="text-2xl font-semibold text-gray-900 group-hover/title:bg-blue-50 p-2 rounded transition">
                      {section.title}
                      <Edit2 size={14} className="inline ml-2 opacity-0 group-hover/title:opacity-100" />
                    </h2>
                  )}
                </div>
              )}

              {/* Subtitle */}
              {section.subtitle !== undefined && (
                <div
                  className="group/subtitle cursor-text"
                  onClick={() => startEdit(section.id, 'subtitle', section.subtitle)}
                >
                  {editingId === section.id && editingField === 'subtitle' ? (
                    <input
                      autoFocus
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(section.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full px-2 py-1 border border-blue-500 rounded bg-white text-gray-600 text-lg"
                    />
                  ) : (
                    <p className="text-lg text-gray-600 group-hover/subtitle:bg-blue-50 p-2 rounded transition">
                      {section.subtitle}
                      <Edit2 size={14} className="inline ml-2 opacity-0 group-hover/subtitle:opacity-100" />
                    </p>
                  )}
                </div>
              )}

              {/* Content */}
              {section.content !== undefined && (
                <div
                  className="group/content cursor-text"
                  onClick={() => startEdit(section.id, 'content', section.content)}
                >
                  {editingId === section.id && editingField === 'content' ? (
                    <textarea
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full px-2 py-1 border border-blue-500 rounded bg-white text-gray-700 h-24 resize-none"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed group-hover/content:bg-blue-50 p-2 rounded transition">
                      {section.content}
                      <Edit2 size={14} className="inline ml-2 opacity-0 group-hover/content:opacity-100" />
                    </p>
                  )}
                </div>
              )}

              {/* Items */}
              {section.items && section.items.length > 0 && (
                <div className="space-y-3 mt-4">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="p-3 bg-white bg-opacity-50 rounded border border-gray-200 group/item"
                    >
                      {item.title && (
                        <div
                          className="cursor-text"
                          onClick={() =>
                            startEdit(section.id, `item-${itemIndex}-title`, item.title)
                          }
                        >
                          {editingId === section.id &&
                          editingField === `item-${itemIndex}-title` ? (
                            <input
                              autoFocus
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                updateItemField(
                                  section.id,
                                  itemIndex,
                                  'title',
                                  editValue
                                );
                                setEditingId(null);
                              }}
                              className="w-full px-2 py-1 border border-blue-500 rounded bg-white font-semibold text-sm"
                            />
                          ) : (
                            <p className="font-semibold text-sm group-hover/item:bg-blue-50 p-1 rounded">
                              {item.title}
                              <Edit2 size={12} className="inline ml-1 opacity-0 group-hover/item:opacity-100" />
                            </p>
                          )}
                        </div>
                      )}
                      {item.description && (
                        <div
                          className="cursor-text mt-1"
                          onClick={() =>
                            startEdit(
                              section.id,
                              `item-${itemIndex}-description`,
                              item.description
                            )
                          }
                        >
                          {editingId === section.id &&
                          editingField === `item-${itemIndex}-description` ? (
                            <textarea
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                updateItemField(
                                  section.id,
                                  itemIndex,
                                  'description',
                                  editValue
                                );
                                setEditingId(null);
                              }}
                              className="w-full px-2 py-1 border border-blue-500 rounded bg-white text-xs h-16 resize-none"
                            />
                          ) : (
                            <p className="text-xs text-gray-600 group-hover/item:bg-blue-50 p-1 rounded">
                              {item.description}
                              <Edit2 size={12} className="inline ml-1 opacity-0 group-hover/item:opacity-100" />
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              {section.text !== undefined && (
                <div
                  className="group/cta cursor-text inline-block"
                  onClick={() => startEdit(section.id, 'text', section.text)}
                >
                  {editingId === section.id && editingField === 'text' ? (
                    <input
                      autoFocus
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(section.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="px-4 py-2 border border-blue-500 rounded font-semibold"
                      style={{
                        backgroundColor: section.backgroundColor,
                        color: section.textColor,
                      }}
                    />
                  ) : (
                    <button
                      style={{
                        backgroundColor: section.backgroundColor,
                        color: section.textColor,
                      }}
                      className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition group-hover/cta:ring-2 group-hover/cta:ring-blue-500"
                    >
                      {section.text}
                      <Edit2 size={14} className="inline ml-2 opacity-0 group-hover/cta:opacity-100" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Color Picker Panel */}
            {selectedSectionId === section.id && (
              <div className="p-4 border-t bg-gray-50 flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700">Background:</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={section.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        updateSectionColor(section.id, 'backgroundColor', e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700">Text:</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={section.textColor || '#000000'}
                      onChange={(e) =>
                        updateSectionColor(section.id, 'textColor', e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
