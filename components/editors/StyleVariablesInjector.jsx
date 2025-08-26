'use client';

import { useEffect } from 'react';

const StyleVariablesInjector = ({ styleVariables, debug = false }) => {
  useEffect(() => {
    const styleId = 'enhanced-json-style-variables';
    let existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      existingStyle = document.createElement('style');
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }
    
    // Add style variables if they exist (AI template support)
    let cssVariables = '';
    if (styleVariables) {
      if (debug) {
        console.log('Processing style variables:', styleVariables);
      }
      
      cssVariables = ':root {\n';
      Object.entries(styleVariables).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects like { colors: { primary: '#blue' } }
          Object.entries(value).forEach(([subKey, subValue]) => {
            cssVariables += `  --${key}-${subKey}: ${subValue};\n`;
          });
        } else {
          // Handle direct values like { primaryColor: '#blue' }
          cssVariables += `  --${key}: ${value};\n`;
        }
      });
      cssVariables += '}\n';
      
      if (debug) {
        console.log('Generated CSS variables:', cssVariables);
      }
    }
    
    existingStyle.textContent = cssVariables;
    
    // Cleanup function
    return () => {
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, [styleVariables, debug]);

  return null; // This component doesn't render anything
};

export default StyleVariablesInjector;