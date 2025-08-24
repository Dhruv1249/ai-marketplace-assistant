'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, useReducer } from 'react';
import ImageGallery from '@/components/ui/ImageGallery';

// Enhanced error boundary component
const ErrorBoundary = ({ children, fallback, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      setHasError(true);
      setError(error);
      onError?.(error, errorInfo);
    };

    // Reset error state when children change
    setHasError(false);
    setError(null);
  }, [children, onError]);

  if (hasError) {
    return fallback || (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Rendering Error</h3>
        <p className="text-red-600 text-sm">{error?.message || 'An error occurred while rendering this component'}</p>
        <button 
          onClick={() => setHasError(false)}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return children;
};

// State reducer for better state management
const stateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_COMPONENT_STATE':
      return {
        ...state,
        componentState: {
          ...state.componentState,
          [action.key]: action.value
        }
      };
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        },
        errors: {
          ...state.errors,
          [action.field]: null // Clear error when field is updated
        }
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.errors
        }
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {}
      };
    case 'RESET_STATE':
      return {
        componentState: {},
        formData: {},
        errors: {}
      };
    default:
      return state;
  }
};

const EnhancedJSONModelRenderer = ({ 
  model, 
  content, 
  images, 
  isEditing, 
  onUpdate, 
  onComponentSelect, 
  selectedComponentId,
  debug = false 
}) => {
  if (debug) {
    console.log('EnhancedJSONModelRenderer inputs:', { model, content, images, isEditing });
  }

  // Enhanced state management with reducer
  const [state, dispatch] = useReducer(stateReducer, {
    componentState: {},
    formData: {},
    errors: {}
  });

  // UI state
  const [editingText, setEditingText] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [renderError, setRenderError] = useState(null);
  
  const editInputRef = useRef(null);
  const renderCountRef = useRef(0);

  if (!model) {
    console.error('Invalid model: model is undefined or null', model);
    return <div>Invalid template model: Model is missing</div>;
  }
  if (!model.component) {
    console.error('Invalid model: missing component', model);
    return <div>Invalid template model: Component is missing</div>;
  }

  // Inject custom animations and ensure Tailwind animations work
  useEffect(() => {
    const styleId = 'enhanced-json-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Custom Keyframe Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }
        
        /* Custom Animation Classes */
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 0.6s ease-out forwards; }
        .animate-slideIn { animation: slideIn 0.6s ease-out forwards; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        
        /* Ensure Tailwind animations work */
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Enhanced State Management Functions
  const updateComponentState = useCallback((key, value) => {
    dispatch({ type: 'SET_COMPONENT_STATE', key, value });
  }, []);

  const updateFormData = useCallback((field, value) => {
    dispatch({ type: 'SET_FORM_DATA', field, value });
  }, []);

  const setFormErrors = useCallback((errors) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  // Enhanced Event Handlers with better error handling
  const eventHandlers = useMemo(() => ({
    handleClick: (e, componentId) => {
      try {
        if (debug) console.log('Click handled for:', componentId);
        updateComponentState(`${componentId}_clicked`, true);
      } catch (error) {
        console.error('Error in handleClick:', error);
        setRenderError(error);
      }
    },
    
    handleToggle: (componentId) => {
      try {
        const currentState = state.componentState[`${componentId}_active`] || false;
        updateComponentState(`${componentId}_active`, !currentState);
      } catch (error) {
        console.error('Error in handleToggle:', error);
        setRenderError(error);
      }
    },
    
    handleFormSubmit: (e, formId) => {
      e.preventDefault();
      try {
        if (debug) console.log('Form submitted:', formId, state.formData);
        
        // Enhanced form validation
        const newErrors = {};
        const { formData } = state;
        
        // Basic validation rules
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        
        if (!formData.name) {
          newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (Object.keys(newErrors).length > 0) {
          setFormErrors(newErrors);
          return;
        }
        
        // Clear errors and mark as submitted
        dispatch({ type: 'CLEAR_ERRORS' });
        updateComponentState(`${formId}_submitted`, true);
        
        // Optional callback for form submission
        if (typeof window !== 'undefined' && window.onFormSubmit) {
          window.onFormSubmit(formData);
        }
      } catch (error) {
        console.error('Error in handleFormSubmit:', error);
        setRenderError(error);
      }
    },
    
    handleInputChange: (e, field) => {
      try {
        const value = e.target.value;
        updateFormData(field, value);
        
        // Real-time validation for better UX
        if (field === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
          setFormErrors({ [field]: 'Please enter a valid email address' });
        } else if (field === 'name' && value && value.length < 2) {
          setFormErrors({ [field]: 'Name must be at least 2 characters' });
        }
      } catch (error) {
        console.error('Error in handleInputChange:', error);
        setRenderError(error);
      }
    }
  }), [state.componentState, state.formData, updateComponentState, updateFormData, setFormErrors, debug]);

  // Enhanced Template Expression Evaluator with better error handling
  const evaluateExpression = useCallback((expression, context, depth = 0) => {
    if (depth > 10) {
      console.warn('Expression evaluation depth exceeded:', expression);
      return expression;
    }
    
    try {
      // Handle content access
      if (expression.startsWith('content.')) {
        const path = expression.replace('content.', '').split('.');
        let obj = context.content;
        for (const key of path) {
          obj = obj?.[key];
        }
        return obj || '';
      }
      
      // Handle image access
      if (expression.startsWith('images[')) {
        const indexMatch = expression.match(/images\[(\d+)\]/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1]);
          return context.images?.[index] || '';
        }
      }
      
      // Handle state access - use new state structure
      if (expression.startsWith('state.')) {
        const key = expression.replace('state.', '');
        return state.componentState[key];
      }
      
      // Handle form data access - use new state structure
      if (expression.startsWith('formData.')) {
        const key = expression.replace('formData.', '');
        return state.formData[key] || '';
      }
      
      // Handle ternary expressions
      if (expression.includes('?') && expression.includes(':')) {
        const conditionMatch = expression.match(/(.+?)\s*\?\s*(.+?)\s*:\s*(.+)/);
        if (conditionMatch) {
          const [, condition, trueValue, falseValue] = conditionMatch;
          const conditionResult = evaluateExpression(condition.trim(), context, depth + 1);
          return conditionResult ? evaluateExpression(trueValue.trim(), context, depth + 1) : evaluateExpression(falseValue.trim(), context, depth + 1);
        }
      }
      
      // Handle fallback expressions
      if (expression.includes('||')) {
        const [primary, fallback] = expression.split('||').map(s => s.trim());
        const primaryValue = evaluateExpression(primary, context, depth + 1);
        return primaryValue || evaluateExpression(fallback, context, depth + 1);
      }
      
      // Handle string literals
      if (expression.startsWith('"') && expression.endsWith('"')) {
        return expression.slice(1, -1);
      }
      if (expression.startsWith("'") && expression.endsWith("'")) {
        return expression.slice(1, -1);
      }
      
      // Handle numbers
      if (!isNaN(expression) && expression.trim() !== '') {
        return Number(expression);
      }
      
      // Handle booleans and null
      if (expression === 'true') return true;
      if (expression === 'false') return false;
      if (expression === 'null') return null;
      if (expression === 'undefined') return undefined;
      
      return expression;
    } catch (error) {
      if (debug) {
        console.warn('Expression evaluation error:', error.message, expression);
      }
      return '';
    }
  }, [state.componentState, state.formData, debug]);

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
        enhancedProps.value = state.formData[fieldName] || '';
        enhancedProps.onChange = (e) => eventHandlers.handleInputChange(e, fieldName);
        
        if (state.errors[fieldName]) {
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
      if ((type === 'input' || type === 'textarea') && state.errors[enhancedProps.name || id]) {
        const errorElement = (
          <div key={`${key}-error`} className="text-red-500 text-sm mt-1">
            {state.errors[enhancedProps.name || id]}
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
  }, [model, images, isEditing, onComponentSelect, selectedComponentId, editingText, editValue, state.componentState, state.formData, state.errors, eventHandlers, handleTextEdit, handleTextSave, handleTextCancel]);

  // Process the entire component tree with updated context
  const enhancedContext = useMemo(() => ({
    content,
    images,
    state: state.componentState,
    formData: state.formData,
    errors: state.errors
  }), [content, images, state.componentState, state.formData, state.errors]);

  const processedComponent = useMemo(() => {
    try {
      renderCountRef.current += 1;
      if (debug) {
        console.log(`Render #${renderCountRef.current} - Processing component tree`);
      }
      return processNode(model.component, enhancedContext);
    } catch (error) {
      console.error('Error processing component tree:', error);
      setRenderError(error);
      return null;
    }
  }, [model.component, enhancedContext, processNode, debug]);
  
  if (debug) {
    console.log('Processed component:', processedComponent);
  }

  // Show render error if one occurred
  if (renderError) {
    return (
      <ErrorBoundary
        onError={(error) => console.error('Render error:', error)}
        fallback={
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">JSON Renderer Error</h3>
            <p className="text-red-600 text-sm mb-2">{renderError.message}</p>
            <button 
              onClick={() => setRenderError(null)}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Clear Error
            </button>
          </div>
        }
      >
        <div>Error occurred during rendering</div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Component render error:', error);
        setRenderError(error);
      }}
    >
      <div className="json-model-renderer">
        {renderComponent(processedComponent)}
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedJSONModelRenderer;