/* =================
   Template Storage System
   ================= */

const STORAGE_KEYS = {
  PRODUCT_TEMPLATES: 'product_template_edits',
  SELLER_TEMPLATES: 'seller_template_edits'
};

export class TemplateStorage {
  static saveTemplateEdits(type, templateId, edits) {
    try {
      const storageKey = type === 'product' ? STORAGE_KEYS.PRODUCT_TEMPLATES : STORAGE_KEYS.SELLER_TEMPLATES;
      const existing = this.getTemplateEdits(type, templateId);
      
      const updatedEdits = {
        ...existing,
        ...edits,
        lastModified: new Date().toISOString(),
        version: (existing.version || 0) + 1
      };

      const allEdits = JSON.parse(localStorage.getItem(storageKey) || '{}');
      allEdits[templateId] = updatedEdits;
      
      localStorage.setItem(storageKey, JSON.stringify(allEdits));
      
      return updatedEdits;
    } catch (error) {
      console.error('Error saving template edits:', error);
      return null;
    }
  }

  static getTemplateEdits(type, templateId) {
    try {
      const storageKey = type === 'product' ? STORAGE_KEYS.PRODUCT_TEMPLATES : STORAGE_KEYS.SELLER_TEMPLATES;
      const allEdits = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return allEdits[templateId] || {
        elementStyles: {},
        elementTexts: {},
        elementProps: {},
        customElements: [],
        deletedElements: [],
        version: 0
      };
    } catch (error) {
      console.error('Error loading template edits:', error);
      return {
        elementStyles: {},
        elementTexts: {},
        elementProps: {},
        customElements: [],
        deletedElements: [],
        version: 0
      };
    }
  }

  static deleteTemplateEdits(type, templateId) {
    try {
      const storageKey = type === 'product' ? STORAGE_KEYS.PRODUCT_TEMPLATES : STORAGE_KEYS.SELLER_TEMPLATES;
      const allEdits = JSON.parse(localStorage.getItem(storageKey) || '{}');
      delete allEdits[templateId];
      localStorage.setItem(storageKey, JSON.stringify(allEdits));
      return true;
    } catch (error) {
      console.error('Error deleting template edits:', error);
      return false;
    }
  }

  static getAllTemplateEdits(type) {
    try {
      const storageKey = type === 'product' ? STORAGE_KEYS.PRODUCT_TEMPLATES : STORAGE_KEYS.SELLER_TEMPLATES;
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (error) {
      console.error('Error loading all template edits:', error);
      return {};
    }
  }

  static exportTemplateEdits(type, templateId) {
    const edits = this.getTemplateEdits(type, templateId);
    const exportData = {
      type,
      templateId,
      edits,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${templateId}_edits.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static importTemplateEdits(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          if (importData.type && importData.templateId && importData.edits) {
            this.saveTemplateEdits(importData.type, importData.templateId, importData.edits);
            resolve(importData);
          } else {
            reject(new Error('Invalid import file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static generateElementId() {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static addCustomElement(type, templateId, element) {
    const edits = this.getTemplateEdits(type, templateId);
    const elementId = this.generateElementId();
    
    const customElement = {
      id: elementId,
      type: element.type,
      content: element.defaultContent,
      style: element.defaultStyle,
      props: element.defaultProps || {},
      position: { x: 50, y: 50 },
      size: { width: 'auto', height: 'auto' },
      createdAt: new Date().toISOString()
    };

    edits.customElements = [...(edits.customElements || []), customElement];
    
    this.saveTemplateEdits(type, templateId, edits);
    return elementId;
  }

  static updateElement(type, templateId, elementId, updates) {
    const edits = this.getTemplateEdits(type, templateId);
    
    // Update styles
    if (updates.style) {
      edits.elementStyles = {
        ...edits.elementStyles,
        [elementId]: { ...edits.elementStyles[elementId], ...updates.style }
      };
    }

    // Update text content
    if (updates.text !== undefined) {
      edits.elementTexts = {
        ...edits.elementTexts,
        [elementId]: updates.text
      };
    }

    // Update props
    if (updates.props) {
      edits.elementProps = {
        ...edits.elementProps,
        [elementId]: { ...edits.elementProps[elementId], ...updates.props }
      };
    }

    // Update custom elements
    if (edits.customElements) {
      edits.customElements = edits.customElements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      );
    }

    this.saveTemplateEdits(type, templateId, edits);
  }

  static deleteElement(type, templateId, elementId) {
    const edits = this.getTemplateEdits(type, templateId);
    
    // Add to deleted elements list
    edits.deletedElements = [...(edits.deletedElements || []), elementId];
    
    // Remove from custom elements
    if (edits.customElements) {
      edits.customElements = edits.customElements.filter(el => el.id !== elementId);
    }

    // Clean up styles, texts, and props
    delete edits.elementStyles[elementId];
    delete edits.elementTexts[elementId];
    delete edits.elementProps[elementId];

    this.saveTemplateEdits(type, templateId, edits);
  }
}