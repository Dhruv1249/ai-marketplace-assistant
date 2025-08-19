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
    <div className="border-b-2 border-gray-800 pb-8 mb-8">
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
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
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
          "A timeless product crafted with traditional excellence and modern precision."
        }
        currentStyle={elementStyles?.["hero-description"] || {}}
      >
        <p className="text-lg text-gray-700 leading-relaxed font-serif max-w-4xl">
          {description || "A timeless product crafted with traditional excellence and modern precision."}
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
        className="mb-12"
      >
        <div className="border-2 border-gray-300 bg-gray-50">
          <div className="aspect-[4/3] flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-gray-400 rounded mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-serif text-lg">Product Gallery</p>
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
      className="mb-12"
    >
      <div className="border-2 border-gray-800">
        <div className="aspect-[4/3] relative group bg-gray-100">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-800 text-gray-800 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-800 text-gray-800 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="border-t-2 border-gray-800 p-4 bg-gray-50">
            <div className="flex space-x-3 justify-center">
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`w-20 h-20 border-2 transition-all duration-200 ${
                    selectedImageIndex === i
                      ? "border-gray-800"
                      : "border-gray-400 hover:border-gray-600"
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
    features && features.length ? features : ["Handcrafted Quality", "Heritage Design", "Lifetime Durability"];

  return (
    <EditableElement
      elementId="features-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-12"
    >
      <div className="border-2 border-gray-800 bg-white">
        <div className="border-b-2 border-gray-800 bg-gray-100 px-6 py-4">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Distinguished Features</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-8">
            {items.map((f, i) => (
              <div key={i} className="border-l-4 border-gray-800 pl-6">
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
                  <h3 className="text-xl font-serif font-semibold text-gray-900">{f}</h3>
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
                    <p className="text-gray-700 leading-relaxed font-serif">{featureExplanations[f]}</p>
                  </EditableElement>
                )}
              </div>
            ))}
          </div>
        </div>
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
    ["Craftsmanship", "Hand-finished"],
    ["Materials", "Premium Hardwood"],
    ["Origin", "Traditional Workshop"],
    ["Finish", "Natural Oil"],
    ["Dimensions", "Custom Available"],
    ["Care", "Gentle Cleaning"]
  ];

  return (
    <EditableElement
      elementId="specs-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-12"
    >
      <div className="border-2 border-gray-800 bg-white">
        <div className="border-b-2 border-gray-800 bg-gray-100 px-6 py-4">
          <EditableElement
            elementId="specs-title"
            type="text"
            isEditing={isEditing}
            onEdit={onEdit}
            onMove={onMove}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            currentText={elementTexts?.["specs-title"] || "Product Specifications"}
            currentStyle={elementStyles?.["specs-title"] || {}}
          >
            <h2 className="text-2xl font-serif font-bold text-gray-900">Product Specifications</h2>
          </EditableElement>
        </div>

        <div className="p-6">
          <table className="w-full">
            <tbody>
              {rows.slice(0, 8).map(([k, v], i) => (
                <tr key={i} className="border-b border-gray-300 last:border-b-0">
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
                    className="py-3 pr-8 w-1/3"
                  >
                    <td className="py-3 pr-8 w-1/3 font-serif font-semibold text-gray-800">{k}</td>
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
                    className="py-3"
                  >
                    <td className="py-3 font-serif text-gray-700">{v}</td>
                  </EditableElement>
                </tr>
              ))}
            </tbody>
          </table>
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
      <div className="border-2 border-gray-800 bg-gray-100 p-8">
        <EditableElement
          elementId="cta-button"
          type="text"
          isEditing={isEditing}
          onEdit={onEdit}
          onMove={onMove}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={elementTexts?.["cta-button"] || "Acquire This Piece"}
          currentStyle={elementStyles?.["cta-button"] || {}}
        >
          <button className="bg-gray-800 text-white px-12 py-4 font-serif text-lg font-semibold border-2 border-gray-800 hover:bg-white hover:text-gray-800 transition-colors duration-200 uppercase tracking-wider">
            Acquire This Piece
          </button>
        </EditableElement>
      </div>
    </EditableElement>
  );
}

/* ==========================
   Classic Template
   ========================== */
export default function ClassicTemplate({
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
        return content?.description || "A timeless product crafted with traditional excellence and modern precision.";
      case "specs-title":
        return "Product Specifications";
      case "cta-button":
        return "Acquire This Piece";
      default:
        if (elementId?.startsWith("feature-") && elementId?.includes("-title")) {
          const index = parseInt(elementId.split("-")[1]);
          const features =
            content?.features || ["Handcrafted Quality", "Heritage Design", "Lifetime Durability"];
          return features[index] || `Feature ${index + 1}`;
        }
        if (
          elementId?.startsWith("feature-") &&
          elementId?.includes("-explanation")
        ) {
          const index = parseInt(elementId.split("-")[1]);
          const features =
            content?.features || ["Handcrafted Quality", "Heritage Design", "Lifetime Durability"];
          const featureName = features[index];
          return content?.featureExplanations?.[featureName] || "Feature explanation";
        }
        if (elementId?.startsWith("spec-") && elementId?.includes("-key")) {
          const index = parseInt(elementId.split("-")[1]);
          const entries = Object.entries(content?.specifications || {});
          const defaultSpecs = [
            ["Craftsmanship", "Hand-finished"],
            ["Materials", "Premium Hardwood"],
            ["Origin", "Traditional Workshop"],
            ["Finish", "Natural Oil"],
            ["Dimensions", "Custom Available"],
            ["Care", "Gentle Cleaning"]
          ];
          return entries[index]?.[0] || defaultSpecs[index]?.[0] || "Specification";
        }
        if (elementId?.startsWith("spec-") && elementId?.includes("-value")) {
          const index = parseInt(elementId.split("-")[1]);
          const entries = Object.entries(content?.specifications || {});
          const defaultSpecs = [
            ["Craftsmanship", "Hand-finished"],
            ["Materials", "Premium Hardwood"],
            ["Origin", "Traditional Workshop"],
            ["Finish", "Natural Oil"],
            ["Dimensions", "Custom Available"],
            ["Care", "Gentle Cleaning"]
          ];
          return entries[index]?.[1] || defaultSpecs[index]?.[1] || "Value";
        }
        return "Edit this text";
    }
  };

  const getCurrentStyle = (elementId) => elementStyles[elementId] || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" onClick={handleContainerClick}>
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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