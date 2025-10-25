"use client";

import React, { useState } from 'react';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import SectionRenderer from './SectionRenderer';

export default function DragDropCanvas({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorderSections,
  onDeleteSection,
  onDuplicateSection,
}) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

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

    const draggedIndex = sections.findIndex((s) => s.id === draggedId);
    const targetIndex = sections.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    onReorderSections(newSections);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 min-h-96">
      {sections.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No sections yet. Add components from the library.</p>
        </div>
      ) : (
        sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelectSection(section.id)}
            className={`relative group cursor-move transition-all ${
              draggedId === section.id ? 'opacity-50' : ''
            } ${
              dragOverId === section.id ? 'border-t-4 border-blue-500' : ''
            }`}
          >
            <div
              className={`rounded-lg border-2 overflow-hidden transition-all ${
                selectedSectionId === section.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 p-3 bg-gray-100 border-b">
                <GripVertical size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {section.title || section.type}
                  </p>
                  <p className="text-xs text-gray-500">{section.type}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSection(section.id);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded transition"
                    title="Duplicate"
                  >
                    <Copy size={14} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(section.id);
                    }}
                    className="p-1.5 hover:bg-red-100 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>
              </div>

              {/* Section Preview */}
              <div
                style={{
                  backgroundColor: section.backgroundColor || '#ffffff',
                  color: section.textColor || '#000000',
                }}
                className="p-4 min-h-24"
              >
                <SectionRenderer section={section} isPreview={true} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
