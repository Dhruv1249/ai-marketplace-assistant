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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8">
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {title || "Product Title"}
        </h1>
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
          "Experience the future with our innovative product design."
        }
        currentStyle={elementStyles?.["hero-description"] || {}}
      >
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
          {description || "Experience the future with our innovative product design."}
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
        className="mb-8"
      >
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Product Gallery</p>
            </div>
          </div>
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
      className="mb-8"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="aspect-video relative group">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-lg"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-lg"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    selectedImageIndex === i
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  onClick={() => setSelectedImageIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="p-4 bg-gray-50">
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === i
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
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
    features && features.length ? features : ["Smart Technology", "Premium Build", "User Friendly"];

  const icons = [
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>,
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ];

  return (
    <EditableElement
      elementId="features-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((f, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="text-blue-600 mb-4">
              {icons[i % icons.length]}
            </div>
            
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
              className="mb-3"
            >
              <h3 className="text-xl font-semibold text-gray-900">{f}</h3>
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
                <p className="text-gray-600 leading-relaxed">{featureExplanations[f]}</p>
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
  const rows = entries.length ? entries : [
    ["Dimensions", "10 x 5 x 2 inches"],
    ["Weight", "1.2 lbs"],
    ["Material", "Aluminum & Glass"],
    ["Warranty", "2 Years"]
  ];

  return (
    <EditableElement
      elementId="specs-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-8"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
          <EditableElement
            elementId="specs-title"
            type="text"
            isEditing={isEditing}
            onEdit={onEdit}
            onMove={onMove}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            currentText={elementTexts?.["specs-title"] || "Technical Specifications"}
            currentStyle={elementStyles?.["specs-title"] || {}}
          >
            <h2 className="text-2xl font-bold text-gray-900">Technical Specifications</h2>
          </EditableElement>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rows.slice(0, 8).map(([k, v], i) => (
              <div key={i} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
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
                  <span className="font-medium text-gray-700">{k}</span>
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
                  <span className="text-gray-900 font-semibold">{v}</span>
                </EditableElement>
              </div>
            ))}
          </div>
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg">
        <EditableElement
          elementId="cta-button"
          type="text"
          isEditing={isEditing}
          onEdit={onEdit}
          onMove={onMove}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={elementTexts?.["cta-button"] || "Get Started Today"}
          currentStyle={elementStyles?.["cta-button"] || {}}
        >
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Get Started Today
          </button>
        </EditableElement>
      </div>
    </EditableElement>
  );
}

/* ==========================
   Modern Template
   ========================== */
export default function ModernTemplate({
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
        return content?.description || "Experience the future with our innovative product design.";
      case "specs-title":
        return "Technical Specifications";
      case "cta-button":
        return "Get Started Today";
      default:
        if (elementId?.startsWith("feature-") && elementId?.includes("-title")) {
          const index = parseInt(elementId.split("-")[1]);
          const features =
            content?.features || ["Smart Technology", "Premium Build", "User Friendly"];
          return features[index] || `Feature ${index + 1}`;
        }
        if (
          elementId?.startsWith("feature-") &&
          elementId?.includes("-explanation")
        ) {
          const index = parseInt(elementId.split("-")[1]);
          const features =
            content?.features || ["Smart Technology", "Premium Build", "User Friendly"];
          const featureName = features[index];
          return content?.featureExplanations?.[featureName] || "Feature explanation";
        }
        if (elementId?.startsWith("spec-") && elementId?.includes("-key")) {
          const index = parseInt(elementId.split("-")[1]);
          const entries = Object.entries(content?.specifications || {});
          const defaultSpecs = [
            ["Dimensions", "10 x 5 x 2 inches"],
            ["Weight", "1.2 lbs"],
            ["Material", "Aluminum & Glass"],
            ["Warranty", "2 Years"]
          ];
          return entries[index]?.[0] || defaultSpecs[index]?.[0] || "Specification";
        }
        if (elementId?.startsWith("spec-") && elementId?.includes("-value")) {
          const index = parseInt(elementId.split("-")[1]);
          const entries = Object.entries(content?.specifications || {});
          const defaultSpecs = [
            ["Dimensions", "10 x 5 x 2 inches"],
            ["Weight", "1.2 lbs"],
            ["Material", "Aluminum & Glass"],
            ["Warranty", "2 Years"]
          ];
          return entries[index]?.[1] || defaultSpecs[index]?.[1] || "Value";
        }
        return "Edit this text";
    }
  };

  const getCurrentStyle = (elementId) => elementStyles[elementId] || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" onClick={handleContainerClick}>
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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