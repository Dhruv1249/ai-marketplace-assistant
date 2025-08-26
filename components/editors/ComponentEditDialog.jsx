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
    title: ''
  });
  
  const [activeTab, setActiveTab] = useState('content');
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: 'left'
  });
  
  const [links, setLinks] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);
  const dialogRef = useRef(null);

  // Initialize form data when component changes
  useEffect(() => {
    if (component && isOpen) {
      const text = Array.isArray(component.children) 
        ? component.children.join(' ') 
        : (component.children || '');
      
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

  // Apply text formatting at cursor position
  const applyTextFormatting = (formatType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.text.substring(start, end);
    
    if (!selectedText) return;
    
    let formattedText = selectedText;
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
    }
    
    const newText = formData.text.substring(0, start) + formattedText + formData.text.substring(end);
    handleInputChange('text', newText);
    
    // Set cursor position after formatted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
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

  // Handle save
  const handleSave = () => {
    if (!component) return;
    
    // Process text to include links
    let processedText = formData.text;
    
    // Create updated component
    const updatedComponent = {
      ...component,
      children: [processedText],
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
      console.log('Saving component:', updatedComponent);
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
    setShowPreview(false);
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
                  <p className="text-xs text-gray-500 mt-1">
                    Use **bold**, *italic*, and [link text](url) for formatting
                  </p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSS Classes
                  </label>
                  <textarea
                    value={formData.className}
                    onChange={(e) => handleInputChange('className', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="text-lg font-bold text-blue-600 hover:text-blue-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter Tailwind CSS classes separated by spaces
                  </p>
                </div>

                {/* Quick Style Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quick Styles
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Text Size */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Text Size</label>
                      <select
                        onChange={(e) => {
                          const newClassName = formData.className
                            .replace(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                          handleInputChange('className', `${newClassName} ${e.target.value}`.trim());
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">Default</option>
                        <option value="text-xs">Extra Small</option>
                        <option value="text-sm">Small</option>
                        <option value="text-base">Base</option>
                        <option value="text-lg">Large</option>
                        <option value="text-xl">Extra Large</option>
                        <option value="text-2xl">2X Large</option>
                        <option value="text-3xl">3X Large</option>
                      </select>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                      <select
                        onChange={(e) => {
                          const newClassName = formData.className
                            .replace(/\btext-(gray|red|blue|green|yellow|purple|pink|indigo)-(100|200|300|400|500|600|700|800|900)\b/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                          handleInputChange('className', `${newClassName} ${e.target.value}`.trim());
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">Default</option>
                        <option value="text-gray-600">Gray</option>
                        <option value="text-blue-600">Blue</option>
                        <option value="text-green-600">Green</option>
                        <option value="text-red-600">Red</option>
                        <option value="text-purple-600">Purple</option>
                        <option value="text-yellow-600">Yellow</option>
                      </select>
                    </div>

                    {/* Font Weight */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
                      <select
                        onChange={(e) => {
                          const newClassName = formData.className
                            .replace(/\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                          handleInputChange('className', `${newClassName} ${e.target.value}`.trim());
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">Default</option>
                        <option value="font-light">Light</option>
                        <option value="font-normal">Normal</option>
                        <option value="font-medium">Medium</option>
                        <option value="font-semibold">Semibold</option>
                        <option value="font-bold">Bold</option>
                      </select>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Background</label>
                      <select
                        onChange={(e) => {
                          const newClassName = formData.className
                            .replace(/\bbg-(gray|red|blue|green|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900)\b/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                          handleInputChange('className', `${newClassName} ${e.target.value}`.trim());
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">None</option>
                        <option value="bg-gray-100">Light Gray</option>
                        <option value="bg-blue-100">Light Blue</option>
                        <option value="bg-green-100">Light Green</option>
                        <option value="bg-red-100">Light Red</option>
                        <option value="bg-yellow-100">Light Yellow</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Links</h3>
                  <button
                    onClick={addLink}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Link
                  </button>
                </div>

                {links.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Link className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No links added yet</p>
                    <p className="text-sm">Click "Add Link" to create your first link</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {links.map((link) => (
                      <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Link Text
                              </label>
                              <input
                                type="text"
                                value={link.text}
                                onChange={(e) => updateLink(link.id, 'text', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Click here"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL
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
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Insert into text"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeLink(link.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove link"
                            >
                              <Trash2 className="w-4 h-4" />
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
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 border-l border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div 
                  className={formData.className}
                  dangerouslySetInnerHTML={{ __html: generatePreview() }}
                />
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <p><strong>Classes:</strong> {formData.className || 'None'}</p>
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