"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

/* =========================
   Editable component wrapper
   ========================= */
export default function EditableElement({
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