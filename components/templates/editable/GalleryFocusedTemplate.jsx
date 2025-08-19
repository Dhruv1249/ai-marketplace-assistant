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
    <div className="border-b pb-4 mb-4">
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
        className="mb-2"
      >
        <h2 className="text-2xl font-semibold">{title || "Product Title"}</h2>
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
          "Product description will appear here."
        }
        currentStyle={elementStyles?.["hero-description"] || {}}
      >
        <p className="whitespace-pre-line">
          {description || "Product description will appear here."}
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
        className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="lg:col-span-3">
          <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
            <span className="text-gray-400">Main Image</span>
          </div>
        </div>
        <div className="lg:col-span-1 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-2 overflow-auto max-h-[60vh] pr-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded bg-gray-100 flex items-center justify-center text-gray-300">
              IMG
            </div>
          ))}
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
      className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6"
    >
      <div className="lg:col-span-3">
        <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center relative group">
          <img
            src={selectedImage}
            alt={`Product image ${selectedImageIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-200 hover:scale-105"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg border border-gray-200"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-lg border border-gray-200"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-2 overflow-auto max-h-[60vh] pr-1">
        {images.map((src, i) => (
          <div
            key={i}
            className={`aspect-square rounded overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200 ${
              selectedImageIndex === i
                ? "ring-2 ring-blue-500 ring-offset-2"
                : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
            }`}
            onClick={() => setSelectedImageIndex(i)}
          >
            <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
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
    features && features.length ? features : ["Key feature one", "Key feature two", "Key feature three"];

  return (
    <EditableElement
      elementId="features-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-6"
    >
      <EditableElement
        elementId="features-title"
        type="text"
        isEditing={isEditing}
        onEdit={onEdit}
        onMove={onMove}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        currentText={elementTexts?.["features-title"] || "Key Features"}
        currentStyle={elementStyles?.["features-title"] || {}}
        className="mb-3"
      >
        <h3 className="text-lg font-semibold">Key Features</h3>
      </EditableElement>

      <div className="space-y-4">
        {items.map((f, i) => (
          <div key={i} className="border-l-4 border-blue-400 pl-4">
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
              className="mb-1"
            >
              <h4 className="font-medium">{f}</h4>
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
                <p className="text-sm leading-relaxed">{featureExplanations[f]}</p>
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
  const rows = entries.length ? entries : [["Specification", "Value"]];

  return (
    <EditableElement
      elementId="specs-section"
      isEditing={isEditing}
      onMove={onMove}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-6"
    >
      <EditableElement
        elementId="specs-title"
        type="text"
        isEditing={isEditing}
        onEdit={onEdit}
        onMove={onMove}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        currentText={elementTexts?.["specs-title"] || "Specifications"}
        currentStyle={elementStyles?.["specs-title"] || {}}
        className="mb-3"
      >
        <h3 className="text-lg font-semibold">Specifications</h3>
      </EditableElement>

      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {rows.slice(0, 8).map(([k, v], i) => (
              <tr key={i}>
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
                  className="px-4 py-2 bg-gray-50 font-medium w-1/3"
                >
                  <td className="px-4 py-2 bg-gray-50 font-medium w-1/3">{k}</td>
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
                  className="px-4 py-2"
                >
                  <td className="px-4 py-2">{v}</td>
                </EditableElement>
              </tr>
            ))}
          </tbody>
        </table>
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
      className="mt-6"
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
        <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
          Add to Cart
        </button>
      </EditableElement>
    </EditableElement>
  );
}

/* ==========================
   Gallery Focused Template
   ========================== */
export default function GalleryFocusedTemplate({
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
        return content?.description || "Product description will appear here.";
      case "features-title":
        return "Key Features";
      case "specs-title":
        return "Specifications";
      case "cta-button":
        return "Add to Cart";
      default:
        if (elementId?.startsWith("feature-") && elementId?.includes("-title")) {
          const index = parseInt(elementId.split("-")[1]);
          const features =
            content?.features || ["Key feature one", "Key feature two", "Key feature three"];
          return features[index] || `Feature ${index + 1}`;
        }
        if (
          elementId?.startsWith("feature-") &&
          elementId?.includes("-explanation")
        ) {
          const index = parseInt(elementId.split("-")[1]);
          const features =
            content?.features || ["Key feature one", "Key feature two", "Key feature three"];
          const featureName = features[index];
          return content?.featureExplanations?.[featureName] || "Feature explanation";
        }
        if (elementId?.startsWith("spec-") && elementId?.includes("-key")) {
          const index = parseInt(elementId.split("-")[1]);
          const entries = Object.entries(content?.specifications || {});
          return entries[index]?.[0] || "Specification";
        }
        if (elementId?.startsWith("spec-") && elementId?.includes("-value")) {
          const index = parseInt(elementId.split("-")[1]);
          const entries = Object.entries(content?.specifications || {});
          return entries[index]?.[1] || "Value";
        }
        return "Edit this text";
    }
  };

  const getCurrentStyle = (elementId) => elementStyles[elementId] || {};

  return (
    <div className="min-h-screen bg-white flex flex-col" onClick={handleContainerClick}>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Gallery
              images={images}
              isEditing={isEditing}
              onMove={handleMove}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
            />
          </div>
          <div>
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
        </div>
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