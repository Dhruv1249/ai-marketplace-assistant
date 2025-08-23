/**
 * Template Validator - Validates template structure and editing operations
 */

import { ComponentRegistry } from './ComponentRegistry';

export class TemplateValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate complete template structure
   */
  validateTemplate(template) {
    this.errors = [];
    this.warnings = [];

    if (!template) {
      this.errors.push('Template is required');
      return this.getResult();
    }

    // Validate metadata
    this.validateMetadata(template.metadata);
    
    // Validate editing config
    this.validateEditingConfig(template.editingConfig);
    
    // Validate style variables
    this.validateStyleVariables(template.styleVariables);
    
    // Validate component structure
    this.validateComponent(template.component);
    
    // Validate section constraints
    this.validateSectionConstraints(template);

    return this.getResult();
  }

  /**
   * Validate template metadata
   */
  validateMetadata(metadata) {
    if (!metadata) {
      this.errors.push('Template metadata is required');
      return;
    }

    const required = ['template', 'name', 'description', 'version'];
    required.forEach(field => {
      if (!metadata[field]) {
        this.errors.push(`Metadata field '${field}' is required`);
      }
    });

    if (metadata.version && !this.isValidVersion(metadata.version)) {
      this.errors.push('Invalid version format. Use semantic versioning (e.g., 1.0.0)');
    }

    if (metadata.sections && !Array.isArray(metadata.sections)) {
      this.errors.push('Metadata sections must be an array');
    }

    if (metadata.tags && !Array.isArray(metadata.tags)) {
      this.errors.push('Metadata tags must be an array');
    }
  }

  /**
   * Validate editing configuration
   */
  validateEditingConfig(editingConfig) {
    if (!editingConfig) {
      this.warnings.push('No editing configuration found - template may not be editable');
      return;
    }

    if (editingConfig.allowedOperations && !Array.isArray(editingConfig.allowedOperations)) {
      this.errors.push('allowedOperations must be an array');
    }

    if (editingConfig.constraints) {
      const { minSections, maxSections, requiredSections } = editingConfig.constraints;
      
      if (minSections && typeof minSections !== 'number') {
        this.errors.push('minSections must be a number');
      }
      
      if (maxSections && typeof maxSections !== 'number') {
        this.errors.push('maxSections must be a number');
      }
      
      if (minSections && maxSections && minSections > maxSections) {
        this.errors.push('minSections cannot be greater than maxSections');
      }
      
      if (requiredSections && !Array.isArray(requiredSections)) {
        this.errors.push('requiredSections must be an array');
      }
    }

    if (editingConfig.sectionTypes) {
      Object.entries(editingConfig.sectionTypes).forEach(([type, config]) => {
        if (!ComponentRegistry[type]) {
          this.warnings.push(`Section type '${type}' not found in ComponentRegistry`);
        }
        
        if (config.maxCount && typeof config.maxCount !== 'number') {
          this.errors.push(`maxCount for section '${type}' must be a number`);
        }
        
        if (config.required && typeof config.required !== 'boolean') {
          this.errors.push(`required for section '${type}' must be a boolean`);
        }
      });
    }
  }

  /**
   * Validate style variables
   */
  validateStyleVariables(styleVariables) {
    if (!styleVariables) {
      this.warnings.push('No style variables defined - template may not be customizable');
      return;
    }

    // Check for common required variables
    const recommended = [
      'primaryColor', 'backgroundColor', 'textColor', 
      'fontFamily', 'fontSize', 'spacing'
    ];
    
    recommended.forEach(variable => {
      if (!styleVariables[variable]) {
        this.warnings.push(`Recommended style variable '${variable}' is missing`);
      }
    });

    // Validate color values
    Object.entries(styleVariables).forEach(([key, value]) => {
      if (key.toLowerCase().includes('color') && typeof value === 'string') {
        if (!this.isValidColor(value)) {
          this.errors.push(`Invalid color value for '${key}': ${value}`);
        }
      }
    });
  }

  /**
   * Validate component structure recursively
   */
  validateComponent(component, path = 'root') {
    if (!component) {
      this.errors.push(`Component at '${path}' is required`);
      return;
    }

    if (!component.type) {
      this.errors.push(`Component at '${path}' must have a type`);
    }

    if (!component.id) {
      this.warnings.push(`Component at '${path}' should have an id for editing`);
    }

    // Validate editable configuration
    if (component.editable) {
      this.validateEditableConfig(component.editable, path);
    }

    // Validate editing metadata
    if (component.editingMeta) {
      this.validateEditingMeta(component.editingMeta, path);
    }

    // Validate props
    if (component.props) {
      this.validateProps(component.props, path);
    }

    // Recursively validate children
    if (component.children) {
      if (Array.isArray(component.children)) {
        component.children.forEach((child, index) => {
          if (typeof child === 'object' && child !== null) {
            this.validateComponent(child, `${path}.children[${index}]`);
          }
        });
      } else if (typeof component.children === 'object' && component.children !== null) {
        this.validateComponent(component.children, `${path}.children`);
      }
    }
  }

  /**
   * Validate editable configuration
   */
  validateEditableConfig(editable, path) {
    const validProps = [
      'moveable', 'removeable', 'duplicatable', 'styleEditable', 
      'contentEditable', 'textAlign', 'fontSize', 'fontWeight', 
      'color', 'lineHeight'
    ];

    Object.keys(editable).forEach(prop => {
      if (!validProps.includes(prop)) {
        this.warnings.push(`Unknown editable property '${prop}' at '${path}'`);
      }
      
      if (typeof editable[prop] !== 'boolean') {
        this.errors.push(`Editable property '${prop}' at '${path}' must be boolean`);
      }
    });
  }

  /**
   * Validate editing metadata
   */
  validateEditingMeta(editingMeta, path) {
    if (!editingMeta.name) {
      this.warnings.push(`EditingMeta at '${path}' should have a name`);
    }

    if (editingMeta.contentType) {
      const validTypes = ['text', 'textarea', 'select', 'number', 'boolean', 'color'];
      if (!validTypes.includes(editingMeta.contentType)) {
        this.errors.push(`Invalid contentType '${editingMeta.contentType}' at '${path}'`);
      }
    }
  }

  /**
   * Validate component props
   */
  validateProps(props, path) {
    // Validate className
    if (props.className && typeof props.className !== 'string') {
      this.errors.push(`className at '${path}' must be a string`);
    }

    // Validate style object
    if (props.style && typeof props.style !== 'object') {
      this.errors.push(`style at '${path}' must be an object`);
    }

    // Check for potential XSS in props
    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'string' && this.containsPotentialXSS(value)) {
        this.warnings.push(`Potential XSS risk in prop '${key}' at '${path}'`);
      }
    });
  }

  /**
   * Validate section constraints
   */
  validateSectionConstraints(template) {
    if (!template.component || !template.editingConfig) return;

    const sections = this.extractSections(template.component);
    const constraints = template.editingConfig.constraints;
    const sectionTypes = template.editingConfig.sectionTypes;

    // Check min/max sections
    if (constraints?.minSections && sections.length < constraints.minSections) {
      this.errors.push(`Template has ${sections.length} sections but requires at least ${constraints.minSections}`);
    }

    if (constraints?.maxSections && sections.length > constraints.maxSections) {
      this.errors.push(`Template has ${sections.length} sections but allows maximum ${constraints.maxSections}`);
    }

    // Check required sections
    if (constraints?.requiredSections) {
      constraints.requiredSections.forEach(requiredType => {
        const found = sections.some(section => section.sectionType === requiredType);
        if (!found) {
          this.errors.push(`Required section '${requiredType}' is missing`);
        }
      });
    }

    // Check section type constraints
    if (sectionTypes) {
      Object.entries(sectionTypes).forEach(([type, config]) => {
        const count = sections.filter(section => section.sectionType === type).length;
        
        if (config.required && count === 0) {
          this.errors.push(`Required section type '${type}' is missing`);
        }
        
        if (config.maxCount && count > config.maxCount) {
          this.errors.push(`Section type '${type}' appears ${count} times but maximum allowed is ${config.maxCount}`);
        }
      });
    }
  }

  /**
   * Extract all sections from component tree
   */
  extractSections(component, sections = []) {
    if (component.sectionType) {
      sections.push(component);
    }

    if (component.children) {
      if (Array.isArray(component.children)) {
        component.children.forEach(child => {
          if (typeof child === 'object' && child !== null) {
            this.extractSections(child, sections);
          }
        });
      } else if (typeof component.children === 'object' && component.children !== null) {
        this.extractSections(component.children, sections);
      }
    }

    return sections;
  }

  /**
   * Utility methods
   */
  isValidVersion(version) {
    return /^\d+\.\d+(\.\d+)?$/.test(version);
  }

  isValidColor(color) {
    // Check hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return true;
    
    // Check rgb/rgba
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) return true;
    
    // Check hsl/hsla
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) return true;
    
    // Check CSS color names (basic check)
    const cssColors = ['red', 'blue', 'green', 'black', 'white', 'transparent', 'inherit'];
    if (cssColors.includes(color.toLowerCase())) return true;
    
    return false;
  }

  containsPotentialXSS(value) {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(value));
  }

  getResult() {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        errorCount: this.errors.length,
        warningCount: this.warnings.length
      }
    };
  }
}

/**
 * Validate a single editing operation
 */
export function validateEditingOperation(template, operation) {
  const validator = new TemplateValidator();
  
  switch (operation.type) {
    case 'add':
      return validator.validateAddOperation(template, operation);
    case 'remove':
      return validator.validateRemoveOperation(template, operation);
    case 'move':
      return validator.validateMoveOperation(template, operation);
    case 'style':
      return validator.validateStyleOperation(template, operation);
    case 'content':
      return validator.validateContentOperation(template, operation);
    default:
      return { valid: false, error: `Unknown operation type: ${operation.type}` };
  }
}

/**
 * Quick validation for common use cases
 */
export function quickValidate(template) {
  const validator = new TemplateValidator();
  return validator.validateTemplate(template);
}

export default TemplateValidator;