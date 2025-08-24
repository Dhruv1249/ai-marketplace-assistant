'use client';

import React, { useState, useRef, useEffect } from 'react';
import ImageGallery from '@/components/ui/ImageGallery';

const EnhancedJSONModelRenderer = ({ model, content, images, isEditing, onUpdate, onComponentSelect, selectedComponentId }) => {
  console.log('EnhancedJSONModelRenderer inputs:', { model, content, images, isEditing });

  const [editingText, setEditingText] = useState(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef(null);

  if (!model) {
    console.error('Invalid model: model is undefined or null', model);
    return <div>Invalid template model: Model is missing</div>;
  }
  if (!model.component) {
    console.error('Invalid model: missing component', model);
    return <div>Invalid template model: Component is missing</div>;
  }

  // Handle text editing
  const handleTextEdit = (componentId, currentText) => {
    if (!isEditing) return;
    
    setEditingText(componentId);
    setEditValue(currentText);
  };

  const handleTextSave = (componentId) => {
    if (onUpdate) {
      // Update the component text
      const updatedModel = updateComponentText(model, componentId, editValue);
      onUpdate(updatedModel);
    }
    setEditingText(null);
    setEditValue('');
  };

  const handleTextCancel = () => {
    setEditingText(null);
    setEditValue('');
  };

  // Update component text in the model
  const updateComponentText = (model, targetId, newText) => {
    const updateNode = (node) => {
      if (!node) return node;
      
      if (Array.isArray(node)) {
        return node.map(updateNode);
      }
      
      if (typeof node === 'object' && node !== null) {
        if (node.id === targetId && node.children && Array.isArray(node.children)) {
          return {
            ...node,
            children: [newText]
          };
        }
        
        const updated = { ...node };
        if (updated.children) {
          updated.children = updateNode(updated.children);
        }
        return updated;
      }
      
      return node;
    };

    return {
      ...model,
      component: updateNode(model.component)
    };
  };

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingText && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingText]);

  const processTemplateString = (str, context) => {
    if (typeof str !== 'string' || !str.includes('{{')) {
      return str;
    }

    let result = str;
    const matches = result.match(/\{\{([^}]+)\}\}/g);
    if (matches) {
      matches.forEach(match => {
        const expressionStr = match.slice(2, -2).trim();
        try {
          let value = '';
          
          // Handle simple property access
          if (expressionStr.startsWith('content.')) {
            const path = expressionStr.split('.');
            let obj = context;
            for (const key of path) {
              obj = obj?.[key];
            }
            value = obj || '';
          } else if (expressionStr.startsWith('images[')) {
            const indexMatch = expressionStr.match(/images\[(\d+)\]/);
            if (indexMatch) {
              const index = parseInt(indexMatch[1]);
              value = context.images?.[index] || '';
            }
          }
          
          result = result.replace(match, value);
        } catch (e) {
          console.error('Template processing error:', e, expressionStr);
          result = result.replace(match, '');
        }
      });
    }
    return result;
  };

  const generateFeatureComponents = (features, featureExplanations, template = 'gallery-focused') => {
    if (!features || !Array.isArray(features)) return [];
    
    // Enhanced feature styling with more options
    const containerClass = 'border-l-4 border-blue-400 pl-4 mb-4 hover:border-blue-500 transition-colors';
    const titleClass = 'font-medium mb-1 text-gray-900';
    const explanationClass = 'text-sm leading-relaxed text-gray-600';
    
    return features.map((feature, index) => ({
      id: `feature-${index}`,
      type: 'div',
      props: { className: containerClass },
      children: [
        {
          id: `feature-${index}-title`,
          type: 'h4',
          props: { className: titleClass },
          children: [feature],
          editable: { contentEditable: true }
        },
        ...(featureExplanations?.[feature] ? [{
          id: `feature-${index}-explanation`,
          type: 'p',
          props: { className: explanationClass },
          children: [featureExplanations[feature]],
          editable: { contentEditable: true }
        }] : [])
      ]
    }));
  };

  const generateSpecComponents = (specifications) => {
    if (!specifications || typeof specifications !== 'object') return [];
    
    const entries = Object.entries(specifications);
    
    return entries.map(([key, value], index) => ({
      id: `spec-${index}`,
      type: 'tr',
      props: { className: 'hover:bg-gray-50 transition-colors' },
      children: [
        {
          id: `spec-${index}-key`,
          type: 'td',
          props: { className: 'px-4 py-2 bg-gray-50 font-medium w-1/3' },
          children: [key],
          editable: { contentEditable: true }
        },
        {
          id: `spec-${index}-value`,
          type: 'td',
          props: { className: 'px-4 py-2' },
          children: [value],
          editable: { contentEditable: true }
        }
      ]
    }));
  };

  const processNode = (node, context) => {
    if (!node) return null;

    // Handle string nodes
    if (typeof node === 'string') {
      return processTemplateString(node, context);
    }

    // Handle array nodes
    if (Array.isArray(node)) {
      return node.map(child => processNode(child, context)).filter(Boolean);
    }

    // Handle object nodes (components)
    if (typeof node === 'object' && node !== null) {
      const processedNode = { ...node };

      // Process props
      if (processedNode.props) {
        processedNode.props = { ...processedNode.props };
        for (const key in processedNode.props) {
          if (typeof processedNode.props[key] === 'string') {
            processedNode.props[key] = processTemplateString(processedNode.props[key], context);
          }
        }
      }

      // Process children
      if (processedNode.children) {
        if (typeof processedNode.children === 'string') {
          // Check for special dynamic content patterns
          if (processedNode.children.includes('content.features') && processedNode.children.includes('map')) {
            processedNode.children = generateFeatureComponents(context.content?.features, context.content?.featureExplanations);
          } else if (processedNode.children.includes('content.specifications') && processedNode.children.includes('entries')) {
            processedNode.children = generateSpecComponents(context.content?.specifications);
          } else {
            // Regular template string processing
            processedNode.children = processTemplateString(processedNode.children, context);
          }
        } else if (Array.isArray(processedNode.children)) {
          processedNode.children = processedNode.children.map(child => processNode(child, context)).filter(Boolean);
        } else {
          processedNode.children = processNode(processedNode.children, context);
        }
      }

      return processedNode;
    }

    return node;
  };

  const renderComponent = (comp, key = 0) => {
    if (!comp) return null;

    // Handle arrays of components
    if (Array.isArray(comp)) {
      return comp.map((child, index) => renderComponent(child, `${key}-${index}`));
    }

    // Handle string content
    if (typeof comp === 'string') {
      return comp;
    }

    // Handle component objects
    if (typeof comp === 'object' && comp.type) {
      const { type, props = {}, children, id, editable } = comp;
      
      // Handle gallery sections
      if (id && (id.includes('gallery') || id.includes('image')) && type === 'div') {
        const templateType = model?.metadata?.template || 'gallery-focused';
        return (
          <ImageGallery
            key={key}
            images={images || []}
            template={templateType}
            className={props?.className || ''}
          />
        );
      }
      
      // Enhanced props with better support for AI-generated features
      const enhancedProps = { ...props };
      
      // Add editing capabilities
      if (isEditing && editable?.contentEditable) {
        enhancedProps.onClick = (e) => {
          e.stopPropagation();
          if (onComponentSelect) {
            onComponentSelect(comp);
          }
        };
        
        enhancedProps.className = `${enhancedProps.className || ''} cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 transition-all`.trim();
        
        if (selectedComponentId === id) {
          enhancedProps.className += ' outline outline-2 outline-blue-500 outline-offset-2';
        }
      }
      
      // Support for CSS animations and effects
      if (enhancedProps.style) {
        // Allow most CSS properties but sanitize dangerous ones
        const { 
          position, 
          zIndex, 
          ...safeStyle 
        } = enhancedProps.style;
        
        // Keep safe styles and some positioning
        enhancedProps.style = {
          ...safeStyle,
          ...(position === 'relative' || position === 'absolute' ? { position } : {}),
          ...(zIndex && zIndex < 1000 ? { zIndex } : {})
        };
      }
      
      // Map component types to HTML elements
      const elementMap = {
        'div': 'div',
        'section': 'section',
        'article': 'article',
        'header': 'header',
        'footer': 'footer',
        'main': 'main',
        'aside': 'aside',
        'nav': 'nav',
        'h1': 'h1',
        'h2': 'h2',
        'h3': 'h3',
        'h4': 'h4',
        'h5': 'h5',
        'h6': 'h6',
        'p': 'p',
        'span': 'span',
        'a': 'a',
        'img': 'img',
        'button': 'button',
        'input': 'input',
        'textarea': 'textarea',
        'select': 'select',
        'ul': 'ul',
        'ol': 'ol',
        'li': 'li',
        'table': 'table',
        'thead': 'thead',
        'tbody': 'tbody',
        'tr': 'tr',
        'th': 'th',
        'td': 'td',
        'svg': 'svg',
        'path': 'path'
      };
      
      const Component = elementMap[type] || 'div';

      // Check if this is a void element that cannot have children
      const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr', 'path'];
      const isVoidElement = voidElements.includes(type);

      // Handle text editing for editable components
      if (isEditing && editable?.contentEditable && editingText === id) {
        const currentText = Array.isArray(children) ? children[0] : children;
        
        return (
          <div key={key} className="relative">
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSave(id);
                } else if (e.key === 'Escape') {
                  handleTextCancel();
                }
              }}
              onBlur={() => handleTextSave(id)}
              className="w-full px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
            />
          </div>
        );
      }

      // Process children only for non-void elements
      let renderedChildren = null;
      if (!isVoidElement && children) {
        if (Array.isArray(children)) {
          renderedChildren = children.map((child, index) => {
            // Handle text editing
            if (typeof child === 'string' && isEditing && editable?.contentEditable) {
              return (
                <span
                  key={`${key}-child-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTextEdit(id, child);
                  }}
                  className="cursor-text hover:bg-blue-50 px-1 rounded"
                >
                  {child}
                </span>
              );
            }
            return renderComponent(child, `${key}-child-${index}`);
          });
        } else {
          if (typeof children === 'string' && isEditing && editable?.contentEditable) {
            renderedChildren = (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleTextEdit(id, children);
                }}
                className="cursor-text hover:bg-blue-50 px-1 rounded"
              >
                {children}
              </span>
            );
          } else {
            renderedChildren = renderComponent(children, `${key}-child`);
          }
        }
      }

      // Render void elements without children
      if (isVoidElement) {
        return <Component key={key} {...enhancedProps} />;
      }

      return (
        <Component key={key} {...enhancedProps}>
          {renderedChildren}
        </Component>
      );
    }

    return null;
  };

  // Process the entire component tree
  const context = { content, images };
  const processedComponent = processNode(model.component, context);
  
  console.log('Processed component:', processedComponent);

  return <div>{renderComponent(processedComponent)}</div>;
};

export default EnhancedJSONModelRenderer;