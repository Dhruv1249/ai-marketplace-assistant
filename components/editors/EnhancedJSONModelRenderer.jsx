'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ImageGallery from '@/components/ui/ImageGallery';

const EnhancedJSONModelRenderer = ({ model, content, images, isEditing, onUpdate, onComponentSelect, selectedComponentId }) => {
  console.log('EnhancedJSONModelRenderer inputs:', { model, content, images, isEditing });

  // State Management
  const [editingText, setEditingText] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [componentState, setComponentState] = useState({});
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const editInputRef = useRef(null);

  if (!model) {
    console.error('Invalid model: model is undefined or null', model);
    return <div>Invalid template model: Model is missing</div>;
  }
  if (!model.component) {
    console.error('Invalid model: missing component', model);
    return <div>Invalid template model: Component is missing</div>;
  }

  // State Management Functions
  const updateComponentState = useCallback((key, value) => {
    setComponentState(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Event Handlers
  const eventHandlers = useMemo(() => ({
    handleClick: (e, componentId) => {
      console.log('Click handled for:', componentId);
      updateComponentState(`${componentId}_clicked`, true);
    },
    
    handleToggle: (componentId) => {
      const currentState = componentState[`${componentId}_active`] || false;
      updateComponentState(`${componentId}_active`, !currentState);
    },
    
    handleFormSubmit: (e, formId) => {
      e.preventDefault();
      console.log('Form submitted:', formId, formData);
      const newErrors = {};
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.name) newErrors.name = 'Name is required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      updateComponentState(`${formId}_submitted`, true);
    },
    
    handleInputChange: (e, field) => {
      updateFormData(field, e.target.value);
    }
  }), [componentState, formData, updateComponentState, updateFormData]);

  // Template Expression Evaluator
  const evaluateExpression = useCallback((expression, context, depth = 0) => {
    if (depth > 10) return expression;
    
    try {
      if (expression.startsWith('content.')) {
        const path = expression.replace('content.', '').split('.');
        let obj = context.content;
        for (const key of path) {
          obj = obj?.[key];
        }
        return obj || '';
      }
      
      if (expression.startsWith('images[')) {
        const indexMatch = expression.match(/images\[(\d+)\]/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1]);
          return context.images?.[index] || '';
        }
      }
      
      if (expression.startsWith('state.')) {
        const key = expression.replace('state.', '');
        return componentState[key];
      }
      
      if (expression.startsWith('formData.')) {
        const key = expression.replace('formData.', '');
        return formData[key] || '';
      }
      
      if (expression.includes('?') && expression.includes(':')) {
        const conditionMatch = expression.match(/(.+?)\s*\?\s*(.+?)\s*:\s*(.+)/);
        if (conditionMatch) {
          const [, condition, trueValue, falseValue] = conditionMatch;
          const conditionResult = evaluateExpression(condition.trim(), context, depth + 1);
          return conditionResult ? evaluateExpression(trueValue.trim(), context, depth + 1) : evaluateExpression(falseValue.trim(), context, depth + 1);
        }
      }
      
      if (expression.includes('||')) {
        const [primary, fallback] = expression.split('||').map(s => s.trim());
        const primaryValue = evaluateExpression(primary, context, depth + 1);
        return primaryValue || evaluateExpression(fallback, context, depth + 1);
      }
      
      if (expression.startsWith('"') && expression.endsWith('"')) {
        return expression.slice(1, -1);
      }
      if (expression.startsWith("'") && expression.endsWith("'")) {
        return expression.slice(1, -1);
      }
      if (!isNaN(expression)) {
        return Number(expression);
      }
      if (expression === 'true') return true;
      if (expression === 'false') return false;
      if (expression === 'null') return null;
      
      return expression;
    } catch (error) {
      console.warn('Expression evaluation error:', error.message, expression);
      return '';
    }
  }, [componentState, formData]);

  // Template String Processing
  const processTemplateString = useCallback((str, context, depth = 0) => {
    if (typeof str !== 'string' || !str.includes('{{') || depth > 5) {
      return str;
    }

    let result = str;
    const matches = result.match(/\{\{([^}]+)\}\}/g);
    if (matches) {
      matches.forEach(match => {
        const expressionStr = match.slice(2, -2).trim();
        try {
          let value = evaluateExpression(expressionStr, context, depth);
          result = result.replace(match, value || '');
        } catch (e) {
          console.warn('Template processing error:', e.message, expressionStr);
          result = result.replace(match, '');
        }
      });
    }
    return result;
  }, [evaluateExpression]);

  // Conditional Rendering Handler
  const handleConditionalRendering = useCallback((node, context) => {
    if (!node || typeof node !== 'object') return node;
    
    if (node.if) {
      const condition = evaluateExpression(node.if, context);
      if (!condition) return null;
    }
    
    if (node.unless) {
      const condition = evaluateExpression(node.unless, context);
      if (condition) return null;
    }
    
    if (node.show !== undefined) {
      const shouldShow = evaluateExpression(node.show, context);
      if (!shouldShow) return null;
    }
    
    return node;
  }, [evaluateExpression]);

  // Event Handler Processor
  const processEventHandlers = useCallback((props, componentId) => {
    const processedProps = { ...props };
    
    Object.keys(processedProps).forEach(key => {
      if (key.startsWith('on') && typeof processedProps[key] === 'string') {
        const handlerString = processedProps[key];
        const handlerName = handlerString.replace(/[{}]/g, '').trim();
        
        if (handlerName === 'handleToggle') {
          processedProps[key] = (e) => {
            e.stopPropagation();
            eventHandlers.handleToggle(componentId);
          };
        } else if (handlerName === 'handleClick') {
          processedProps[key] = (e) => {
            e.stopPropagation();
            eventHandlers.handleClick(e, componentId);
          };
        } else if (handlerName === 'handleFormSubmit') {
          processedProps[key] = (e) => eventHandlers.handleFormSubmit(e, componentId);
        } else {
          processedProps[key] = (e) => {
            e.stopPropagation();
            console.log('Event triggered:', handlerName, componentId);
            eventHandlers.handleClick(e, componentId);
          };
        }
      }
    });
    
    return processedProps;
  }, [eventHandlers]);

  // Simple Feature Components (no complex state)
  const generateFeatureComponents = useCallback((features, featureExplanations) => {
    if (!features || !Array.isArray(features)) return [];
    
    return features.map((feature, index) => ({
      id: `feature-${index}`,
      type: 'div',
      props: { 
        className: 'border-l-4 border-blue-400 pl-4 mb-4 hover:border-blue-500 transition-colors duration-300'
      },
      children: [
        {
          id: `feature-${index}-title`,
          type: 'h4',
          props: { className: 'font-medium mb-1 text-gray-900' },
          children: [feature],
          editable: { contentEditable: true }
        },
        ...(featureExplanations?.[feature] ? [{
          id: `feature-${index}-explanation`,
          type: 'p',
          props: { className: 'text-sm leading-relaxed text-gray-600' },
          children: [featureExplanations[feature]],
          editable: { contentEditable: true }
        }] : [])
      ]
    }));
  }, []);

  // Context-aware Specifications Components
  const generateSpecComponents = useCallback((specifications, parentContext = null) => {
    if (!specifications || typeof specifications !== 'object') return [];
    
    const entries = Object.entries(specifications);
    
    // Check if we're inside a table structure
    const isTableContext = parentContext?.type === 'tbody' || parentContext?.type === 'table';
    
    if (isTableContext) {
      // Generate proper table rows
      return entries.map(([key, value], index) => ({
        id: `spec-${index}`,
        type: 'tr',
        props: { 
          className: 'hover:bg-gray-50 transition-colors duration-200'
        },
        children: [
          {
            id: `spec-${index}-key`,
            type: 'td',
            props: { 
              className: 'px-6 py-4 font-medium text-gray-900'
            },
            children: [key],
            editable: { contentEditable: true }
          },
          {
            id: `spec-${index}-value`,
            type: 'td',
            props: { 
              className: 'px-6 py-4 text-gray-600'
            },
            children: [value],
            editable: { contentEditable: true }
          }
        ]
      }));
    } else {
      // Generate div-based layout
      return entries.map(([key, value], index) => ({
        id: `spec-${index}`,
        type: 'div',
        props: { 
          className: 'flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200'
        },
        children: [
          {
            id: `spec-${index}-key`,
            type: 'div',
            props: { 
              className: 'font-medium text-gray-900'
            },
            children: [key],
            editable: { contentEditable: true }
          },
          {
            id: `spec-${index}-value`,
            type: 'div',
            props: { 
              className: 'text-gray-600'
            },
            children: [value],
            editable: { contentEditable: true }
          }
        ]
      }));
    }
  }, []);

  // Text editing functions
  const handleTextEdit = (componentId, currentText) => {
    if (!isEditing) return;
    setEditingText(componentId);
    setEditValue(currentText);
  };

  const handleTextSave = (componentId) => {
    if (onUpdate) {
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

  useEffect(() => {
    if (editingText && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingText]);

  // Enhanced Node Processing with parent context
  const processNode = useCallback((node, context, parentNode = null) => {
    if (!node) return null;

    const conditionalNode = handleConditionalRendering(node, context);
    if (!conditionalNode) return null;

    if (typeof node === 'string') {
      return processTemplateString(node, context);
    }

    if (Array.isArray(node)) {
      return node.map(child => processNode(child, context, parentNode)).filter(Boolean);
    }

    if (typeof node === 'object' && node !== null) {
      const processedNode = { ...node };

      if (processedNode.props) {
        processedNode.props = { ...processedNode.props };
        
        for (const key in processedNode.props) {
          if (typeof processedNode.props[key] === 'string') {
            processedNode.props[key] = processTemplateString(processedNode.props[key], context);
          }
        }
        
        processedNode.props = processEventHandlers(processedNode.props, processedNode.id);
      }

      if (processedNode.children) {
        if (typeof processedNode.children === 'string') {
          if (processedNode.children.includes('content.features') && processedNode.children.includes('map')) {
            processedNode.children = generateFeatureComponents(context.content?.features, context.content?.featureExplanations);
          } else if (processedNode.children.includes('content.specifications') && processedNode.children.includes('entries')) {
            // Pass parent context to determine table vs div structure
            processedNode.children = generateSpecComponents(context.content?.specifications, processedNode);
          } else if (processedNode.children.includes('Object.entries(content.specifications)')) {
            processedNode.children = generateSpecComponents(context.content?.specifications, processedNode);
          } else if (processedNode.children.includes('gallery.component')) {
            processedNode.children = [];
          } else {
            processedNode.children = processTemplateString(processedNode.children, context);
          }
        } else if (Array.isArray(processedNode.children)) {
          processedNode.children = processedNode.children.map(child => processNode(child, context, processedNode)).filter(Boolean);
        } else {
          processedNode.children = processNode(processedNode.children, context, processedNode);
        }
      }

      return processedNode;
    }

    return node;
  }, [handleConditionalRendering, processTemplateString, processEventHandlers, generateFeatureComponents, generateSpecComponents]);

  // Component Rendering
  const renderComponent = useCallback((comp, key = 0) => {
    if (!comp) return null;

    if (Array.isArray(comp)) {
      return comp.map((child, index) => renderComponent(child, `${key}-${index}`));
    }

    if (typeof comp === 'string') {
      return comp;
    }

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
      
      const enhancedProps = { ...props };
      
      // Add editing capabilities
      if (isEditing && editable?.contentEditable) {
        const originalOnClick = enhancedProps.onClick;
        enhancedProps.onClick = (e) => {
          e.stopPropagation();
          if (originalOnClick && typeof originalOnClick === 'function') {
            originalOnClick(e);
          }
          if (onComponentSelect) {
            onComponentSelect(comp);
          }
        };
        
        enhancedProps.className = `${enhancedProps.className || ''} cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 transition-all`.trim();
        
        if (selectedComponentId === id) {
          enhancedProps.className += ' outline outline-2 outline-blue-500 outline-offset-2';
        }
      }
      
      // Clean up className
      if (enhancedProps.className) {
        enhancedProps.className = enhancedProps.className
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Form handling
      if (type === 'form') {
        enhancedProps.onSubmit = (e) => eventHandlers.handleFormSubmit(e, id);
      }
      
      // Input handling
      if (type === 'input' || type === 'textarea') {
        const fieldName = enhancedProps.name || id;
        enhancedProps.value = formData[fieldName] || '';
        enhancedProps.onChange = (e) => eventHandlers.handleInputChange(e, fieldName);
        
        if (errors[fieldName]) {
          enhancedProps.className = `${enhancedProps.className || ''} border-red-500`.trim();
        }
      }
      
      // Map component types to HTML elements
      const elementMap = {
        'div': 'div', 'section': 'section', 'article': 'article', 'header': 'header',
        'footer': 'footer', 'main': 'main', 'aside': 'aside', 'nav': 'nav',
        'h1': 'h1', 'h2': 'h2', 'h3': 'h3', 'h4': 'h4', 'h5': 'h5', 'h6': 'h6',
        'p': 'p', 'span': 'span', 'a': 'a', 'img': 'img', 'button': 'button',
        'input': 'input', 'textarea': 'textarea', 'select': 'select', 'form': 'form',
        'ul': 'ul', 'ol': 'ol', 'li': 'li', 'table': 'table', 'thead': 'thead',
        'tbody': 'tbody', 'tr': 'tr', 'th': 'th', 'td': 'td', 'svg': 'svg', 'path': 'path',
        'label': 'label'
      };
      
      const Component = elementMap[type] || 'div';
      const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr', 'path'];
      const isVoidElement = voidElements.includes(type);

      // Handle text editing
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

      // Process children
      let renderedChildren = null;
      if (!isVoidElement && children) {
        if (Array.isArray(children)) {
          renderedChildren = children.map((child, index) => {
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

      // Add error display for form fields
      if ((type === 'input' || type === 'textarea') && errors[enhancedProps.name || id]) {
        const errorElement = (
          <div key={`${key}-error`} className="text-red-500 text-sm mt-1">
            {errors[enhancedProps.name || id]}
          </div>
        );
        
        if (isVoidElement) {
          return (
            <div key={key}>
              <Component {...enhancedProps} />
              {errorElement}
            </div>
          );
        } else {
          return (
            <div key={key}>
              <Component {...enhancedProps}>
                {renderedChildren}
              </Component>
              {errorElement}
            </div>
          );
        }
      }

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
  }, [model, images, isEditing, onComponentSelect, selectedComponentId, editingText, editValue, componentState, formData, errors, eventHandlers, handleTextEdit, handleTextSave, handleTextCancel]);

  // Process the entire component tree
  const enhancedContext = useMemo(() => ({
    content,
    images,
    state: componentState,
    formData,
    errors
  }), [content, images, componentState, formData, errors]);

  const processedComponent = useMemo(() => {
    return processNode(model.component, enhancedContext);
  }, [model.component, enhancedContext, processNode]);
  
  console.log('Processed component:', processedComponent);

  return <div>{renderComponent(processedComponent)}</div>;
};

export default EnhancedJSONModelRenderer;