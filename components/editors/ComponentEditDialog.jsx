'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Type, Palette, Link, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const ComponentEditDialog = ({ 
  isOpen, 
  onClose, 
  component, 
  onSave,
  availableStyles = {},
  debug = false 
}) => {
  const [formData, setFormData] = useState({
    text: '',
    className: '',
    href: '',
    alt: '',
    src: '',
    placeholder: '',
    type: 'text',
    name: '',
    id: '',
    title: '',
    fontSize: '',
    textColor: '',
    backgroundColor: ''
  });
  
  const [activeTab, setActiveTab] = useState('content');
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: 'left'
  });
  
  const [links, setLinks] = useState([]);
  const [showPreview, setShowPreview] = useState(true); // FIXED: Default preview ON
  const textareaRef = useRef(null);
  const dialogRef = useRef(null);

  // FIXED: Better text extraction from component children
  const extractTextFromChildren = (children) => {
    if (!children) return '';
    
    if (typeof children === 'string') {
      return children;
    }
    
    if (Array.isArray(children)) {
      return children.map(child => {
        if (typeof child === 'string') {
          return child;
        } else if (typeof child === 'object' && child !== null) {
          // Handle object children by converting to string representation
          if (child.toString && typeof child.toString === 'function') {
            const str = child.toString();
            // Avoid [object Object] by checking if toString returns meaningful content
            if (str !== '[object Object]') {
              return str;
            }
          }
          // Try to extract text from nested structure
          if (child.children) {
            return extractTextFromChildren(child.children);
          }
          // Fallback: try to get any text content
          return JSON.stringify(child);
        }
        return String(child);
      }).join(' ');
    }
    
    if (typeof children === 'object' && children !== null) {
      // Handle single object child
      if (children.toString && typeof children.toString === 'function') {
        const str = children.toString();
        if (str !== '[object Object]') {
          return str;
        }
      }
      if (children.children) {
        return extractTextFromChildren(children.children);
      }
      // Last resort: stringify the object
      return JSON.stringify(children);
    }
    
    return String(children);
  };

  // Initialize form data when component changes
  useEffect(() => {
    if (component && isOpen) {
      // FIXED: Better text extraction to avoid [object Object]
      const text = extractTextFromChildren(component.children);
      
      console.log('=== COMPONENT EDIT DIALOG DEBUG ===');
      console.log('Component:', component);
      console.log('Raw children:', component.children);
      console.log('Extracted text:', text);
      console.log('====================================');
      
      setFormData({
        text: text,
        className: component.props?.className || '',
        href: component.props?.href || '',
        alt: component.props?.alt || '',
        src: component.props?.src || '',
        placeholder: component.props?.placeholder || '',
        type: component.props?.type || component.type || 'text',
        name: component.props?.name || '',
        id: component.id || '',
        title: component.props?.title || ''
      });

      // Extract existing links from text
      extractLinksFromText(text);
      
      // Detect text formatting from className
      detectTextFormatting(component.props?.className || '');
    }
  }, [component, isOpen]);

  // Extract links from text content
  const extractLinksFromText = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const foundLinks = [];
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
      foundLinks.push({
        id: Date.now() + Math.random(),
        text: match[1],
        url: match[2]
      });
    }
    
    setLinks(foundLinks);
  };

  // Detect text formatting from className
  const detectTextFormatting = (className) => {
    setTextFormatting({
      bold: className.includes('font-bold') || className.includes('font-semibold'),
      italic: className.includes('italic'),
      underline: className.includes('underline'),
      align: className.includes('text-center') ? 'center' : 
             className.includes('text-right') ? 'right' : 'left'
    });
  };

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle text formatting changes
  const handleFormatChange = (format, value) => {
    setTextFormatting(prev => ({
      ...prev,
      [format]: value
    }));
    
    // Update className based on formatting
    updateClassNameFromFormatting({ ...textFormatting, [format]: value });
  };

  // Update className based on text formatting
  const updateClassNameFromFormatting = (formatting) => {
    let className = formData.className;
    
    // Remove existing formatting classes
    className = className
      .replace(/\b(font-bold|font-semibold|italic|underline|text-left|text-center|text-right)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Add new formatting classes
    const formatClasses = [];
    if (formatting.bold) formatClasses.push('font-bold');
    if (formatting.italic) formatClasses.push('italic');
    if (formatting.underline) formatClasses.push('underline');
    if (formatting.align === 'center') formatClasses.push('text-center');
    else if (formatting.align === 'right') formatClasses.push('text-right');
    else formatClasses.push('text-left');
    
    const newClassName = [className, ...formatClasses].filter(Boolean).join(' ');
    handleInputChange('className', newClassName);
  };

  // Add a new link
  const addLink = () => {
    const newLink = {
      id: Date.now(),
      text: 'Link Text',
      url: 'https://example.com'
    };
    setLinks(prev => [...prev, newLink]);
  };

  // Update a link
  const updateLink = (id, field, value) => {
    setLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  // Remove a link
  const removeLink = (id) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  // Insert link into text at cursor position
  const insertLinkIntoText = (linkText, linkUrl) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.text;
    const linkMarkdown = `[${linkText}](${linkUrl})`;
    
    const newText = text.substring(0, start) + linkMarkdown + text.substring(end);
    handleInputChange('text', newText);
    
    // Set cursor position after inserted link
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
    }, 0);
  };

  // Apply text formatting using CSS classes instead of markdown
  const applyTextFormatting = (formatType) => {
    // Just update the CSS classes, don't modify the text
    let className = formData.className;
    
    switch (formatType) {
      case 'bold':
        if (className.includes('font-bold')) {
          className = className.replace(/\bfont-bold\b/g, '').replace(/\s+/g, ' ').trim();
        } else {
          className = `${className} font-bold`.trim();
        }
        break;
      case 'italic':
        if (className.includes('italic')) {
          className = className.replace(/\bitalic\b/g, '').replace(/\s+/g, ' ').trim();
        } else {
          className = `${className} italic`.trim();
        }
        break;
      case 'underline':
        if (className.includes('underline')) {
          className = className.replace(/\bunderline\b/g, '').replace(/\s+/g, ' ').trim();
        } else {
          className = `${className} underline`.trim();
        }
        break;
    }
    
    handleInputChange('className', className);
    detectTextFormatting(className);
  };

  // Generate preview of the component
  const generatePreview = () => {
    let processedText = formData.text;
    
    // Process markdown-style links
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    );
    
    // Process markdown-style formatting
    processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    processedText = processedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return processedText;
  };

  // Generate inline styles for custom colors and font size
  const generateInlineStyles = () => {
    const styles = {};
    
    if (formData.fontSize) {
      styles.fontSize = `${formData.fontSize}px`;
    }
    
    if (formData.textColor) {
      styles.color = formData.textColor;
    }
    
    if (formData.backgroundColor) {
      styles.backgroundColor = formData.backgroundColor;
    }
    
    return styles;
  };

  // FIXED: Handle save with proper text structure
  const handleSave = () => {
    if (!component) return;
    
    // Process text to include links
    let processedText = formData.text;
    
    // Create updated component with proper children structure
    const updatedComponent = {
      ...component,
      // FIXED: Ensure children is always an array of strings, not objects
      children: processedText ? [processedText] : [],
      props: {
        ...component.props,
        className: formData.className,
        ...(formData.href && { href: formData.href }),
        ...(formData.alt && { alt: formData.alt }),
        ...(formData.src && { src: formData.src }),
        ...(formData.placeholder && { placeholder: formData.placeholder }),
        ...(formData.name && { name: formData.name }),
        ...(formData.title && { title: formData.title }),
        ...(formData.type !== component.type && { type: formData.type })
      }
    };
    
    if (debug) {
      console.log('=== SAVING COMPONENT ===');
      console.log('Original component:', component);
      console.log('Updated component:', updatedComponent);
      console.log('Text being saved:', processedText);
      console.log('Children structure:', updatedComponent.children);
      console.log('========================');
    }
    
    onSave(updatedComponent);
    onClose();
  };

  // Handle dialog close
  const handleClose = () => {
    setFormData({
      text: '',
      className: '',
      href: '',
      alt: '',
      src: '',
      placeholder: '',
      type: 'text',
      name: '',
      id: '',
      title: ''
    });
    setLinks([]);
    setActiveTab('content');
    setShowPreview(true); // Reset to default ON
    onClose();
  };

  // Handle click outside dialog
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Component</h2>
            <p className="text-sm text-gray-500 mt-1">
              {component?.type} • {component?.id}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['content', 'style', 'links', 'properties'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="flex-1"></div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors ${
              showPreview ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
                      <button
                        onClick={() => applyTextFormatting('bold')}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                          textFormatting.bold ? 'bg-blue-100 text-blue-600' : ''
                        }`}
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => applyTextFormatting('italic')}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                          textFormatting.italic ? 'bg-blue-100 text-blue-600' : ''
                        }`}
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => applyTextFormatting('underline')}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                          textFormatting.underline ? 'bg-blue-100 text-blue-600' : ''
                        }`}
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      <button
                        onClick={() => handleFormatChange('align', 'left')}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                          textFormatting.align === 'left' ? 'bg-blue-100 text-blue-600' : ''
                        }`}
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFormatChange('align', 'center')}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                          textFormatting.align === 'center' ? 'bg-blue-100 text-blue-600' : ''
                        }`}
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFormatChange('align', 'right')}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                          textFormatting.align === 'right' ? 'bg-blue-100 text-blue-600' : ''
                        }`}
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={formData.text}
                      onChange={(e) => handleInputChange('text', e.target.value)}
                      className="w-full p-3 border-0 resize-none focus:outline-none"
                      rows={8}
                      placeholder="Enter your text content here..."
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg mt-2">
                    <p className="text-xs text-blue-800 font-medium mb-1">Text Formatting:</p>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>• Select text and click <strong>Bold</strong>, <em>Italic</em>, or <u>Underline</u> buttons</p>
                      <p>• Or type: **bold text**, *italic text*</p>
                      <p>• For links: Go to the "Links" tab to create them, then insert here</p>
                    </div>
                  </div>
                </div>

                {/* Component-specific fields */}
                {component?.type === 'img' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Source
                      </label>
                      <input
                        type="url"
                        value={formData.src}
                        onChange={(e) => handleInputChange('src', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={formData.alt}
                        onChange={(e) => handleInputChange('alt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the image"
                      />
                    </div>
                  </>
                )}

                {component?.type === 'a' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link URL
                    </label>
                    <input
                      type="url"
                      value={formData.href}
                      onChange={(e) => handleInputChange('href', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {(component?.type === 'input' || component?.type === 'textarea') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={formData.placeholder}
                        onChange={(e) => handleInputChange('placeholder', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter placeholder text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="fieldName"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                  <input
                    type="number"
                    value={formData.fontSize}
                    onChange={(e) => handleInputChange('fontSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="16"
                    min="8"
                    max="72"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.textColor || '#000000'}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor || '#ffffff'}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CSS Classes</label>
                  <textarea
                    value={formData.className}
                    onChange={(e) => handleInputChange('className', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="font-bold text-center p-4 rounded-lg"
                  />
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Links</h3>
                    <button
                      onClick={addLink}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </button>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-800 font-medium mb-1">How to use links:</p>
                    <div className="text-xs text-green-700 space-y-1">
                      <p>1. Click "Add Link" to create a new link</p>
                      <p>2. Enter the text you want to show (e.g., "Visit our website")</p>
                      <p>3. Enter the URL where it should go (e.g., "https://example.com")</p>
                      <p>4. Click the <strong>+</strong> button to insert it into your text</p>
                      <p>5. Go back to "Content" tab to see it in your text</p>
                    </div>
                  </div>
                </div>

                {links.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Link className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No links created yet</p>
                    <p className="text-sm">Click "Add Link" above to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {links.map((link) => (
                      <div key={link.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Link Text (what users will see)
                              </label>
                              <input
                                type="text"
                                value={link.text}
                                onChange={(e) => updateLink(link.id, 'text', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Click here to learn more"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL (where it goes)
                              </label>
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => insertLinkIntoText(link.text, link.url)}
                              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                              title="Insert this link into your text"
                            >
                              <Plus className="w-3 h-3" />
                              Insert
                            </button>
                            <button
                              onClick={() => removeLink(link.id)}
                              className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                              title="Delete this link"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Component ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="unique-id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (tooltip)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tooltip text"
                  />
                </div>

                {component?.type === 'input' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="password">Password</option>
                      <option value="number">Number</option>
                      <option value="tel">Phone</option>
                      <option value="url">URL</option>
                      <option value="search">Search</option>
                    </select>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Component Info</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Type:</strong> {component?.type}</p>
                    <p><strong>ID:</strong> {component?.id}</p>
                    <p><strong>Editable:</strong> {component?.editable?.contentEditable ? 'Yes' : 'No'}</p>
                    <p><strong>Children Type:</strong> {typeof component?.children}</p>
                    <p><strong>Children Length:</strong> {Array.isArray(component?.children) ? component.children.length : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FIXED: Preview Panel - Default ON */}
          {showPreview && (
            <div className="w-1/2 border-l border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div 
                  className={formData.className}
                  style={generateInlineStyles()}
                  dangerouslySetInnerHTML={{ __html: generatePreview() }}
                />
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <p><strong>Classes:</strong> {formData.className || 'None'}</p>
                <p><strong>Text Length:</strong> {formData.text.length} characters</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentEditDialog;