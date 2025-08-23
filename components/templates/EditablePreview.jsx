"use client";

import React, { useState, useEffect } from "react";
import GalleryFocusedTemplate from "./editable/GalleryFocusedTemplate";
import MinimalTemplate from "./editable/MinimalTemplate";
import ModernTemplate from "./editable/ModernTemplate";
import ClassicTemplate from "./editable/ClassicTemplate";

/* ==========================
   Main editable template preview component
   ========================== */
export default function EditableTemplatePreview({
  layoutType = "gallery-focused",
  content,
  images,
  isEditing = false,
  onContentChange,
}) {
  const [templateEdits, setTemplateEdits] = useState({
    elementStyles: {},
    elementTexts: {},
    elementProps: {},
    deletedElements: [],
    version: 0
  });

  const handleElementUpdate = (elementId, updates) => {
    setTemplateEdits(prev => {
      const newEdits = { ...prev };
      
      // Update styles
      if (updates.style) {
        newEdits.elementStyles = {
          ...newEdits.elementStyles,
          [elementId]: { ...newEdits.elementStyles[elementId], ...updates.style }
        };
      }

      // Update text content
      if (updates.text !== undefined) {
        newEdits.elementTexts = {
          ...newEdits.elementTexts,
          [elementId]: updates.text
        };
      }

      // Update props
      if (updates.props) {
        newEdits.elementProps = {
          ...newEdits.elementProps,
          [elementId]: { ...newEdits.elementProps[elementId], ...updates.props }
        };
      }

      return newEdits;
    });
    
    onContentChange?.(elementId, updates.text, updates.style, updates.props);
  };

  const handleElementDelete = (elementId) => {
    setTemplateEdits(prev => ({
      ...prev,
      deletedElements: [...prev.deletedElements, elementId],
      elementStyles: Object.fromEntries(
        Object.entries(prev.elementStyles).filter(([key]) => key !== elementId)
      ),
      elementTexts: Object.fromEntries(
        Object.entries(prev.elementTexts).filter(([key]) => key !== elementId)
      ),
      elementProps: Object.fromEntries(
        Object.entries(prev.elementProps).filter(([key]) => key !== elementId)
      )
    }));
    
    onContentChange?.('element_deleted', elementId);
  };

  const templateProps = {
    content,
    images,
    isEditing,
    onContentChange: handleElementUpdate,
    onElementDelete: handleElementDelete,
    templateEdits,
  };

  return (
    <>
      {(() => {
        switch (layoutType) {
          case "gallery-focused":
            return <GalleryFocusedTemplate {...templateProps} />;
          case "minimal":
            return <MinimalTemplate {...templateProps} />;
          case "modern":
            return <ModernTemplate {...templateProps} />;
          case "classic":
            return <ClassicTemplate {...templateProps} />;
          default:
            return <GalleryFocusedTemplate {...templateProps} />;
        }
      })()}
    </>
  );
}