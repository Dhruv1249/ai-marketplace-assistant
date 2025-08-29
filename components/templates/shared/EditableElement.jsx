"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function EditableElement({
  elementId,
  currentText,
  currentStyle = {},
  setSelectedElement,
  children,
  className = "",
  onTextChange,
  onStyleChange,
  isEditing = false,
  ...props
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editValue, setEditValue] = useState('');
  const elementRef = useRef(null);
  const inputRef = useRef(null);

  // Extract text content from children if currentText is not provided
  const getTextContent = () => {
    if (currentText) return currentText;
    if (typeof children === 'string') return children;
    if (React.isValidElement(children)) {
      return children.props.children || '';
    }
    return '';
  };

  const handleClick = (e) => {
    if (!isEditing) return;
    
    e.stopPropagation();
    setIsSelected(true);
    if (setSelectedElement) {
      setSelectedElement(elementId);
    }
  };

  const handleDoubleClick = (e) => {
    if (!isEditing) return;
    
    e.stopPropagation();
    setIsEditingText(true);
    setEditValue(getTextContent());
  };

  const handleTextSave = () => {
    if (onTextChange) {
      onTextChange(elementId, editValue);
    }
    setIsEditingText(false);
  };

  const handleTextCancel = () => {
    setIsEditingText(false);
    setEditValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTextSave();
    } else if (e.key === 'Escape') {
      handleTextCancel();
    }
  };

  useEffect(() => {
    if (isEditingText && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingText]);

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (elementRef.current && !elementRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected]);

  const combinedClassName = `
    ${className}
    ${isEditing ? 'cursor-pointer' : ''}
    ${isSelected ? 'outline outline-2 outline-blue-500 outline-offset-2 bg-blue-50' : ''}
    ${isEditing ? 'hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 hover:bg-blue-25 transition-all' : ''}
  `.trim().replace(/\s+/g, ' ');

  if (isEditingText) {
    return (
      <div ref={elementRef} className="relative">
        <div className="absolute -top-6 left-0 text-xs text-blue-600 bg-white px-2 rounded border border-blue-200 z-10">
          Editing: {elementId}
        </div>
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleTextSave}
          className="w-full px-3 py-2 border-2 border-blue-500 rounded focus:outline-none resize-none"
          rows={Math.min(Math.max(editValue.split('\n').length, 1), 8)}
          placeholder="Edit text content... (Ctrl+Enter to save, Escape to cancel)"
        />
        <div className="text-xs text-gray-500 mt-1">
          Ctrl+Enter to save • Escape to cancel
        </div>
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={combinedClassName}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={currentStyle}
      {...props}
    >
      {children}
      {isSelected && isEditing && (
        <div className="absolute -top-6 left-0 text-xs text-blue-600 bg-white px-2 rounded border border-blue-200 z-10">
          Selected: {elementId} (double-click to edit)
        </div>
      )}
    </div>
  );
}