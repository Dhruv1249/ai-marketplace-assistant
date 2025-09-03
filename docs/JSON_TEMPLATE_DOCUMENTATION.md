# 📚 JSON Template Documentation for Enhanced JSON Renderer

## 🎯 Overview

This documentation explains how to create JSON templates for the Enhanced JSON Model Renderer. The renderer supports advanced features like animations, particles, conditional rendering, dynamic content, and interactive components.

## 📋 Table of Contents

1. [Basic Structure](#basic-structure)
2. [Style Variables & Animations](#style-variables--animations)
3. [Component Types](#component-types)
4. [Dynamic Content & Templates](#dynamic-content--templates)
5. [Conditional Rendering](#conditional-rendering)
6. [Interactive Components](#interactive-components)
7. [Particles & Effects](#particles--effects)
8. [Gallery Components](#gallery-components)
9. [Form Handling](#form-handling)
10. [Best Practices](#best-practices)
11. [Examples](#examples)

---

## 🏗️ Basic Structure

Every JSON template must follow this basic structure:

```json
{
  "metadata": {
    "name": "Template Name",
    "description": "Template description",
    "template": "template-type",
    "version": "1.0",
    "features": ["feature1", "feature2"]
  },
  "styleVariables": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af"
  },
  "animations": {
    "animationName": {
      "keyframes": {},
      "duration": "1s",
      "easing": "ease"
    }
  },
  "component": {
    "id": "root-component",
    "type": "div",
    "props": {
      "className": "container"
    },
    "children": []
  }
}
```

---

## 🎨 Style Variables & Animations

### Style Variables
Define CSS custom properties that can be used throughout your template:

```json
{
  "styleVariables": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "backgroundColor": "#ffffff",
    "textColor": "#111827",
    "accentColor": "#60a5fa",
    "gradientStart": "#3b82f6",
    "gradientEnd": "#1d4ed8",
    "fontFamily": "'Inter', sans-serif",
    "borderRadius": "8px",
    "shadowColor": "rgba(0, 0, 0, 0.1)"
  }
}
```

### Custom Animations
Create custom CSS animations with keyframes:

```json
{
  "animations": {
    "fadeInUp": {
      "keyframes": {
        "0%": { "opacity": "0", "transform": "translateY(30px)" },
        "100%": { "opacity": "1", "transform": "translateY(0)" }
      },
      "duration": "0.8s",
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
      "delay": "0s",
      "iterations": "1",
      "direction": "normal",
      "fillMode": "both"
    },
    "slideInLeft": {
      "keyframes": {
        "0%": { "opacity": "0", "transform": "translateX(-50px)" },
        "100%": { "opacity": "1", "transform": "translateX(0)" }
      },
      "duration": "0.6s",
      "easing": "ease-out"
    },
    "scaleIn": {
      "keyframes": {
        "0%": { "opacity": "0", "transform": "scale(0.9)" },
        "100%": { "opacity": "1", "transform": "scale(1)" }
      },
      "duration": "0.5s",
      "easing": "ease-out"
    },
    "float": {
      "keyframes": {
        "0%": { "transform": "translateY(0px)" },
        "50%": { "transform": "translateY(-10px)" },
        "100%": { "transform": "translateY(0px)" }
      },
      "duration": "3s",
      "easing": "ease-in-out",
      "iterations": "infinite"
    },
    "rotate": {
      "keyframes": {
        "0%": { "transform": "rotate(0deg)" },
        "100%": { "transform": "rotate(360deg)" }
      },
      "duration": "2s",
      "easing": "linear",
      "iterations": "infinite"
    }
  }
}
```

**Usage in Components:**
```json
{
  "type": "div",
  "props": {
    "className": "animate-fadeInUp"
  }
}
```

---

## 🧩 Component Types

### Supported HTML Elements
```json
{
  "type": "div|section|article|header|footer|main|aside|nav",
  "type": "h1|h2|h3|h4|h5|h6|p|span|a|img|button",
  "type": "input|textarea|select|form|label",
  "type": "ul|ol|li|table|thead|tbody|tr|th|td",
  "type": "svg|path"
}
```

### Special Components
```json
{
  "type": "BeforeAfterSlider",
  "props": {
    "beforeImage": "image-url-1",
    "afterImage": "image-url-2",
    "className": "custom-class"
  }
}
```

### Component Properties
```json
{
  "id": "unique-component-id",
  "type": "div",
  "props": {
    "className": "css-classes",
    "style": "inline-styles",
    "onClick": "{handleClick}",
    "onSubmit": "{handleFormSubmit}",
    "href": "{{content.website}}",
    "src": "{{content.image}}",
    "alt": "{{content.name}}"
  },
  "children": ["text content"],
  "editable": { "contentEditable": true },
  "if": "content.showSection",
  "unless": "content.hideSection",
  "show": "content.isVisible"
}
```

---

## 🔄 Dynamic Content & Templates

### Template Expressions
Use double curly braces for dynamic content:

```json
{
  "children": ["{{content.name || 'Default Name'}}"]
}
```

### Supported Expressions
```json
{
  "basic": "{{content.name}}",
  "fallback": "{{content.name || 'Default'}}",
  "ternary": "{{content.isActive ? 'Active' : 'Inactive'}}",
  "string_methods": "{{content.name.charAt(0).toUpperCase()}}",
  "array_access": "{{content.photos[0].url}}",
  "array_length": "{{content.photos.length}}",
  "complex": "{{(content.firstName || content.name) + ' - ' + content.title}}"
}
```

### Content Paths
```json
{
  "content.basics.name": "Basic information",
  "content.story.origin": "Story content",
  "content.visuals.hero": "Image arrays",
  "content.impact.metrics": "Metrics data",
  "content.contact.email": "Contact information",
  "images[0]": "Direct image access",
  "state.componentActive": "Component state",
  "formData.email": "Form data"
}
```

---

## ⚡ Conditional Rendering

### If Conditions
```json
{
  "id": "conditional-section",
  "type": "div",
  "if": "content.showSection",
  "children": ["This shows only if condition is true"]
}
```

### Unless Conditions
```json
{
  "id": "fallback-section",
  "type": "div",
  "unless": "content.hasContent",
  "children": ["This shows only if condition is false"]
}
```

### Show Conditions
```json
{
  "id": "visibility-section",
  "type": "div",
  "show": "content.isVisible && content.hasData",
  "children": ["Complex visibility logic"]
}
```

### Complex Conditions
```json
{
  "if": "content.photos && content.photos.length > 0",
  "unless": "content.hideGallery || content.photos.length === 0",
  "show": "content.user.isActive && content.user.hasPermission"
}
```

---

## 🎮 Interactive Components

### Event Handlers
```json
{
  "type": "button",
  "props": {
    "onClick": "{handleClick}",
    "className": "interactive-button"
  },
  "children": ["Click Me"]
}
```

### Supported Events
```json
{
  "onClick": "{handleClick}",
  "onSubmit": "{handleFormSubmit}",
  "onChange": "{handleInputChange}",
  "onToggle": "{handleToggle}"
}
```

### State Management
Components can maintain state through the renderer:

```json
{
  "type": "div",
  "props": {
    "className": "{{state.menuOpen ? 'menu-open' : 'menu-closed'}}",
    "onClick": "{handleToggle}"
  }
}
```

---

## ✨ Particles & Effects

### Basic Particles
```json
{
  "id": "hero-particles",
  "type": "div",
  "props": {
    "className": "absolute inset-0 opacity-30"
  },
  "children": [
    {
      "id": "particle-1",
      "type": "div",
      "props": {
        "className": "absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"
      }
    },
    {
      "id": "particle-2",
      "type": "div",
      "props": {
        "className": "absolute top-3/4 right-1/3 w-1 h-1 bg-blue-200 rounded-full animate-bounce"
      }
    },
    {
      "id": "particle-3",
      "type": "div",
      "props": {
        "className": "absolute top-1/2 right-1/4 w-3 h-3 bg-blue-300 rounded-full animate-ping"
      }
    }
  ]
}
```

### Advanced Particles with Custom Animations
```json
{
  "id": "floating-particles",
  "type": "div",
  "props": {
    "className": "absolute inset-0 pointer-events-none"
  },
  "children": [
    {
      "id": "float-particle-1",
      "type": "div",
      "props": {
        "className": "absolute top-10 left-10 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-float"
      }
    },
    {
      "id": "rotate-particle-2",
      "type": "div",
      "props": {
        "className": "absolute bottom-20 right-20 w-6 h-6 border-2 border-yellow-400 animate-rotate"
      }
    }
  ]
}
```

### Built-in Animation Classes
```css
/* Available in renderer */
.animate-float        /* Custom floating animation */
.animate-pulse-slow   /* Slow pulse */
.animate-bounce-slow  /* Slow bounce */
.hover-lift          /* Lift on hover */
.hover-scale         /* Scale on hover */
.fade-in-up          /* Scroll-triggered fade up */
.slide-in-left       /* Scroll-triggered slide left */
.scale-in            /* Scroll-triggered scale in */
```

---

## 🖼️ Gallery Components

### Hero Gallery
```json
{
  "id": "hero-gallery",
  "type": "div",
  "props": {
    "className": "hero-gallery-component"
  },
  "children": "HERO_GALLERY"
}
```

### Process Gallery
```json
{
  "id": "process-gallery",
  "type": "div",
  "props": {
    "className": "process-gallery-component"
  },
  "children": "PROCESS_GALLERY"
}
```

### Before/After Gallery
```json
{
  "id": "before-after-gallery",
  "type": "div",
  "props": {
    "className": "before-after-gallery-component"
  },
  "children": "BEFORE_AFTER_GALLERY"
}
```

### Lifestyle Gallery
```json
{
  "id": "lifestyle-gallery",
  "type": "div",
  "props": {
    "className": "lifestyle-gallery-component"
  },
  "children": "LIFESTYLE_GALLERY"
}
```

### Special Arrays
```json
{
  "children": "SPECIALTIES_ARRAY",    // Generates specialty items
  "children": "ACHIEVEMENTS_ARRAY",   // Generates achievement items
  "children": "TESTIMONIALS_ARRAY",   // Generates testimonial cards
  "children": "METRICS_ARRAY",        // Generates metric cards
  "children": "CASE_STUDIES_ARRAY",   // Generates case study cards
  "children": "AWARDS_ARRAY"          // Generates award badges
}
```

---

## 📝 Form Handling

### Basic Form
```json
{
  "id": "contact-form",
  "type": "form",
  "props": {
    "className": "space-y-4",
    "onSubmit": "{handleFormSubmit}"
  },
  "children": [
    {
      "id": "name-input",
      "type": "input",
      "props": {
        "type": "text",
        "name": "name",
        "placeholder": "Your Name",
        "className": "w-full px-4 py-2 border rounded-lg",
        "onChange": "{handleInputChange}"
      }
    },
    {
      "id": "email-input",
      "type": "input",
      "props": {
        "type": "email",
        "name": "email",
        "placeholder": "Your Email",
        "className": "w-full px-4 py-2 border rounded-lg",
        "onChange": "{handleInputChange}"
      }
    },
    {
      "id": "submit-button",
      "type": "button",
      "props": {
        "type": "submit",
        "className": "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      },
      "children": ["Submit"]
    }
  ]
}
```

### Form Validation
The renderer automatically handles:
- Email validation
- Required field validation
- Error display
- Form state management

---

## 🎯 Best Practices

### 1. Component Organization
```json
{
  "id": "descriptive-unique-id",
  "type": "semantic-html-element",
  "props": {
    "className": "utility-first-classes"
  }
}
```

### 2. Responsive Design
```json
{
  "props": {
    "className": "text-sm md:text-base lg:text-lg xl:text-xl"
  }
}
```

### 3. Accessibility
```json
{
  "type": "img",
  "props": {
    "src": "{{content.image}}",
    "alt": "{{content.imageDescription || content.name}}",
    "className": "responsive-image"
  }
}
```

### 4. Performance
```json
{
  "if": "content.hasLargeContent",
  "children": "LAZY_LOADED_CONTENT"
}
```

### 5. Maintainability
- Use consistent naming conventions
- Group related components
- Comment complex logic
- Use semantic HTML elements

---

## 📖 Complete Examples

### 1. Hero Section with Particles
```json
{
  "id": "hero-section",
  "type": "section",
  "props": {
    "className": "relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden"
  },
  "children": [
    {
      "id": "hero-particles",
      "type": "div",
      "props": {
        "className": "absolute inset-0 opacity-30"
      },
      "children": [
        {
          "id": "particle-1",
          "type": "div",
          "props": {
            "className": "absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"
          }
        },
        {
          "id": "particle-2",
          "type": "div",
          "props": {
            "className": "absolute top-3/4 right-1/3 w-1 h-1 bg-blue-200 rounded-full animate-bounce"
          }
        }
      ]
    },
    {
      "id": "hero-content",
      "type": "div",
      "props": {
        "className": "relative z-10 text-center"
      },
      "children": [
        {
          "id": "hero-title",
          "type": "h1",
          "props": {
            "className": "text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp"
          },
          "children": ["{{content.basics.name || 'Amazing Product'}}"],
          "editable": { "contentEditable": true }
        }
      ]
    }
  ]
}
```

### 2. Interactive Timeline
```json
{
  "id": "timeline-item",
  "type": "div",
  "props": {
    "className": "timeline-item slide-in-left",
    "onClick": "{handleClick}"
  },
  "children": [
    {
      "id": "timeline-marker",
      "type": "div",
      "props": {
        "className": "w-6 h-6 bg-blue-500 rounded-full hover-scale"
      }
    },
    {
      "id": "timeline-content",
      "type": "div",
      "props": {
        "className": "bg-white p-6 rounded-lg shadow-lg hover-lift"
      },
      "children": [
        {
          "id": "timeline-title",
          "type": "h3",
          "props": {
            "className": "font-bold mb-2"
          },
          "children": ["{{content.story.title}}"],
          "editable": { "contentEditable": true }
        }
      ]
    }
  ]
}
```

### 3. Conditional Gallery
```json
{
  "id": "gallery-section",
  "type": "section",
  "if": "content.visuals.hero && content.visuals.hero.length > 0",
  "props": {
    "className": "py-16"
  },
  "children": [
    {
      "id": "gallery-header",
      "type": "h2",
      "props": {
        "className": "text-3xl font-bold text-center mb-8 fade-in-up"
      },
      "children": ["Our Gallery"]
    },
    {
      "id": "hero-gallery",
      "type": "div",
      "props": {
        "className": "hero-gallery-component"
      },
      "children": "HERO_GALLERY"
    }
  ]
}
```

---

## 🚀 Advanced Features

### Custom CSS Utilities
The renderer includes these utility classes:

```css
/* Backdrop Effects */
.backdrop-blur-sm, .backdrop-blur, .backdrop-blur-lg

/* Gradients */
.bg-gradient-radial, .bg-gradient-conic

/* Text Effects */
.text-shadow, .text-shadow-lg

/* Glass Effect */
.glass-effect

/* Hover Effects */
.hover-lift, .hover-scale

/* Scroll Animations */
.fade-in-up, .slide-in-left, .scale-in
```

### State Management
```json
{
  "type": "div",
  "props": {
    "className": "{{state.isActive ? 'active-state' : 'inactive-state'}}",
    "onClick": "{handleToggle}"
  }
}
```

### Error Handling
The renderer includes built-in error boundaries and validation.

---

## 🔧 Troubleshooting

### Common Issues

1. **Particles not showing**: Ensure parent has `relative` positioning
2. **Animations not working**: Check animation names match exactly
3. **Dynamic content empty**: Verify content path exists
4. **Conditional rendering fails**: Check expression syntax
5. **Forms not submitting**: Ensure proper event handlers

### Debug Mode
Enable debug mode for detailed logging:

```javascript
<EnhancedJSONModelRenderer debug={true} />
```

---

## 📚 Reference

### Template Structure Validation
- All components must have `id` and `type`
- Props are optional but recommended
- Children can be strings, arrays, or special tokens
- Conditional properties are optional

### Performance Tips
- Use conditional rendering to reduce DOM size
- Implement lazy loading for large content
- Optimize image sizes and formats
- Use CSS transforms for animations

### Browser Support
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
- CSS Grid and Flexbox support required
- ES6+ JavaScript features used

---

This documentation covers all aspects of creating JSON templates for the Enhanced JSON Model Renderer. For specific use cases or advanced features, refer to the example templates in the `/templates` directory.