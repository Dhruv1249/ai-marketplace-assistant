"use client";

import React, { useState, useEffect } from "react";
import EnhancedEditableElement from "../shared/EnhancedEditableElement";
import EnhancedTextEditor from "../shared/EnhancedTextEditor";

/* =====
   Hero
   ===== */
function Hero({
  title,
  description,
  isEditing,
  onEdit,
  onMove,
  onDelete,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
  elementProps,
  deletedElements,
}) {
  if (deletedElements?.includes("hero-section")) return null;

  return (
    <div className="border-b pb-4 mb-4">
      {!deletedElements?.includes("hero-title") && (
        <EnhancedEditableElement
          elementId="hero-title"
          type="text"
          isEditing={isEditing}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={elementTexts?.["hero-title"] || title || "Product Title"}
          currentStyle={elementStyles?.["hero-title"] || {}}
          currentProps={elementProps?.["hero-title"] || {}}
          className="mb-2"
        >
          <h2 className="text-2xl font-semibold">{title || "Product Title"}</h2>
        </EnhancedEditableElement>
      )}

      {!deletedElements?.includes("hero-description") && (
        <EnhancedEditableElement
          elementId="hero-description"
          type="text"
          isEditing={isEditing}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={
            elementTexts?.["hero-description"] ||
            description ||
            "Product description will appear here."
          }
          currentStyle={elementStyles?.["hero-description"] || {}}
          currentProps={elementProps?.["hero-description"] || {}}
        >
          <p className="whitespace-pre-line">
            {description || "Product description will appear here."}
          </p>
        </EnhancedEditableElement>
      )}
    </div>
  );
}

/* ========
   Gallery
   ======== */
function Gallery({ 
  images = [], 
  isEditing, 
  onMove, 
  onDelete,
  selectedElement, 
  setSelectedElement,
  deletedElements 
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const hasImages = images && images.length > 0;

  if (deletedElements?.includes("gallery")) return null;

  if (!hasImages) {
    return (
      <EnhancedEditableElement
        elementId="gallery"
        type="image"
        isEditing={isEditing}
        onMove={onMove}
        onDelete={onDelete}
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
      </EnhancedEditableElement>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <EnhancedEditableElement
      elementId="gallery"
      type="image"
      isEditing={isEditing}
      onMove={onMove}
      onDelete={onDelete}
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
    </EnhancedEditableElement>
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
  onDelete,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
  elementProps,
  deletedElements,
}) {
  const items =
    features && features.length ? features : ["Key feature one", "Key feature two", "Key feature three"];

  if (deletedElements?.includes("features-section")) return null;

  return (
    <EnhancedEditableElement
      elementId="features-section"
      isEditing={isEditing}
      onMove={onMove}
      onDelete={onDelete}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-6"
    >
      {!deletedElements?.includes("features-title") && (
        <EnhancedEditableElement
          elementId="features-title"
          type="text"
          isEditing={isEditing}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={elementTexts?.["features-title"] || "Key Features"}
          currentStyle={elementStyles?.["features-title"] || {}}
          currentProps={elementProps?.["features-title"] || {}}
          className="mb-3"
        >
          <h3 className="text-lg font-semibold">Key Features</h3>
        </EnhancedEditableElement>
      )}

      <div className="space-y-4">
        {items.map((f, i) => (
          <div key={i} className="border-l-4 border-blue-400 pl-4">
            {!deletedElements?.includes(`feature-${i}-title`) && (
              <EnhancedEditableElement
                elementId={`feature-${i}-title`}
                type="text"
                isEditing={isEditing}
                onEdit={onEdit}
                onMove={onMove}
                onDelete={onDelete}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.[`feature-${i}-title`] || f}
                currentStyle={elementStyles?.[`feature-${i}-title`] || {}}
                currentProps={elementProps?.[`feature-${i}-title`] || {}}
                className="mb-1"
              >
                <h4 className="font-medium">{f}</h4>
              </EnhancedEditableElement>
            )}

            {featureExplanations[f] && !deletedElements?.includes(`feature-${i}-explanation`) && (
              <EnhancedEditableElement
                elementId={`feature-${i}-explanation`}
                type="text"
                isEditing={isEditing}
                onEdit={onEdit}
                onMove={onMove}
                onDelete={onDelete}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={
                  elementTexts?.[`feature-${i}-explanation`] || featureExplanations[f]
                }
                currentStyle={elementStyles?.[`feature-${i}-explanation`] || {}}
                currentProps={elementProps?.[`feature-${i}-explanation`] || {}}
              >
                <p className="text-sm leading-relaxed">{featureExplanations[f]}</p>
              </EnhancedEditableElement>
            )}
          </div>
        ))}
      </div>
    </EnhancedEditableElement>
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
  onDelete,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
  elementProps,
  deletedElements,
}) {
  const entries = Object.entries(specifications);
  const rows = entries.length ? entries : [["Specification", "Value"]];

  if (deletedElements?.includes("specs-section")) return null;

  return (
    <EnhancedEditableElement
      elementId="specs-section"
      isEditing={isEditing}
      onMove={onMove}
      onDelete={onDelete}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mb-6"
    >
      {!deletedElements?.includes("specs-title") && (
        <EnhancedEditableElement
          elementId="specs-title"
          type="text"
          isEditing={isEditing}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={elementTexts?.["specs-title"] || "Specifications"}
          currentStyle={elementStyles?.["specs-title"] || {}}
          currentProps={elementProps?.["specs-title"] || {}}
          className="mb-3"
        >
          <h3 className="text-lg font-semibold">Specifications</h3>
        </EnhancedEditableElement>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {rows.slice(0, 8).map(([k, v], i) => (
              <tr key={i}>
                {!deletedElements?.includes(`spec-${i}-key`) && (
                  <EnhancedEditableElement
                    elementId={`spec-${i}-key`}
                    type="text"
                    isEditing={isEditing}
                    onEdit={onEdit}
                    onMove={onMove}
                    onDelete={onDelete}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    currentText={elementTexts?.[`spec-${i}-key`] || k}
                    currentStyle={elementStyles?.[`spec-${i}-key`] || {}}
                    currentProps={elementProps?.[`spec-${i}-key`] || {}}
                    className="px-4 py-2 bg-gray-50 font-medium w-1/3"
                  >
                    <td className="px-4 py-2 bg-gray-50 font-medium w-1/3">{k}</td>
                  </EnhancedEditableElement>
                )}
                {!deletedElements?.includes(`spec-${i}-value`) && (
                  <EnhancedEditableElement
                    elementId={`spec-${i}-value`}
                    type="text"
                    isEditing={isEditing}
                    onEdit={onEdit}
                    onMove={onMove}
                    onDelete={onDelete}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    currentText={elementTexts?.[`spec-${i}-value`] || v}
                    currentStyle={elementStyles?.[`spec-${i}-value`] || {}}
                    currentProps={elementProps?.[`spec-${i}-value`] || {}}
                    className="px-4 py-2"
                  >
                    <td className="px-4 py-2">{v}</td>
                  </EnhancedEditableElement>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EnhancedEditableElement>
  );
}

/* ===
   CTA
   === */
function CTA({
  isEditing,
  onEdit,
  onMove,
  onDelete,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
  elementProps,
  deletedElements,
}) {
  if (deletedElements?.includes("cta-section")) return null;

  return (
    <EnhancedEditableElement
      elementId="cta-section"
      isEditing={isEditing}
      onMove={onMove}
      onDelete={onDelete}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      className="mt-6"
    >
      {!deletedElements?.includes("cta-button") && (
        <EnhancedEditableElement
          elementId="cta-button"
          type="button"
          isEditing={isEditing}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={elementTexts?.["cta-button"] || "Add to Cart"}
          currentStyle={elementStyles?.["cta-button"] || {}}
          currentProps={elementProps?.["cta-button"] || {}}
        >
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add to Cart
          </button>
        </EnhancedEditableElement>
      )}
    </EnhancedEditableElement>
  );
}

/* ==========================
   Custom Elements Renderer
   ========================== */
function CustomElements({
  customElements = [],
  isEditing,
  onEdit,
  onMove,
  onDelete,
  selectedElement,
  setSelectedElement,
  elementStyles,
  elementTexts,
  elementProps,
}) {
  return (
    <>
      {customElements.map((element) => (
        <EnhancedEditableElement
          key={element.id}
          elementId={element.id}
          type={element.type}
          isEditing={isEditing}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={elementTexts?.[element.id] || element.content}
          currentStyle={{...element.style, ...elementStyles?.[element.id]}}
          currentProps={{...element.props, ...elementProps?.[element.id]}}
          style={{
            position: 'absolute',
            left: element.position?.x || 0,
            top: element.position?.y || 0,
            zIndex: 10,
          }}
        >
          {element.type === "text" && (
            <div>{element.content}</div>
          )}
          {element.type === "button" && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {element.content}
            </button>
          )}
          {element.type === "link" && (
            <a href={element.props?.href || "#"} className="text-blue-600 underline">
              {element.content}
            </a>
          )}
          {element.type === "image" && (
            <img 
              src={element.props?.src || "https://via.placeholder.com/200x150"} 
              alt={element.content}
              className="max-w-full h-auto"
            />
          )}
          {element.type === "shape" && (
            <div className="bg-gray-200 rounded"></div>
          )}
        </EnhancedEditableElement>
      ))}
    </>
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
  onElementDelete,
  templateEdits,
}) {
  const [editingElement, setEditingElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [editingElementType, setEditingElementType] = useState("text");

  // Use template edits if available
  const elementStyles = templateEdits?.elementStyles || {};
  const elementTexts = templateEdits?.elementTexts || {};
  const elementProps = templateEdits?.elementProps || {};
  const customElements = templateEdits?.customElements || [];
  const deletedElements = templateEdits?.deletedElements || [];

  const handleContainerClick = (e) => {
    if (isEditing && e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const handleEdit = (elementId) => {
    setEditingElement(elementId);
    
    // Determine element type
    const customElement = customElements.find(el => el.id === elementId);
    if (customElement) {
      setEditingElementType(customElement.type);
    } else if (elementId.includes("button")) {
      setEditingElementType("button");
    } else if (elementId.includes("link")) {
      setEditingElementType("link");
    } else if (elementId.includes("image") || elementId === "gallery") {
      setEditingElementType("image");
    } else {
      setEditingElementType("text");
    }
    
    setTextEditorOpen(true);
  };

  const handleMove = (elementId, position) => {
    onContentChange?.(elementId, { position });
  };

  const handleResize = (elementId, size) => {
    onContentChange?.(elementId, { size });
  };

  const handleTextSave = (newText, newStyle, newProps) => {
    onContentChange?.(editingElement, {
      text: newText,
      style: newStyle,
      props: newProps,
    });

    setEditingElement(null);
  };

  const getCurrentText = (elementId) => {
    if (elementTexts[elementId]) return elementTexts[elementId];

    // Check custom elements
    const customElement = customElements.find(el => el.id === elementId);
    if (customElement) return customElement.content;

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

  const getCurrentStyle = (elementId) => {
    const customElement = customElements.find(el => el.id === elementId);
    if (customElement) {
      return { ...customElement.style, ...elementStyles[elementId] };
    }
    return elementStyles[elementId] || {};
  };

  const getCurrentProps = (elementId) => {
    const customElement = customElements.find(el => el.id === elementId);
    if (customElement) {
      return { ...customElement.props, ...elementProps[elementId] };
    }
    return elementProps[elementId] || {};
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative" onClick={handleContainerClick}>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Gallery
              images={images}
              isEditing={isEditing}
              onMove={handleMove}
              onDelete={onElementDelete}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              deletedElements={deletedElements}
            />
          </div>
          <div>
            <Hero
              title={content?.title}
              description={content?.description}
              isEditing={isEditing}
              onEdit={handleEdit}
              onMove={handleMove}
              onDelete={onElementDelete}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              elementStyles={elementStyles}
              elementTexts={elementTexts}
              elementProps={elementProps}
              deletedElements={deletedElements}
            />
            <Features
              features={content?.features}
              featureExplanations={content?.featureExplanations}
              isEditing={isEditing}
              onEdit={handleEdit}
              onMove={handleMove}
              onDelete={onElementDelete}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              elementStyles={elementStyles}
              elementTexts={elementTexts}
              elementProps={elementProps}
              deletedElements={deletedElements}
            />
            <Specs
              specifications={content?.specifications}
              isEditing={isEditing}
              onEdit={handleEdit}
              onMove={handleMove}
              onDelete={onElementDelete}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              elementStyles={elementStyles}
              elementTexts={elementTexts}
              elementProps={elementProps}
              deletedElements={deletedElements}
            />
            <CTA
              isEditing={isEditing}
              onEdit={handleEdit}
              onMove={handleMove}
              onDelete={onElementDelete}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              elementStyles={elementStyles}
              elementTexts={elementTexts}
              elementProps={elementProps}
              deletedElements={deletedElements}
            />
          </div>
        </div>
      </div>

      {/* Custom Elements */}
      <CustomElements
        customElements={customElements}
        isEditing={isEditing}
        onEdit={handleEdit}
        onMove={handleMove}
        onDelete={onElementDelete}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        elementStyles={elementStyles}
        elementTexts={elementTexts}
        elementProps={elementProps}
      />

      <EnhancedTextEditor
        isOpen={textEditorOpen}
        onClose={() => setTextEditorOpen(false)}
        onSave={handleTextSave}
        initialText={getCurrentText(editingElement)}
        initialStyle={getCurrentStyle(editingElement)}
        initialProps={getCurrentProps(editingElement)}
        elementType={editingElementType}
      />
    </div>
  );
}