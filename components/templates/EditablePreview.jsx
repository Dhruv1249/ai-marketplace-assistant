"use client";

import React from "react";
import GalleryFocusedTemplate from "./editable/GalleryFocusedTemplate";
import MinimalTemplate from "./editable/MinimalTemplate";
import ModernTemplate from "./editable/ModernTemplate";
import ClassicTemplate from "./editable/ClassicTemplate";

/* ==========================
   Main editable preview component
   ========================== */
export default function EditableTemplatePreview({
  layoutType = "gallery-focused",
  content,
  images,
  isEditing = false,
  onContentChange,
}) {
  const templateProps = {
    content,
    images,
    isEditing,
    onContentChange,
  };

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
}