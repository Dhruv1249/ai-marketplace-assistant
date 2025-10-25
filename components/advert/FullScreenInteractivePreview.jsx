"use client";

import React, { useState, useRef } from 'react';
import { GripVertical, Trash2, Copy, Edit2, Palette, ArrowUp, ArrowDown } from 'lucide-react';
import SectionEditDialog from './SectionEditDialog';

export default function FullScreenInteractivePreview({ data, onChange }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState(() => {
    // Initialize positions for sections
    const initialPositions = {};
    data.sections.forEach((section, index) => {
      initialPositions[section.id] = {
        x: section._position?.x ?? 20,
        y: section._position?.y ?? (20 + index * 150),
        z: section._position?.z ?? (index + 1),
      };
    });
    return initialPositions;
  });
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e, sectionId) => {
    if (e.target.closest('button') || e.target.closest('input')) {
      return;
    }

    setDraggedId(sectionId);
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedId || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;

    setPositions((prev) => ({
      ...prev,
      [draggedId]: { x: Math.max(0, x), y: Math.max(0, y) },
    }));
  };

  const handleMouseUp = () => {
    if (draggedId) {
      // Save positions to JSON when drag ends
      const pos = positions[draggedId];
      const newSections = data.sections.map((section) =>
        section.id === draggedId
          ? { ...section, _position: pos }
          : section
      );
      onChange({
        ...data,
        sections: newSections,
      });
    }
    setDraggedId(null);
  };

  const deleteSection = (sectionId) => {
    const newSections = data.sections.filter((s) => s.id !== sectionId);
    onChange({
      ...data,
      sections: newSections,
    });
    setSelectedSectionId(null);
    setPositions((prev) => {
      const newPos = { ...prev };
      delete newPos[sectionId];
      return newPos;
    });
  };

  const duplicateSection = (sectionId) => {
    const section = data.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newSection = {
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
    };

    onChange({
      ...data,
      sections: [...data.sections, newSection],
    });

    const currentPos = positions[sectionId] || { x: 0, y: 0 };
    setPositions((prev) => ({
      ...prev,
      [newSection.id]: { x: currentPos.x + 20, y: currentPos.y + 20 },
    }));
  };

  const startEdit = (section) => {
    setEditingSection(section);
    setShowEditDialog(true);
  };

  const handleSaveEdit = (updatedSection) => {
    const newSections = data.sections.map((section) =>
      section.id === updatedSection.id ? updatedSection : section
    );
    onChange({
      ...data,
      sections: newSections,
    });
    setShowEditDialog(false);
    setEditingSection(null);
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

  return (
    <>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-full bg-white overflow-hidden"
        style={{
          backgroundColor: data.colors?.background || '#ffffff',
          cursor: draggedId ? 'grabbing' : 'default',
        }}
      >
        <style>{`
          .interactive-section {
            font-family: ${data.fonts?.body || 'Inter'}, sans-serif;
            color: ${data.colors?.text || '#1f2937'};
          }
          .interactive-section h1, .interactive-section h2, .interactive-section h3 {
            font-family: ${data.fonts?.heading || 'Inter'}, sans-serif;
          }
          ${draggedId ? `
            * {
              user-select: none !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
            }
          ` : ''}
        `}</style>

        {data.sections.map((section) => {
          const pos = positions[section.id] || { x: 0, y: 0 };
          const isSelected = selectedSectionId === section.id;
          const isDragging = draggedId === section.id;

          return (
            <div
              key={section.id}
              onMouseDown={(e) => handleMouseDown(e, section.id)}
              onClick={() => setSelectedSectionId(section.id)}
              className={`absolute group cursor-grab active:cursor-grabbing transition-all ${
                isDragging ? 'opacity-75 z-50' : 'z-10'
              } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                backgroundColor: section.backgroundColor || data.colors?.background || '#ffffff',
                color: section.textColor || data.colors?.text || '#1f2937',
                minWidth: '200px',
                minHeight: '100px',
              }}
            >
              {/* Drag Handle */}
              <div className="absolute -top-8 left-0 right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">
                  {section.title || section.type}
                </span>
              </div>

              {/* Section Content */}
              <div className="interactive-section p-4 h-full">
                {section.title && (
                  <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                )}
                {section.subtitle && (
                  <p className="text-lg mb-2 opacity-80">{section.subtitle}</p>
                )}
                {section.content && (
                  <p className="text-sm leading-relaxed">{section.content}</p>
                )}
                {section.items && section.items.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        {item.title && <p className="font-semibold">{item.title}</p>}
                        {item.description && <p className="opacity-75">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {section.text && (
                  <button
                    style={{
                      backgroundColor: section.backgroundColor,
                      color: section.textColor,
                    }}
                    className="px-4 py-2 rounded font-semibold hover:opacity-90 transition mt-3"
                  >
                    {section.text}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(section);
                  }}
                  className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSectionId(section.id);
                  }}
                  className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  title="Colors"
                >
                  <Palette size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateSection(section.id);
                  }}
                  className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(section.id);
                  }}
                  className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Color Picker Panel */}
              {isSelected && (
                <div className="absolute -bottom-16 left-0 right-0 flex gap-2 bg-white p-2 rounded shadow-lg border">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-medium text-gray-700">BG:</label>
                    <input
                      type="color"
                      value={section.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        updateSectionColor(section.id, 'backgroundColor', e.target.value)
                      }
                      className="w-6 h-6 rounded cursor-pointer border"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-medium text-gray-700">Text:</label>
                    <input
                      type="color"
                      value={section.textColor || '#000000'}
                      onChange={(e) =>
                        updateSectionColor(section.id, 'textColor', e.target.value)
                      }
                      className="w-6 h-6 rounded cursor-pointer border"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {data.sections.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p>No sections yet. Add components from the library.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingSection && (
        <SectionEditDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          section={editingSection}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
