/**
 * Component Registry - Defines all available components for template editing
 */

export const ComponentRegistry = {
  // Content Components
  hero: {
    id: 'hero',
    name: 'Hero Section',
    description: 'Main title and description area',
    category: 'content',
    icon: 'type',
    maxCount: 1,
    required: true,
    editableProps: {
      title: { type: 'text', label: 'Title', required: true },
      description: { type: 'textarea', label: 'Description', required: true },
      alignment: { type: 'select', label: 'Text Alignment', options: ['left', 'center', 'right'] },
      showSubtitle: { type: 'boolean', label: 'Show Subtitle' }
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color' },
      textColor: { type: 'color', label: 'Text Color' },
      titleSize: { type: 'select', label: 'Title Size', options: ['sm', 'md', 'lg', 'xl', '2xl'] },
      padding: { type: 'spacing', label: 'Padding' },
      margin: { type: 'spacing', label: 'Margin' }
    },
    template: {
      id: 'hero-section',
      type: 'div',
      sectionType: 'hero',
      editable: {
        moveable: false,
        removeable: false,
        duplicatable: false,
        styleEditable: true,
        contentEditable: true
      },
      editingMeta: {
        name: 'Hero Section',
        description: 'Main product title and description',
        icon: 'type',
        category: 'content'
      },
      props: {
        className: 'hero-section',
        style: {
          backgroundColor: 'var(--hero-bg, transparent)',
          color: 'var(--hero-text, inherit)',
          padding: 'var(--hero-padding, 2rem)',
          textAlign: 'var(--hero-align, left)'
        }
      },
      children: [
        {
          id: 'hero-title',
          type: 'h1',
          props: {
            className: 'hero-title',
            style: {
              fontSize: 'var(--hero-title-size, 2rem)',
              fontWeight: 'var(--hero-title-weight, 600)',
              marginBottom: 'var(--spacing-md, 1rem)'
            }
          },
          children: ['{{content.title}}']
        },
        {
          id: 'hero-description',
          type: 'p',
          props: {
            className: 'hero-description',
            style: {
              fontSize: 'var(--hero-text-size, 1rem)',
              lineHeight: 'var(--line-height, 1.6)',
              opacity: '0.8'
            }
          },
          children: ['{{content.description}}']
        }
      ]
    }
  },

  gallery: {
    id: 'gallery',
    name: 'Image Gallery',
    description: 'Product image showcase with navigation',
    category: 'media',
    icon: 'image',
    maxCount: 1,
    required: false,
    editableProps: {
      layout: { type: 'select', label: 'Layout Style', options: ['grid', 'carousel', 'masonry'] },
      aspectRatio: { type: 'select', label: 'Aspect Ratio', options: ['16:9', '4:3', '1:1', 'auto'] },
      showThumbnails: { type: 'boolean', label: 'Show Thumbnails', default: true },
      allowZoom: { type: 'boolean', label: 'Allow Zoom', default: true }
    },
    styleProps: {
      borderRadius: { type: 'slider', label: 'Border Radius', min: 0, max: 20, unit: 'px' },
      spacing: { type: 'spacing', label: 'Image Spacing' },
      shadowSize: { type: 'select', label: 'Shadow', options: ['none', 'small', 'medium', 'large'] }
    },
    template: {
      id: 'gallery-section',
      type: 'div',
      sectionType: 'gallery',
      editable: {
        moveable: true,
        removeable: true,
        duplicatable: false,
        styleEditable: true,
        contentEditable: false
      },
      editingMeta: {
        name: 'Image Gallery',
        description: 'Product image showcase',
        icon: 'image',
        category: 'media'
      },
      props: {
        className: 'gallery-section',
        style: {
          borderRadius: 'var(--gallery-radius, 8px)',
          padding: 'var(--gallery-padding, 0)',
          boxShadow: 'var(--gallery-shadow, none)'
        }
      },
      children: '{{gallery.component}}'
    }
  },

  features: {
    id: 'features',
    name: 'Features List',
    description: 'Product features and benefits',
    category: 'content',
    icon: 'list',
    maxCount: 1,
    required: false,
    editableProps: {
      layout: { type: 'select', label: 'Layout', options: ['list', 'grid', 'cards'] },
      columns: { type: 'select', label: 'Columns', options: [1, 2, 3, 4] },
      showIcons: { type: 'boolean', label: 'Show Icons', default: true },
      iconStyle: { type: 'select', label: 'Icon Style', options: ['check', 'star', 'arrow', 'bullet'] }
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color' },
      borderColor: { type: 'color', label: 'Border Color' },
      spacing: { type: 'spacing', label: 'Item Spacing' },
      padding: { type: 'spacing', label: 'Section Padding' }
    },
    template: {
      id: 'features-section',
      type: 'div',
      sectionType: 'features',
      editable: {
        moveable: true,
        removeable: true,
        duplicatable: false,
        styleEditable: true,
        contentEditable: true
      },
      editingMeta: {
        name: 'Features Section',
        description: 'Product features and benefits',
        icon: 'list',
        category: 'content'
      },
      props: {
        className: 'features-section',
        style: {
          backgroundColor: 'var(--features-bg, transparent)',
          padding: 'var(--features-padding, 2rem)',
          borderRadius: 'var(--border-radius, 8px)'
        }
      },
      children: [
        {
          id: 'features-title',
          type: 'h2',
          props: {
            className: 'features-title',
            style: {
              fontSize: 'var(--section-title-size, 1.5rem)',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg, 1.5rem)'
            }
          },
          children: ['Key Features']
        },
        {
          id: 'features-list',
          type: 'div',
          props: {
            className: 'features-list',
            style: {
              display: 'var(--features-display, block)',
              gridTemplateColumns: 'var(--features-columns, 1fr)',
              gap: 'var(--features-gap, 1rem)'
            }
          },
          children: '{{content.features.map}}'
        }
      ]
    }
  },

  specifications: {
    id: 'specifications',
    name: 'Specifications',
    description: 'Technical specifications table',
    category: 'content',
    icon: 'table',
    maxCount: 1,
    required: false,
    editableProps: {
      layout: { type: 'select', label: 'Layout', options: ['table', 'list', 'grid'] },
      showHeaders: { type: 'boolean', label: 'Show Headers', default: true },
      alternateRows: { type: 'boolean', label: 'Alternate Row Colors', default: true }
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color' },
      borderColor: { type: 'color', label: 'Border Color' },
      headerBg: { type: 'color', label: 'Header Background' },
      padding: { type: 'spacing', label: 'Cell Padding' }
    },
    template: {
      id: 'specs-section',
      type: 'div',
      sectionType: 'specifications',
      editable: {
        moveable: true,
        removeable: true,
        duplicatable: false,
        styleEditable: true,
        contentEditable: false
      },
      editingMeta: {
        name: 'Specifications',
        description: 'Technical specifications',
        icon: 'table',
        category: 'content'
      },
      props: {
        className: 'specs-section',
        style: {
          backgroundColor: 'var(--specs-bg, transparent)',
          padding: 'var(--specs-padding, 1.5rem)',
          borderRadius: 'var(--border-radius, 8px)'
        }
      },
      children: [
        {
          id: 'specs-title',
          type: 'h2',
          props: {
            className: 'specs-title',
            style: {
              fontSize: 'var(--section-title-size, 1.5rem)',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg, 1.5rem)'
            }
          },
          children: ['Specifications']
        },
        {
          id: 'specs-list',
          type: 'div',
          props: {
            className: 'specs-list',
            style: {
              display: 'var(--specs-display, block)',
              gap: 'var(--specs-gap, 0.5rem)'
            }
          },
          children: '{{content.specifications.entries}}'
        }
      ]
    }
  },

  testimonials: {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews and testimonials',
    category: 'social',
    icon: 'quote',
    maxCount: 1,
    required: false,
    editableProps: {
      layout: { type: 'select', label: 'Layout', options: ['carousel', 'grid', 'list'] },
      showRatings: { type: 'boolean', label: 'Show Star Ratings', default: true },
      showAvatars: { type: 'boolean', label: 'Show Customer Photos', default: true },
      maxItems: { type: 'number', label: 'Max Testimonials', min: 1, max: 10, default: 3 }
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color' },
      textColor: { type: 'color', label: 'Text Color' },
      accentColor: { type: 'color', label: 'Accent Color' },
      borderRadius: { type: 'slider', label: 'Border Radius', min: 0, max: 20, unit: 'px' }
    },
    template: {
      id: 'testimonials-section',
      type: 'div',
      sectionType: 'testimonials',
      editable: {
        moveable: true,
        removeable: true,
        duplicatable: false,
        styleEditable: true,
        contentEditable: true
      },
      editingMeta: {
        name: 'Testimonials',
        description: 'Customer reviews and testimonials',
        icon: 'quote',
        category: 'social'
      },
      props: {
        className: 'testimonials-section',
        style: {
          backgroundColor: 'var(--testimonials-bg, #f9fafb)',
          padding: 'var(--testimonials-padding, 3rem)',
          borderRadius: 'var(--border-radius, 8px)'
        }
      },
      children: [
        {
          id: 'testimonials-title',
          type: 'h2',
          props: {
            className: 'testimonials-title',
            style: {
              fontSize: 'var(--section-title-size, 1.5rem)',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 'var(--spacing-xl, 2rem)'
            }
          },
          children: ['What Our Customers Say']
        },
        {
          id: 'testimonials-list',
          type: 'div',
          props: {
            className: 'testimonials-list',
            style: {
              display: 'grid',
              gridTemplateColumns: 'var(--testimonials-columns, repeat(auto-fit, minmax(300px, 1fr)))',
              gap: 'var(--testimonials-gap, 2rem)'
            }
          },
          children: '{{content.testimonials.map}}'
        }
      ]
    }
  },

  cta: {
    id: 'cta',
    name: 'Call to Action',
    description: 'Action buttons and purchase options',
    category: 'action',
    icon: 'button',
    maxCount: 2,
    required: true,
    editableProps: {
      buttonText: { type: 'text', label: 'Button Text', default: 'Add to Cart' },
      buttonStyle: { type: 'select', label: 'Button Style', options: ['primary', 'secondary', 'outline', 'ghost'] },
      size: { type: 'select', label: 'Button Size', options: ['sm', 'md', 'lg', 'xl'] },
      showPrice: { type: 'boolean', label: 'Show Price', default: true },
      showQuantity: { type: 'boolean', label: 'Show Quantity Selector', default: true }
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Button Background' },
      textColor: { type: 'color', label: 'Button Text Color' },
      borderColor: { type: 'color', label: 'Border Color' },
      borderRadius: { type: 'slider', label: 'Border Radius', min: 0, max: 20, unit: 'px' },
      padding: { type: 'spacing', label: 'Button Padding' }
    },
    template: {
      id: 'cta-section',
      type: 'div',
      sectionType: 'cta',
      editable: {
        moveable: true,
        removeable: false,
        duplicatable: true,
        styleEditable: true,
        contentEditable: true
      },
      editingMeta: {
        name: 'Call to Action',
        description: 'Purchase buttons and actions',
        icon: 'button',
        category: 'action'
      },
      props: {
        className: 'cta-section',
        style: {
          padding: 'var(--cta-padding, 2rem)',
          textAlign: 'var(--cta-align, center)'
        }
      },
      children: [
        {
          id: 'cta-button',
          type: 'button',
          props: {
            className: 'cta-button',
            style: {
              backgroundColor: 'var(--cta-bg, #2563eb)',
              color: 'var(--cta-text, white)',
              padding: 'var(--cta-button-padding, 0.75rem 1.5rem)',
              borderRadius: 'var(--cta-radius, 8px)',
              border: 'var(--cta-border, none)',
              fontSize: 'var(--cta-text-size, 1rem)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }
          },
          children: ['{{cta.buttonText || "Add to Cart"}}']
        }
      ]
    }
  }
};

export const getComponentByType = (type) => {
  return ComponentRegistry[type] || null;
};

export const getAvailableComponents = (category = null) => {
  const components = Object.values(ComponentRegistry);
  return category 
    ? components.filter(comp => comp.category === category)
    : components;
};

export const validateComponentConstraints = (template, componentType, operation) => {
  const component = ComponentRegistry[componentType];
  if (!component) return { valid: false, error: 'Component type not found' };

  const currentCount = template.component.children.filter(
    child => child.sectionType === componentType
  ).length;

  switch (operation) {
    case 'add':
      if (currentCount >= component.maxCount) {
        return { 
          valid: false, 
          error: `Maximum ${component.maxCount} ${component.name} sections allowed` 
        };
      }
      break;
    case 'remove':
      if (component.required && currentCount <= 1) {
        return { 
          valid: false, 
          error: `${component.name} is required and cannot be removed` 
        };
      }
      break;
  }

  return { valid: true };
};

export default ComponentRegistry;