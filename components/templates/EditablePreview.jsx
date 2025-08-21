"use client";

import React, { useState, useEffect } from "react";
import GalleryFocusedTemplate from "./editable/GalleryFocusedTemplate";
import MinimalTemplate from "./editable/MinimalTemplate";
import ModernTemplate from "./editable/ModernTemplate";
import ClassicTemplate from "./editable/ClassicTemplate";
import ElementToolbar from "./shared/ElementToolbar";
import { TemplateStorage } from "../../lib/templateStorage";

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
  const [templateEdits, setTemplateEdits] = useState(null);
  const templateId = `product_${layoutType}`;

  useEffect(() => {
    if (isEditing) {
      const edits = TemplateStorage.getTemplateEdits('product', templateId);
      setTemplateEdits(edits);
    }
  }, [isEditing, templateId]);

  const handleAddElement = (element) => {
    const elementId = TemplateStorage.addCustomElement('product', templateId, element);
    const updatedEdits = TemplateStorage.getTemplateEdits('product', templateId);
    setTemplateEdits(updatedEdits);
    onContentChange?.('element_added', elementId, element);
  };

  const handleSaveTemplate = () => {
    if (templateEdits) {
      TemplateStorage.saveTemplateEdits('product', templateId, templateEdits);
      alert('Template saved successfully!');
    }
  };

  const handleElementUpdate = (elementId, updates) => {
    TemplateStorage.updateElement('product', templateId, elementId, updates);
    const updatedEdits = TemplateStorage.getTemplateEdits('product', templateId);
    setTemplateEdits(updatedEdits);
    onContentChange?.(elementId, updates.text, updates.style, updates.props);
  };

  const handleElementDelete = (elementId) => {
    TemplateStorage.deleteElement('product', templateId, elementId);
    const updatedEdits = TemplateStorage.getTemplateEdits('product', templateId);
    setTemplateEdits(updatedEdits);
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
      {isEditing && (
        <ElementToolbar
          isEditing={isEditing}
          onAddElement={handleAddElement}
          onSave={handleSaveTemplate}
        />
      )}
      
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