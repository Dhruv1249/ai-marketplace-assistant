export class TemplateValidator {
  validateTemplate(template) {
    const errors = [];
    
    try {
      // Check if template is valid JSON
      if (typeof template !== 'object' || template === null) {
        errors.push('Template must be a valid object');
        return { valid: false, errors };
      }

      // Check required top-level properties
      if (!template.metadata) {
        errors.push('Template must have metadata');
      }
      
      if (!template.component) {
        errors.push('Template must have component structure');
      }

      // Validate metadata
      if (template.metadata) {
        if (!template.metadata.template) {
          errors.push('Metadata must have template type');
        }
        if (!template.metadata.name) {
          errors.push('Metadata must have name');
        }
      }

      // Validate component structure
      if (template.component) {
        const componentErrors = this.validateComponent(template.component);
        errors.push(...componentErrors);
      }

      // Validate styleVariables if present
      if (template.styleVariables) {
        const styleErrors = this.validateStyleVariables(template.styleVariables);
        errors.push(...styleErrors);
      }

      return {
        valid: errors.length === 0,
        errors
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Template validation failed: ${error.message}`]
      };
    }
  }

  validateComponent(component, path = 'component') {
    const errors = [];

    if (!component || typeof component !== 'object') {
      errors.push(`${path} must be an object`);
      return errors;
    }

    // Check required properties
    if (!component.type) {
      errors.push(`${path} must have a type`);
    }

    if (!component.id) {
      errors.push(`${path} must have an id`);
    }

    // Validate children if present
    if (component.children) {
      if (Array.isArray(component.children)) {
        component.children.forEach((child, index) => {
          if (typeof child === 'object' && child !== null) {
            const childErrors = this.validateComponent(child, `${path}.children[${index}]`);
            errors.push(...childErrors);
          }
        });
      }
    }

    return errors;
  }

  validateStyleVariables(styleVariables) {
    const errors = [];

    if (typeof styleVariables !== 'object' || styleVariables === null) {
      errors.push('styleVariables must be an object');
      return errors;
    }

    // Validate color values if present
    const colorProps = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor', 'accentColor'];
    colorProps.forEach(prop => {
      if (styleVariables[prop] && !this.isValidColor(styleVariables[prop])) {
        errors.push(`${prop} must be a valid color (hex, rgb, or named color)`);
      }
    });

    return errors;
  }

  isValidColor(color) {
    // Check for hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }
    
    // Check for rgb/rgba colors
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
      return true;
    }
    
    // Check for named colors (basic check)
    const namedColors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'purple', 'orange', 'pink'];
    if (namedColors.includes(color.toLowerCase())) {
      return true;
    }

    return false;
  }

  // Fix common template issues
  fixTemplate(template) {
    const fixed = JSON.parse(JSON.stringify(template));

    // Ensure required properties exist
    if (!fixed.metadata) {
      fixed.metadata = {
        template: 'unknown',
        name: 'Template',
        version: '1.0'
      };
    }

    if (!fixed.styleVariables) {
      fixed.styleVariables = {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        backgroundColor: '#ffffff',
        textColor: '#111827'
      };
    }

    if (!fixed.component) {
      fixed.component = {
        id: 'root',
        type: 'div',
        props: { className: 'min-h-screen' },
        children: []
      };
    }

    return fixed;
  }
}