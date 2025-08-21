"use client";

import React from "react";
import ProfessionalEditableTemplate from "./editable/ProfessionalEditableTemplate";
import CreativeEditableTemplate from "./editable/CreativeEditableTemplate";
import ExecutiveEditableTemplate from "./editable/ExecutiveEditableTemplate";
import PersonalEditableTemplate from "./editable/PersonalEditableTemplate";

/* ==========================
   Main editable seller info preview component
   ========================== */
export default function EditableSellerInfoPreview({
  templateType = "professional",
  sellerData,
  isEditing = false,
  onContentChange,
}) {
  const templateProps = {
    sellerData,
    isEditing,
    onContentChange,
  };

  switch (templateType) {
    case "professional":
      return <ProfessionalEditableTemplate {...templateProps} />;
    case "creative":
      return <CreativeEditableTemplate {...templateProps} />;
    case "executive":
      return <ExecutiveEditableTemplate {...templateProps} />;
    case "personal":
      return <PersonalEditableTemplate {...templateProps} />;
    default:
      return <ProfessionalEditableTemplate {...templateProps} />;
  }
}