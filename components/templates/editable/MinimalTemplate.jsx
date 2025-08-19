"use client";

import React, { useState } from "react";
import EditableElement from "../shared/EditableElement";
import TextEditor from "../shared/TextEditor";

/* =====
   Hero
   ===== */
function Hero({
  title,
  description,
  isEditing,
  onEdit,
  onMove,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
}) {
  return (
    <div className="text-center mb-12">
      <EditableElement
        elementId="hero-title"
        type="text"
        isEditing={isEditing}
        onEdit={onEdit}
        onMove={onMove}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        currentText={elementTexts?.["hero-title"] || title || "Product Title"}
        currentStyle={elementStyles?.["hero-title"] || {}}
        className="mb-4"
      >
        <h1 className="text-4xl font-light tracking-wide">{title || "Product Title"}</h1>
      </EditableElement>

      <EditableElement
        elementId="hero-description"
        type="text"
        isEditing={isEditing}
        onEdit={onEdit}
        onMove={onMove}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        currentText={
          elementTexts?.["hero-description"] ||
          description ||
          "A clean, minimal product description."
        }
        currentStyle={elementStyles?.["hero-description"] || {}}
      >
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {description || "A clean, minimal product description."}
        </p>
      </EditableElement>
    </div>
  );
}

/* ========
   Gallery
   ======== */
function Gallery({ images = [], isEditing, onMove, selectedElement, setSelectedElement }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasImages = images && images.length > 0;

  if (!hasImages) {
    return (
      <EditableElement
        elementId="gallery"
        isEditing={isEditing}
        onMove={onMove}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        className="mb-16"
      >
        <div className="aspect-[4/3] bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center">
          <span className="text-gray-400 text-lg">Product Image</span>
        </div>
      </EditableElement>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <EditableElement
      elementId="gallery"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-16"
    >
      <div className="space-y-4">
        <div className="aspect-[4/3] bg-gray-100 rounded-sm overflow-hidden relative group">
          <img
            src={selectedImage}
            alt={`Product image ${selectedImageIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center space-x-2">
            {images.map((src, i) => (
              <button
                key={i}
                className={`w-16 h-16 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
                  selectedImageIndex === i
                    ? "border-gray-800"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setSelectedImageIndex(i)}
              >
                <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </EditableElement>
  );
}

/* =========
   Features
   ========= */
function Features({
  features = [],
  featureExplanations = {},
  isEditing,
  onEdit,
  onMove,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
}) {
  const items =
    features && features.length ? features : ["Premium Quality", "Sustainable Materials", "Timeless Design"];

  return (
    <EditableElement
      elementId="features-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((f, i) => (
          <div key={i} className="text-center">
            <EditableElement
              elementId={`feature-${i}-title`}
              type="text"
              isEditing={isEditing}
              onEdit={onEdit}
              onMove={onMove}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              currentText={elementTexts?.[`feature-${i}-title`] || f}
              currentStyle={elementStyles?.[`feature-${i}-title`] || {}}
              className="mb-2"
            >
              <h3 className="text-lg font-medium">{f}</h3>
            </EditableElement>

            {featureExplanations[f] && (
              <EditableElement
                elementId={`feature-${i}-explanation`}
                type="text"
                isEditing={isEditing}
                onEdit={onEdit}
                onMove={onMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={
                  elementTexts?.[`feature-${i}-explanation`] || featureExplanations[f]
                }
                currentStyle={elementStyles?.[`feature-${i}-explanation`] || {}}
              >
                <p className="text-sm text-gray-600 leading-relaxed">{featureExplanations[f]}</p>
              </EditableElement>
            )}
          </div>
        ))}
      </div>
    </EditableElement>
  );
}

/* =====
   Specs
   ===== */
function Specs({
  specifications = {},
  isEditing,
  onEdit,
  onMove,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
}) {
  const entries = Object.entries(specifications);
  const rows = entries.length ? entries : [["Material", "Premium Cotton"], ["Origin", "Made in Italy"], ["Care", "Machine Washable"]];

  return (
    <EditableElement
      elementId="specs-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-16"
    >
      <EditableElement
        elementId="specs-title"
        type="text"
        isEditing={isEditing}
        onEdit={onEdit}
        onMove={onMove}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        currentText={elementTexts?.["specs-title"] || "Details"}
        currentStyle={elementStyles?.["specs-title"] || {}}
        className="mb-6 text-center"
      >
        <h2 className="text-2xl font-light">Details</h2>
      </EditableElement>

      <div className="max-w-md mx-auto">
        <div className="space-y-3">
          {rows.slice(0, 6).map(([k, v], i) => (
            <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
              <EditableElement
                elementId={`spec-${i}-key`}
                type="text"
                isEditing={isEditing}
                onEdit={onEdit}
                onMove={onMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.[`spec-${i}-key`] || k}
                currentStyle={elementStyles?.[`spec-${i}-key`] || {}}
              >
                <span className="text-gray-600">{k}</span>
              </EditableElement>
              <EditableElement
                elementId={`spec-${i}-value`}
                type="text"
                isEditing={isEditing}
                onEdit={onEdit}
                onMove={onMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.[`spec-${i}-value`] || v}
                currentStyle={elementStyles?.[`spec-${i}-value`] || {}}
              >
                <span className="font-medium">{v}</span>
              </EditableElement>
            </div>
          ))}
        </div>
      </div>
    </EditableElement>
  );
}

/* ===
   CTA
   === */
function CTA({
  isEditing,
  onEdit,
  onMove,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
}) {
  return (
    <EditableElement
      elementId="cta-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="text-center"
    >
      <EditableElement
        elementId="cta-button"
        type="text"
        isEditing={isEditing}
        onEdit={onEdit}
        onMove={onMove}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        currentText={elementTexts?.["cta-button"] || "Add to Cart"}
        currentStyle={elementStyles?.["cta-button"] || {}}
      >
        <button className="px-8 py-3 bg-black text-white font-medium tracking-wide hover:bg-gray-800 transition-colors duration-200">
          Add to Cart
        </button>
      </EditableElement>
    </EditableElement>
  );
}

/* ==========================
   Minimal Template
   ========================== */
export default function MinimalTemplate({
  content,
  images,
  isEditing = false,
  onContentChange,
}) {
  const [editingElement, setEditingElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [elementStyles, setElementStyles] = useState({});
  const [elementTexts, setElementTexts] = useState({});

  const handleContainerClick = (e) => {
    if (isEditing && e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const handleEdit = (elementId) => {
    setEditingElement(elementId);
    setTextEditorOpen(true);
  };

  const handleMove = (elementId, position) => {
    // If you want to persist positions externally, you can do it here.
    // console.log("Move:", elementId, position);
  };

  const handleResize = (elementId, size) => {
    // If you want to persist sizes externally, you can do it here.
    // console.log("Resize:", elementId, size);
  };

  const handleTextSave = (newText, newStyle) => {
    setElementStyles((prev) => ({
      ...prev,
      [editingElement]: newStyle,
    }));

    setElementTexts((prev) => ({
      ...prev,
      [editingElement]: newText,
    }));

    onContentChange?.(editingElement, newText, newStyle);

    setEditingElement(null);
  };

  const getCurrentText = (elementId) => {
    if (elementTexts[elementId]) return elementTexts[elementId];

    switch (elementId) {
      case "hero-title":
        return content?.title || "Product Title";
      case "hero-description":
        return content?.description || "A clean, minimal product description.";
      case "specs-title":
        return "Details";
      case "cta-button":
        return "Add to Cart";
      default:
        if (elementId?.startsWith("feature-") && elementId?.includes("-title")) {
          const index = parseInt(elementId.split("-")[1]);
          const features =
            content?.features || ["Premium Quality", "Sustainable Materials", "Timeless Design"];
          return features[index] || `Feature ${index + 1}`;
        }
        if (
          elementId?.startsWith("feature-") &&
          elementId?.includes("-explanation")
        ) {
          const index = parseInt(elementId.split("-")[1]);
          const features =
            content?.features || ["Premium Quality", "Sustainable Materials", "Timeless Design"];
          const featureName = features[index];
          return content?.featureExplanations?.[featureName] || "Feature explanation";
        }
        if (elementId?.startsWith("spec-") && elementId?.includes("-key")) {
          const index = parseInt(elementId.split("-")[1]);
          const entries = Object.entries(content?.specifications || {});
          const defaultSpecs = [["Material", "Premium Cotton"], ["Origin", "Made in Italy"], ["Care", "Machine Washable"]];
          return entries[index]?.[0] || defaultSpecs[index]?.[0] || "Detail";
        }
        if (elementId?.startsWith("spec-") && elementId?.includes("-value")) {
          const index = parseInt(elementId.split("-")[1]);
          const entries = Object.entries(content?.specifications || {});
          const defaultSpecs = [["Material", "Premium Cotton"], ["Origin", "Made in Italy"], ["Care", "Machine Washable"]];
          return entries[index]?.[1] || defaultSpecs[index]?.[1] || "Value";
        }
        return "Edit this text";
    }
  };

  const getCurrentStyle = (elementId) => elementStyles[elementId] || {};

  return (
    <div className="min-h-screen bg-white flex flex-col" onClick={handleContainerClick}>
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Hero
          title={content?.title}
          description={content?.description}
          isEditing={isEditing}
          onEdit={handleEdit}
          onMove={handleMove}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          elementStyles={elementStyles}
          elementTexts={elementTexts}
        />
        
        <Gallery
          images={images}
          isEditing={isEditing}
          onMove={handleMove}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
        />
        
        <Features
          features={content?.features}
          featureExplanations={content?.featureExplanations}
          isEditing={isEditing}
          onEdit={handleEdit}
          onMove={handleMove}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          elementStyles={elementStyles}
          elementTexts={elementTexts}
        />
        
        <Specs
          specifications={content?.specifications}
          isEditing={isEditing}
          onEdit={handleEdit}
          onMove={handleMove}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          elementStyles={elementStyles}
          elementTexts={elementTexts}
        />
        
        <CTA
          isEditing={isEditing}
          onEdit={handleEdit}
          onMove={handleMove}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          elementStyles={elementStyles}
          elementTexts={elementTexts}
        />
      </div>

      <TextEditor
        isOpen={textEditorOpen}
        onClose={() => setTextEditorOpen(false)}
        onSave={handleTextSave}
        initialText={getCurrentText(editingElement)}
        initialStyle={getCurrentStyle(editingElement)}
      />
    </div>
  );
}