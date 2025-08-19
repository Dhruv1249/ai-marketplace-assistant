"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";





/* =========================
   Editable component wrapper
   ========================= */
function EditableElement({
  children,
  onEdit,
  onMove,
  onResize,
  isEditing = false,
  className = "",
  style = {},
  elementId,
  type = "text",
  selectedElement,
  setSelectedElement,
  currentText,
  currentStyle = {},
}) {
  const elementRef = useRef(null);

  // position/size states for rendering
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: "auto", height: "auto" });

  // live refs to avoid stale closures during mousemove
  const positionRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef({ width: 0, height: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // snapshot at resize start (so we never depend on moving state during the gesture)
  const resizeStartRef = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    posX: 0,
    posY: 0,
  });

  const isSelected = selectedElement === elementId;

  // Prevent accidental text selection during drag/resize (no pointer-events hacks)
  useEffect(() => {
    if (isDragging || isResizing) {
      const prev = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      return () => {
        document.body.style.userSelect = prev || "";
      };
    }
  }, [isDragging, isResizing]);

  // Cursor helper
  const cursorForDirection = (dir) => {
    switch (dir) {
      case "n":
        return "n-resize";
      case "s":
        return "s-resize";
      case "e":
        return "e-resize";
      case "w":
        return "w-resize";
      case "ne":
        return "ne-resize";
      case "nw":
        return "nw-resize";
      case "se":
        return "se-resize";
      case "sw":
        return "sw-resize";
      default:
        return "nwse-resize";
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        const newPos = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };
        positionRef.current = newPos;
        setPosition(newPos);
        onMove?.(elementId, newPos);
        return;
      }

      if (isResizing) {
        const start = resizeStartRef.current;
        const deltaX = e.clientX - start.x;
        const deltaY = e.clientY - start.y;

        let newWidth = start.width;
        let newHeight = start.height;
        let newPosX = start.posX;
        let newPosY = start.posY;

        switch (resizeDirection) {
          case "se": // bottom-right
            newWidth = Math.max(50, start.width + deltaX);
            newHeight = Math.max(30, start.height + deltaY);
            break;
          case "sw": // bottom-left
            newWidth = Math.max(50, start.width - deltaX);
            newHeight = Math.max(30, start.height + deltaY);
            newPosX = start.posX + (start.width - newWidth);
            break;
          case "ne": // top-right
            newWidth = Math.max(50, start.width + deltaX);
            newHeight = Math.max(30, start.height - deltaY);
            newPosY = start.posY + (start.height - newHeight);
            break;
          case "nw": // top-left
            newWidth = Math.max(50, start.width - deltaX);
            newHeight = Math.max(30, start.height - deltaY);
            newPosX = start.posX + (start.width - newWidth);
            newPosY = start.posY + (start.height - newHeight);
            break;
          case "n": // top
            newHeight = Math.max(30, start.height - deltaY);
            newPosY = start.posY + (start.height - newHeight);
            break;
          case "s": // bottom
            newHeight = Math.max(30, start.height + deltaY);
            break;
          case "e": // right
            newWidth = Math.max(50, start.width + deltaX);
            break;
          case "w": // left
            newWidth = Math.max(50, start.width - deltaX);
            newPosX = start.posX + (start.width - newWidth);
            break;
          default:
            newWidth = Math.max(50, start.width + deltaX);
            newHeight = Math.max(30, start.height + deltaY);
        }

        const newSize = { width: newWidth, height: newHeight };
        const newPos = { x: newPosX, y: newPosY };

        sizeRef.current = newSize;
        positionRef.current = newPos;

        setSize(newSize);
        setPosition(newPos);

        onResize?.(elementId, newSize);
        onMove?.(elementId, newPos);
      }
    },
    [isDragging, isResizing, dragStart, resizeDirection, onMove, onResize, elementId]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection("");
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();

    // snapshot current rect and current transform position
    const rect = elementRef.current.getBoundingClientRect();

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width:
        typeof size.width === "number" ? size.width : Math.round(rect.width),
      height:
        typeof size.height === "number" ? size.height : Math.round(rect.height),
      posX: positionRef.current.x,
      posY: positionRef.current.y,
    };

    // also sync the live ref for consistency
    sizeRef.current = {
      width: resizeStartRef.current.width,
      height: resizeStartRef.current.height,
    };

    setIsResizing(true);
    setResizeDirection(direction);
  };

  const handleMouseDown = (e) => {
    if (!isEditing) return;
    e.stopPropagation();
    setSelectedElement(elementId);

    // Don't start dragging if clicking on resize handle
    if (e.target.classList.contains("resize-handle")) return;

    // snapshot drag offset
    setIsDragging(true);
    setDragStart({
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    });
  };

  const handleDoubleClick = (e) => {
    if (!isEditing || type !== "text") return;
    e.stopPropagation();
    onEdit?.(elementId);
  };

  const handleClick = (e) => {
    if (isEditing) {
      e.stopPropagation();
      setSelectedElement(elementId);
    }
  };

  // Apply current text and style to children
  const styledChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && type === "text" && currentText !== undefined) {
      return React.cloneElement(child, {
        children: currentText,
        style: { ...(child.props.style || {}), ...currentStyle },
      });
    }
    return child;
  });

  const dynamicCursor =
    isEditing && (isDragging || isResizing)
      ? isResizing
        ? cursorForDirection(resizeDirection)
        : "grabbing"
      : isEditing
      ? "grab"
      : "default";

  return (
    <div
      ref={elementRef}
      className={`${className} ${isEditing ? "editable-element" : ""} ${
        isSelected && isEditing ? "selected" : ""
      }`}
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: dynamicCursor,
        position: isEditing ? "relative" : style.position || "static",
        border: isSelected && isEditing ? "2px solid #3b82f6" : style.border || "none",
        outline: isSelected && isEditing ? "1px dashed #3b82f6" : "none",
        outlineOffset: "2px",
        width: size.width !== "auto" ? `${size.width}px` : style.width || "auto",
        height: size.height !== "auto" ? `${size.height}px` : style.height || "auto",
        minWidth: isEditing ? "50px" : "auto",
        minHeight: isEditing ? "30px" : "auto",
        userSelect: isDragging || isResizing ? "none" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      {styledChildren}

      {/* Resize handles */}
      {isSelected && isEditing && (
        <>
          {/* Corners */}
          <div
            className="resize-handle absolute -top-2 -left-2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize z-20 hover:bg-blue-600 shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
            title="Resize from top-left"
          />
          <div
            className="resize-handle absolute -top-2 -right-2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize z-20 hover:bg-blue-600 shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
            title="Resize from top-right"
          />
          <div
            className="resize-handle absolute -bottom-2 -left-2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize z-20 hover:bg-blue-600 shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
            title="Resize from bottom-left"
          />
          <div
            className="resize-handle absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full cursor-se-resize z-20 hover:bg-blue-600 shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, "se")}
            title="Resize from bottom-right"
          />

          {/* Sides */}
          <div
            className="resize-handle absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-blue-500 border-2 border-white rounded cursor-n-resize z-20 hover:bg-blue-600 shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, "n")}
            title="Resize from top"
          />
          <div
            className="resize-handle absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-blue-500 border-2 border-white rounded cursor-s-resize z-20 hover:bg-blue-600 shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, "s")}
            title="Resize from bottom"
          />
          <div
            className="resize-handle absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-6 bg-blue-500 border-2 border-white rounded cursor-w-resize z-20 hover:bg-blue-600 shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, "w")}
            title="Resize from left"
          />
          <div
            className="resize-handle absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-6 bg-blue-500 border-2 border-white rounded cursor-e-resize z-20 hover:bg-blue-600 shadow-lg"
            onMouseDown={(e) => handleResizeStart(e, "e")}
            title="Resize from right"
          />
        </>
      )}
    </div>
  );
}

/* =================
   Text editor modal
   ================= */
function TextEditor({ isOpen, onClose, onSave, initialText = "", initialStyle = {} }) {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialStyle.fontSize || "16px");
  const [fontWeight, setFontWeight] = useState(initialStyle.fontWeight || "normal");
  const [color, setColor] = useState(initialStyle.color || "#000000");
  const [textAlign, setTextAlign] = useState(initialStyle.textAlign || "left");

  useEffect(() => {
    setText(initialText);
    setFontSize(initialStyle.fontSize || "16px");
    setFontWeight(initialStyle.fontWeight || "normal");
    setColor(initialStyle.color || "#000000");
    setTextAlign(initialStyle.textAlign || "left");
  }, [initialText, initialStyle]);

  const handleSave = () => {
    onSave(text, {
      fontSize,
      fontWeight,
      color,
      textAlign,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Edit Text</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Text Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="32px">32px</option>
                <option value="48px">48px</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="600">Semi Bold</option>
                <option value="300">Light</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full p-1 border rounded-lg h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Align</label>
              <select
                value={textAlign}
                onChange={(e) => setTextAlign(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

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
        {/* Removed fixed Tailwind text color so inline color from editor wins */}
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

  // NOTE: Wrapping <td> directly inside a <div> (EditableElement) is invalid HTML.
  // Browsers cope, but if you ever see table weirdness, consider making only the TEXT inside <td> editable.

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
        {/* Removed text-white so color from editor applies */}
        <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
          Add to Cart
        </button>
      </EditableElement>
    </EditableElement>
  );
}

/* ==========================
   Top-level preview component
   ========================== */
export default function EditableTemplatePreview({
  layoutType = "gallery-focused",
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

  if (layoutType === "gallery-focused") {
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Template not implemented yet</p>
      </div>
    </div>
  );
}
