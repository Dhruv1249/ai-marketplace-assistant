'use client';

import React from 'react';
import ImageGallery from '@/components/ui/ImageGallery';

const EnhancedJSONModelRenderer = ({ model, content, images, isEditing, onUpdate }) => {
  console.log('EnhancedJSONModelRenderer inputs:', { model, content, images, isEditing });

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
        container: 'border-l-4 border-blue-400 pl-4 mb-4',
        title: 'font-medium mb-1',
        explanation: 'text-sm leading-relaxed'
      },
      'classic': {
        container: 'border-l-4 border-gray-800 pl-6',
        title: 'text-xl font-serif font-semibold text-gray-900 mb-3',
        explanation: 'text-gray-700 leading-relaxed font-serif'
      },
      'minimal': {
        container: 'text-center',
        title: 'text-lg font-medium mb-2',
        explanation: 'text-sm text-gray-600 leading-relaxed'
      },
      'modern': {
        container: 'bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200',
        title: 'text-xl font-semibold text-gray-900 mb-3',
        explanation: 'text-gray-600 leading-relaxed'
      }
    };

    const styles = templateStyles[template] || templateStyles['gallery-focused'];
    
    return features.map((feature, index) => ({
      id: `feature-${index}`,
      type: 'div',
      props: { className: styles.container },
      children: [
        // Add icon for modern template
        ...(template === 'modern' ? [{
          id: `feature-${index}-icon`,
          type: 'div',
          props: { className: 'text-blue-600 mb-4' },
          children: [{
            id: `feature-${index}-icon-svg`,
            type: 'svg',
            props: {
              className: 'w-8 h-8',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
            children: [{
              id: `feature-${index}-icon-path`,
              type: 'path',
              props: {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: index === 0 ? 'M13 10V3L4 14h7v7l9-11h-7z' : 
                   index === 1 ? 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' :
                   'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
              }
            }]
          }]
        }] : []),
        {
          id: `feature-${index}-title`,
          type: template === 'gallery-focused' ? 'h4' : 'h3',
          props: { className: styles.title },
          children: [feature]
        },
        ...(featureExplanations?.[feature] ? [{
          id: `feature-${index}-explanation`,
          type: 'p',
          props: { className: styles.explanation },
          children: [featureExplanations[feature]]
        }] : [])
      ]
    }));
  };

  const generateSpecComponents = (specifications, template = 'gallery-focused') => {
    if (!specifications || typeof specifications !== 'object') return [];
    
    const entries = Object.entries(specifications);
    
    if (template === 'classic') {
      return entries.map(([key, value], index) => ({
        id: `spec-${index}`,
        type: 'tr',
        props: { className: 'border-b border-gray-300 last:border-b-0' },
        children: [
          {
            id: `spec-${index}-key`,
            type: 'td',
            props: { className: 'py-3 pr-8 w-1/3 font-serif font-semibold text-gray-800' },
            children: [key]
          },
          {
            id: `spec-${index}-value`,
            type: 'td',
            props: { className: 'py-3 font-serif text-gray-700' },
            children: [value]
          }
        ]
      }));
    } else if (template === 'gallery-focused') {
      return entries.map(([key, value], index) => ({
        id: `spec-${index}`,
        type: 'tr',
        props: {},
        children: [
          {
            id: `spec-${index}-key`,
            type: 'td',
            props: { className: 'px-4 py-2 bg-gray-50 font-medium w-1/3' },
            children: [key]
          },
          {
            id: `spec-${index}-value`,
            type: 'td',
            props: { className: 'px-4 py-2' },
            children: [value]
          }
        ]
      }));
    } else if (template === 'minimal') {
      return entries.slice(0, 6).map(([key, value], index) => ({
        id: `spec-${index}`,
        type: 'div',
        props: { className: 'flex justify-between py-2 border-b border-gray-100 last:border-b-0' },
        children: [
          {
            id: `spec-${index}-key`,
            type: 'span',
            props: { className: 'text-gray-600' },
            children: [key]
          },
          {
            id: `spec-${index}-value`,
            type: 'span',
            props: { className: 'font-medium' },
            children: [value]
          }
        ]
      }));
    } else if (template === 'modern') {
      return entries.slice(0, 8).map(([key, value], index) => ({
        id: `spec-${index}`,
        type: 'div',
        props: { className: 'flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg' },
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
            props: { className: 'text-gray-900 font-semibold' },
            children: [value]
          }
        ]
      }));
    }
    
    return [];
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
            const templateType = model?.metadata?.template || 'gallery-focused';
            processedNode.children = generateSpecComponents(context.content?.specifications, templateType);
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

      // Process children only for non-void elements
      let renderedChildren = null;
      if (!isVoidElement && children) {
        if (Array.isArray(children)) {
          renderedChildren = children.map((child, index) => renderComponent(child, `${key}-child-${index}`));
        } else {
          renderedChildren = renderComponent(children, `${key}-child`);
        }
      }

      // Render void elements without children
      if (isVoidElement) {
        return <Component key={key} {...props} />;
      }

      return (
        <Component key={key} {...props}>
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