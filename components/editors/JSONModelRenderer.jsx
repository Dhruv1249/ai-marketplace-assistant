'use client';

import React from 'react';
import ImageGallery from '@/components/ui/ImageGallery';

const JSONModelRenderer = ({ model, content, images, isEditing, onUpdate }) => {
  console.log('JSONModelRenderer inputs:', { model, content, images, isEditing });

  if (!model) {
    console.error('Invalid model: model is undefined or null', model);
    return <div>Invalid template model: Model is missing</div>;
  }
  if (!model.component) {
    console.error('Invalid model: missing component', model);
    return <div>Invalid template model: Component is missing</div>;
  }

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
    
    // Define different styles for different templates
    const templateStyles = {
      'gallery-focused': {
        container: 'mb-4',
        title: 'text-lg font-semibold text-gray-900',
        explanation: 'text-gray-600'
      },
      'classic': {
        container: 'border-l-4 border-blue-600 pl-4',
        title: 'text-lg font-semibold text-gray-900',
        explanation: 'text-gray-600 mt-1'
      },
      'minimal': {
        container: 'text-center',
        title: 'text-xl font-medium text-gray-900 mb-3',
        explanation: 'text-gray-600 leading-relaxed'
      },
      'modern': {
        container: 'bg-white rounded-lg p-4 shadow-sm',
        title: 'text-lg font-semibold text-gray-900 mb-2',
        explanation: 'text-gray-600'
      }
    };

    const styles = templateStyles[template] || templateStyles['gallery-focused'];
    
    return features.map((feature, index) => ({
      id: `feature-${index}`,
      type: 'div',
      props: { className: styles.container },
      children: [
        {
          id: `feature-${index}-title`,
          type: 'h3',
          props: { className: styles.title },
          children: [feature]
        },
        {
          id: `feature-${index}-explanation`,
          type: 'p',
          props: { className: styles.explanation },
          children: [featureExplanations?.[feature] || '']
        }
      ]
    }));
  };

  const generateSpecComponents = (specifications) => {
    if (!specifications || typeof specifications !== 'object') return [];
    
    return Object.entries(specifications).map(([key, value], index) => ({
      id: `spec-${index}`,
      type: 'div',
      props: { className: 'flex justify-between py-2' },
      children: [
        {
          id: `spec-${index}-key`,
          type: 'span',
          props: { className: 'font-medium text-gray-700' },
          children: [key]
        },
        {
          id: `spec-${index}-value`,
          type: 'span',
          props: { className: 'text-gray-600' },
          children: [value]
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
            // Generate feature components with template-specific styling
            const templateType = model?.metadata?.template || 'gallery-focused';
            processedNode.children = generateFeatureComponents(context.content?.features, context.content?.featureExplanations, templateType);
          } else if (processedNode.children.includes('content.specifications') && processedNode.children.includes('entries')) {
            // Generate specification components
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
      const { type, props = {}, children, id } = comp;
      
      // Check if this is a gallery section and replace with ImageGallery
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
      
      // Map component types to HTML elements
      const elementMap = {
        'div': 'div',
        'section': 'section',
        'h1': 'h1',
        'h2': 'h2',
        'h3': 'h3',
        'p': 'p',
        'img': 'img',
        'button': 'button',
        'span': 'span'
      };
      
      const Component = elementMap[type] || 'div';

      // Check if this is a void element that cannot have children
      const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link'];
      const isVoidElement = voidElements.includes(type);

      // Process children only for non-void elements
      let renderedChildren = null;
      if (!isVoidElement && children) {
        if (Array.isArray(children)) {
          renderedChildren = children.map((child, index) => renderComponent(child, `${key}-child-${index}`));
        } else {
          renderedChildren = renderComponent(children, `${key}-child`);
        }
      }

      // Add editing handlers if in edit mode
      const editProps = isEditing
        ? {
            draggable: true,
            onDragStart: (e) => {
              e.dataTransfer.setData('text/plain', JSON.stringify(comp));
            },
            onDoubleClick: () => {
              if (!isVoidElement && typeof children === 'string') {
                const newText = prompt('Edit text:', children);
                if (newText && onUpdate) {
                  console.log('Would update text to:', newText);
                }
              }
            },
          }
        : {};

      // Render void elements without children
      if (isVoidElement) {
        return <Component key={key} {...props} {...editProps} />;
      }

      return (
        <Component key={key} {...props} {...editProps}>
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

export default JSONModelRenderer;