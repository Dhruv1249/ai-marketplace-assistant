"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

/* =========================
   Simple Editable Element - focused on template elements
   ========================= */
function EnhancedEditableElement({
  children,
  onEdit,
  onMove,
  onResize,
  onDelete,
  isEditing = false,
  className = "",
  style = {},
  elementId,
  type = "text",
  selectedElement,
  setSelectedElement,
  currentText,
  currentStyle = {},
  currentProps = {},
}) {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const isSelected = selectedElement === elementId;

  // Prevent text selection during drag/resize
  useEffect(() => {
    if (isDragging || isResizing) {
      document.body.style.userSelect = "none";
      return () => {
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, isResizing]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setDragOffset(newOffset);
      onMove?.(elementId, newOffset);
    }
  }, [isDragging, dragStart, onMove, elementId]);

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

  const handleMouseDown = (e) => {
    if (!isEditing) return;
    e.stopPropagation();
    setSelectedElement(elementId);

    // Don't start dragging if clicking on resize handle
    if (e.target.classList.contains("resize-handle")) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDoubleClick = (e) => {
    if (!isEditing) return;
    e.stopPropagation();
    onEdit?.(elementId);
  };

  const handleClick = (e) => {
    if (isEditing) {
      e.stopPropagation();
      setSelectedElement(elementId);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(elementId);
  };

  // Apply current text and style to children
  const styledChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (type === "text" && currentText !== undefined) {
        return React.cloneElement(child, {
          children: currentText,
          style: { ...(child.props.style || {}), ...currentStyle },
        });
      } else if (type === "button") {
        return React.cloneElement(child, {
          children: currentText || child.props.children,
          style: { ...(child.props.style || {}), ...currentStyle },
          onClick: currentProps?.href ? () => window.open(currentProps.href, '_blank') : child.props.onClick,
        });
      } else if (type === "link") {
        return React.cloneElement(child, {
          children: currentText || child.props.children,
          style: { ...(child.props.style || {}), ...currentStyle },
          href: currentProps?.href || child.props.href,
        });
      } else if (type === "image") {
        return React.cloneElement(child, {
          src: currentProps?.src || child.props.src,
          alt: currentText || child.props.alt,
          style: { ...(child.props.style || {}), ...currentStyle },
        });
      }
    }
    return child;
  });

  const elementStyle = {
    ...style,
    ...currentStyle,
    cursor: isEditing ? (isDragging ? "grabbing" : "grab") : "default",
    position: "relative",
    transform: isDragging ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : undefined,
  };

  // Add selection styling when selected
  if (isSelected && isEditing) {
    elementStyle.outline = "2px solid #3b82f6";
    elementStyle.outlineOffset = "2px";
  }

  return (
    <div
      ref={elementRef}
      className={`${className} ${isEditing ? "editable-element" : ""} ${
        isSelected && isEditing ? "selected" : ""
      }`}
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      {styledChildren}

      {/* Delete button */}
      {isSelected && isEditing && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 z-30 flex items-center justify-center"
          onClick={handleDelete}
          title="Delete element"
        >
          ×
        </button>
      )}

      {/* Resize handles - only show for selected elements */}
      {isSelected && isEditing && (
        <>
          {/* Corner handles */}
          <div
            className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize z-20 hover:bg-blue-600"
            title="Resize"
          />
          <div
            className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize z-20 hover:bg-blue-600"
            title="Resize"
          />
          <div
            className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize z-20 hover:bg-blue-600"
            title="Resize"
          />
          <div
            className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize z-20 hover:bg-blue-600"
            title="Resize"
          />
        </>
      )}
    </div>
  );
}

export default EnhancedEditableElement;