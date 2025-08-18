"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Editable component wrapper
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
  setSelectedElement
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 'auto', height: 'auto' });
  const elementRef = useRef(null);

  const isSelected = selectedElement === elementId;

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPosition(newPosition);
      onMove?.(elementId, newPosition);
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newSize = {
        width: Math.max(50, resizeStart.width + deltaX),
        height: Math.max(30, resizeStart.height + deltaY)
      };
      setSize(newSize);
      onResize?.(elementId, newSize);
    }
  }, [isDragging, isResizing, dragStart, resizeStart, elementId, onMove, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    const rect = elementRef.current.getBoundingClientRect();
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height
    });
  };

  const handleMouseDown = (e) => {
    if (!isEditing) return;
    e.stopPropagation();
    setSelectedElement(elementId);
    
    // Don't start dragging if clicking on resize handle
    if (e.target.classList.contains('resize-handle')) {
      return;
    }
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDoubleClick = (e) => {
    if (!isEditing || type !== 'text') return;
    e.stopPropagation();
    onEdit?.(elementId);
  };

  const handleClick = (e) => {
    if (isEditing) {
      e.stopPropagation();
      setSelectedElement(elementId);
    }
  };

  return (
    <div
      ref={elementRef}
      className={`${className} ${isEditing ? 'editable-element' : ''} ${isSelected ? 'selected' : ''}`}
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isEditing ? (isDragging ? 'grabbing' : isResizing ? 'nw-resize' : 'grab') : 'default',
        position: isEditing ? 'relative' : style.position || 'static',
        border: isSelected && isEditing ? '2px solid #3b82f6' : style.border || 'none',
        outline: isSelected && isEditing ? '1px dashed #3b82f6' : 'none',
        outlineOffset: '2px',
        width: size.width !== 'auto' ? `${size.width}px` : style.width || 'auto',
        height: size.height !== 'auto' ? `${size.height}px` : style.height || 'auto',
        minWidth: isEditing ? '50px' : 'auto',
        minHeight: isEditing ? '30px' : 'auto'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      {children}
      
      {/* Resize handles */}
      {isSelected && isEditing && (
        <>
          <div 
            className="resize-handle absolute -top-1 -left-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize z-20 hover:bg-blue-600" 
            onMouseDown={handleResizeStart}
          />
          <div 
            className="resize-handle absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize z-20 hover:bg-blue-600"
            onMouseDown={handleResizeStart}
          />
          <div 
            className="resize-handle absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize z-20 hover:bg-blue-600"
            onMouseDown={handleResizeStart}
          />
          <div 
            className="resize-handle absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize z-20 hover:bg-blue-600"
            onMouseDown={handleResizeStart}
          />
        </>
      )}
    </div>
  );
}

// Text editor modal
function TextEditor({ isOpen, onClose, onSave, initialText = "", initialStyle = {} }) {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialStyle.fontSize || '16px');
  const [fontWeight, setFontWeight] = useState(initialStyle.fontWeight || 'normal');
  const [color, setColor] = useState(initialStyle.color || '#000000');
  const [textAlign, setTextAlign] = useState(initialStyle.textAlign || 'left');

  useEffect(() => {
    setText(initialText);
    setFontSize(initialStyle.fontSize || '16px');
    setFontWeight(initialStyle.fontWeight || 'normal');
    setColor(initialStyle.color || '#000000');
    setTextAlign(initialStyle.textAlign || 'left');
  }, [initialText, initialStyle]);

  const handleSave = () => {
    onSave(text, {
      fontSize,
      fontWeight,
      color,
      textAlign
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

function Hero({ title, description, isEditing, onEdit, onMove, selectedElement, setSelectedElement }) {
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
        className="mb-2"
      >
        <h2 className="text-2xl font-semibold text-gray-900">{title || 'Product Title'}</h2>
      </EditableElement>
      
      <EditableElement
        elementId="hero-description"
        type="text"
        isEditing={isEditing}
        onEdit={onEdit}
        onMove={onMove}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
      >
        <p className="text-gray-700 whitespace-pre-line">{description || 'Product description will appear here.'}</p>
      </EditableElement>
    </div>
  );
}

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
            <div key={i} className="aspect-square rounded bg-gray-100 flex items-center justify-center text-gray-300">IMG</div>
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
          
          {/* Navigation arrows with better visibility */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 shadow-lg border border-gray-200"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 shadow-lg border border-gray-200"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
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
                ? 'ring-2 ring-blue-500 ring-offset-2' 
                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
            }`}
            onClick={() => setSelectedImageIndex(i)}
          >
            <img 
              src={src} 
              alt={`Thumbnail ${i + 1}`} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>
    </EditableElement>
  );
}

function Features({ features = [], featureExplanations = {}, isEditing, onEdit, onMove, selectedElement, setSelectedElement }) {
  const items = features && features.length ? features : [
    'Key feature one',
    'Key feature two',
    'Key feature three',
  ];
  
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
        className="mb-3"
      >
        <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
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
              className="mb-1"
            >
              <h4 className="font-medium text-gray-900">{f}</h4>
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
              >
                <p className="text-sm text-gray-600 leading-relaxed">
                  {featureExplanations[f]}
                </p>
              </EditableElement>
            )}
          </div>
        ))}
      </div>
    </EditableElement>
  );
}

function Specs({ specifications = {}, isEditing, onEdit, onMove, selectedElement, setSelectedElement }) {
  const entries = Object.entries(specifications);
  const rows = entries.length ? entries : [['Specification', 'Value']];
  
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
        className="mb-3"
      >
        <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
      </EditableElement>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {rows.slice(0, 8).map(([k, v], i) => (
              <tr key={i}>
                <td 
                  className={`px-4 py-2 bg-gray-50 text-gray-700 font-medium w-1/3 ${
                    isEditing ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''
                  } ${
                    selectedElement === `spec-${i}-key` && isEditing ? 'ring-2 ring-blue-500 ring-inset' : ''
                  }`}
                  onClick={(e) => {
                    if (isEditing) {
                      e.stopPropagation();
                      setSelectedElement(`spec-${i}-key`);
                    }
                  }}
                  onDoubleClick={(e) => {
                    if (isEditing) {
                      e.stopPropagation();
                      onEdit(`spec-${i}-key`);
                    }
                  }}
                >
                  {k}
                </td>
                <td 
                  className={`px-4 py-2 text-gray-800 ${
                    isEditing ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''
                  } ${
                    selectedElement === `spec-${i}-value` && isEditing ? 'ring-2 ring-blue-500 ring-inset' : ''
                  }`}
                  onClick={(e) => {
                    if (isEditing) {
                      e.stopPropagation();
                      setSelectedElement(`spec-${i}-value`);
                    }
                  }}
                  onDoubleClick={(e) => {
                    if (isEditing) {
                      e.stopPropagation();
                      onEdit(`spec-${i}-value`);
                    }
                  }}
                >
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EditableElement>
  );
}

function CTA({ isEditing, onEdit, onMove, selectedElement, setSelectedElement }) {
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
      >
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add to Cart
        </button>
      </EditableElement>
    </EditableElement>
  );
}

export default function EditableTemplatePreview({ 
  layoutType = 'gallery-focused', 
  content, 
  images,
  isEditing = false,
  onContentChange
}) {
  const [editingElement, setEditingElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [elementPositions, setElementPositions] = useState({});
  const [elementStyles, setElementStyles] = useState({});

  // Handle clicking outside to deselect
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
    setElementPositions(prev => ({
      ...prev,
      [elementId]: position
    }));
  };

  const handleResize = (elementId, size) => {
    console.log('Resize:', elementId, size);
  };

  const handleTextSave = (newText, newStyle) => {
    setElementStyles(prev => ({
      ...prev,
      [editingElement]: newStyle
    }));
    
    if (onContentChange) {
      onContentChange(editingElement, newText, newStyle);
    }
    
    setEditingElement(null);
  };

  const getCurrentText = (elementId) => {
    switch (elementId) {
      case 'hero-title':
        return content?.title || 'Product Title';
      case 'hero-description':
        return content?.description || 'Product description will appear here.';
      case 'features-title':
        return 'Key Features';
      case 'specs-title':
        return 'Specifications';
      case 'cta-button':
        return 'Add to Cart';
      default:
        if (elementId?.startsWith('spec-') && elementId?.includes('-key')) {
          const index = parseInt(elementId.split('-')[1]);
          const entries = Object.entries(content?.specifications || {});
          return entries[index]?.[0] || 'Specification';
        }
        if (elementId?.startsWith('spec-') && elementId?.includes('-value')) {
          const index = parseInt(elementId.split('-')[1]);
          const entries = Object.entries(content?.specifications || {});
          return entries[index]?.[1] || 'Value';
        }
        return 'Edit this text';
    }
  };

  const getCurrentStyle = (elementId) => {
    return elementStyles[elementId] || {};
  };

  if (layoutType === 'gallery-focused') {
    return (
      <div 
        className="min-h-screen bg-white flex flex-col" 
        onClick={handleContainerClick}
      >
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
              />
              <Features 
                features={content?.features} 
                featureExplanations={content?.featureExplanations}
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
              />
              <Specs 
                specifications={content?.specifications}
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
              />
              <CTA 
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
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