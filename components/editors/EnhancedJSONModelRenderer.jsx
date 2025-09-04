'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, useReducer } from 'react';
import ComponentEditDialog from './ComponentEditDialog';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import { evaluateExpression, processTemplateString } from './utils/expressionEvaluator.js';
import { handleConditionalRendering } from './utils/conditionalRenderer.js';
import { 
  generateSpecialtiesArray, 
  generateAchievementsArray, 
  generateFeatureComponents, 
  generateSpecComponents 
} from './utils/arrayProcessors.js';

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
          [action.field]: null
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
    console.log('🎨 [RENDERER] EnhancedJSONModelRenderer inputs:', { 
      model: !!model, 
      content: !!content, 
      contentKeys: content ? Object.keys(content) : [],
      images: images?.length || 0, 
      isEditing,
      visualsData: content?.visuals
    });
  }

  const [state, dispatch] = useReducer(stateReducer, {
    componentState: {},
    formData: {},
    errors: {}
  });

  const [editingText, setEditingText] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [renderError, setRenderError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  
  const editInputRef = useRef(null);
  const renderCountRef = useRef(0);
  const styleSheetRef = useRef(null);

  if (!model) {
    console.error('Invalid model: model is undefined or null', model);
    return <div>Invalid template model: Model is missing</div>;
  }
  if (!model.component) {
    console.error('Invalid model: missing component', model);
    return <div>Invalid template model: Component is missing</div>;
  }

  // Enhanced CSS Variables and Animations Support
  useEffect(() => {
    if (!model.styleVariables && !model.animations) return;

    if (styleSheetRef.current) {
      styleSheetRef.current.remove();
    }

    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-renderer-styles', 'true');
    
    let cssContent = '';

    if (model.styleVariables) {
      const cssVars = Object.entries(model.styleVariables)
        .map(([key, value]) => `--${key}: ${value};`)
        .join('\n    ');
      
      cssContent += `:root {\n    ${cssVars}\n}\n\n`;
    }

    if (model.animations) {
      Object.entries(model.animations).forEach(([animName, animConfig]) => {
        if (animConfig.keyframes) {
          const keyframes = Object.entries(animConfig.keyframes)
            .map(([percent, styles]) => {
              const styleStr = Object.entries(styles)
                .map(([prop, val]) => `${prop}: ${val};`)
                .join(' ');
              return `${percent} { ${styleStr} }`;
            })
            .join('\n    ');
          
          cssContent += `@keyframes ${animName} {\n    ${keyframes}\n}\n\n`;
        }

        cssContent += `.animate-${animName} {\n`;
        cssContent += `    animation: ${animName} ${animConfig.duration || '1s'} ${animConfig.easing || 'ease'} ${animConfig.delay || '0s'} ${animConfig.iterations || '1'} ${animConfig.direction || 'normal'} ${animConfig.fillMode || 'both'};\n`;
        cssContent += `}\n\n`;
      });
    }

    cssContent += `
/* Advanced Utilities */
.backdrop-blur-sm { backdrop-filter: blur(4px); }
.backdrop-blur { backdrop-filter: blur(8px); }
.backdrop-blur-lg { backdrop-filter: blur(16px); }
.bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
.bg-gradient-to-tr { background-image: linear-gradient(to top right, var(--tw-gradient-stops)); }
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
.bg-gradient-to-b { background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); }
.bg-gradient-to-bl { background-image: linear-gradient(to bottom left, var(--tw-gradient-stops)); }
.bg-gradient-to-l { background-image: linear-gradient(to left, var(--tw-gradient-stops)); }
.bg-gradient-to-tl { background-image: linear-gradient(to top left, var(--tw-gradient-stops)); }
.bg-gradient-radial { background: radial-gradient(circle, var(--tw-gradient-stops)); }
.bg-gradient-conic { background: conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops)); }

/* Gradient Color Stops - FROM */
.from-slate-50 { --tw-gradient-from: #f8fafc; --tw-gradient-to: rgb(248 250 252 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-100 { --tw-gradient-from: #f1f5f9; --tw-gradient-to: rgb(241 245 249 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-200 { --tw-gradient-from: #e2e8f0; --tw-gradient-to: rgb(226 232 240 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-300 { --tw-gradient-from: #cbd5e1; --tw-gradient-to: rgb(203 213 225 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-400 { --tw-gradient-from: #94a3b8; --tw-gradient-to: rgb(148 163 184 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-500 { --tw-gradient-from: #64748b; --tw-gradient-to: rgb(100 116 139 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-600 { --tw-gradient-from: #475569; --tw-gradient-to: rgb(71 85 105 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-700 { --tw-gradient-from: #334155; --tw-gradient-to: rgb(51 65 85 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-800 { --tw-gradient-from: #1e293b; --tw-gradient-to: rgb(30 41 59 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-900 { --tw-gradient-from: #0f172a; --tw-gradient-to: rgb(15 23 42 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-slate-950 { --tw-gradient-from: #020617; --tw-gradient-to: rgb(2 6 23 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-gray-50 { --tw-gradient-from: #f9fafb; --tw-gradient-to: rgb(249 250 251 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-100 { --tw-gradient-from: #f3f4f6; --tw-gradient-to: rgb(243 244 246 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-200 { --tw-gradient-from: #e5e7eb; --tw-gradient-to: rgb(229 231 235 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-300 { --tw-gradient-from: #d1d5db; --tw-gradient-to: rgb(209 213 219 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-400 { --tw-gradient-from: #9ca3af; --tw-gradient-to: rgb(156 163 175 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-500 { --tw-gradient-from: #6b7280; --tw-gradient-to: rgb(107 114 128 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-600 { --tw-gradient-from: #4b5563; --tw-gradient-to: rgb(75 85 99 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-700 { --tw-gradient-from: #374151; --tw-gradient-to: rgb(55 65 81 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-800 { --tw-gradient-from: #1f2937; --tw-gradient-to: rgb(31 41 59 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-900 { --tw-gradient-from: #111827; --tw-gradient-to: rgb(17 24 39 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-gray-950 { --tw-gradient-from: #030712; --tw-gradient-to: rgb(3 7 18 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-red-50 { --tw-gradient-from: #fef2f2; --tw-gradient-to: rgb(254 242 242 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-100 { --tw-gradient-from: #fee2e2; --tw-gradient-to: rgb(254 226 226 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-200 { --tw-gradient-from: #fecaca; --tw-gradient-to: rgb(254 202 202 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-300 { --tw-gradient-from: #fca5a5; --tw-gradient-to: rgb(252 165 165 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-400 { --tw-gradient-from: #f87171; --tw-gradient-to: rgb(248 113 113 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-500 { --tw-gradient-from: #ef4444; --tw-gradient-to: rgb(239 68 68 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-600 { --tw-gradient-from: #dc2626; --tw-gradient-to: rgb(220 38 38 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-700 { --tw-gradient-from: #b91c1c; --tw-gradient-to: rgb(185 28 28 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-800 { --tw-gradient-from: #991b1b; --tw-gradient-to: rgb(153 27 27 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-900 { --tw-gradient-from: #7f1d1d; --tw-gradient-to: rgb(127 29 29 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-red-950 { --tw-gradient-from: #450a0a; --tw-gradient-to: rgb(69 10 10 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-orange-50 { --tw-gradient-from: #fff7ed; --tw-gradient-to: rgb(255 247 237 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-100 { --tw-gradient-from: #ffedd5; --tw-gradient-to: rgb(255 237 213 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-200 { --tw-gradient-from: #fed7aa; --tw-gradient-to: rgb(254 215 170 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-300 { --tw-gradient-from: #fdba74; --tw-gradient-to: rgb(253 186 116 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-400 { --tw-gradient-from: #fb923c; --tw-gradient-to: rgb(251 146 60 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-500 { --tw-gradient-from: #f97316; --tw-gradient-to: rgb(249 115 22 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-600 { --tw-gradient-from: #ea580c; --tw-gradient-to: rgb(234 88 12 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-700 { --tw-gradient-from: #c2410c; --tw-gradient-to: rgb(194 65 12 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-800 { --tw-gradient-from: #9a3412; --tw-gradient-to: rgb(154 52 18 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-900 { --tw-gradient-from: #7c2d12; --tw-gradient-to: rgb(124 45 18 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-orange-950 { --tw-gradient-from: #431407; --tw-gradient-to: rgb(67 20 7 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-yellow-50 { --tw-gradient-from: #fefce8; --tw-gradient-to: rgb(254 252 232 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-100 { --tw-gradient-from: #fef9c3; --tw-gradient-to: rgb(254 249 195 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-200 { --tw-gradient-from: #fef08a; --tw-gradient-to: rgb(254 240 138 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-300 { --tw-gradient-from: #fde047; --tw-gradient-to: rgb(253 224 71 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-400 { --tw-gradient-from: #facc15; --tw-gradient-to: rgb(250 204 21 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-500 { --tw-gradient-from: #eab308; --tw-gradient-to: rgb(234 179 8 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-600 { --tw-gradient-from: #ca8a04; --tw-gradient-to: rgb(202 138 4 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-700 { --tw-gradient-from: #a16207; --tw-gradient-to: rgb(161 98 7 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-800 { --tw-gradient-from: #854d0e; --tw-gradient-to: rgb(133 77 14 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-900 { --tw-gradient-from: #713f12; --tw-gradient-to: rgb(113 63 18 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-yellow-950 { --tw-gradient-from: #422006; --tw-gradient-to: rgb(66 32 6 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-green-50 { --tw-gradient-from: #f0fdf4; --tw-gradient-to: rgb(240 253 244 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-100 { --tw-gradient-from: #dcfce7; --tw-gradient-to: rgb(220 252 231 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-200 { --tw-gradient-from: #bbf7d0; --tw-gradient-to: rgb(187 247 208 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-300 { --tw-gradient-from: #86efac; --tw-gradient-to: rgb(134 239 172 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-400 { --tw-gradient-from: #4ade80; --tw-gradient-to: rgb(74 222 128 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-500 { --tw-gradient-from: #22c55e; --tw-gradient-to: rgb(34 197 94 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-600 { --tw-gradient-from: #16a34a; --tw-gradient-to: rgb(22 163 74 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-700 { --tw-gradient-from: #15803d; --tw-gradient-to: rgb(21 128 61 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-800 { --tw-gradient-from: #166534; --tw-gradient-to: rgb(22 101 52 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-900 { --tw-gradient-from: #14532d; --tw-gradient-to: rgb(20 83 45 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-green-950 { --tw-gradient-from: #052e16; --tw-gradient-to: rgb(5 46 22 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-blue-50 { --tw-gradient-from: #eff6ff; --tw-gradient-to: rgb(239 246 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-100 { --tw-gradient-from: #dbeafe; --tw-gradient-to: rgb(219 234 254 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-200 { --tw-gradient-from: #bfdbfe; --tw-gradient-to: rgb(191 219 254 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-300 { --tw-gradient-from: #93c5fd; --tw-gradient-to: rgb(147 197 253 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-400 { --tw-gradient-from: #60a5fa; --tw-gradient-to: rgb(96 165 250 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-to: rgb(59 130 246 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-600 { --tw-gradient-from: #2563eb; --tw-gradient-to: rgb(37 99 235 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-700 { --tw-gradient-from: #1d4ed8; --tw-gradient-to: rgb(29 78 216 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-800 { --tw-gradient-from: #1e40af; --tw-gradient-to: rgb(30 64 175 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-900 { --tw-gradient-from: #1e3a8a; --tw-gradient-to: rgb(30 58 138 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-blue-950 { --tw-gradient-from: #172554; --tw-gradient-to: rgb(23 37 84 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-purple-50 { --tw-gradient-from: #faf5ff; --tw-gradient-to: rgb(250 245 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-100 { --tw-gradient-from: #f3e8ff; --tw-gradient-to: rgb(243 232 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-200 { --tw-gradient-from: #e9d5ff; --tw-gradient-to: rgb(233 213 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-300 { --tw-gradient-from: #d8b4fe; --tw-gradient-to: rgb(216 180 254 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-400 { --tw-gradient-from: #c084fc; --tw-gradient-to: rgb(192 132 252 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-500 { --tw-gradient-from: #a855f7; --tw-gradient-to: rgb(168 85 247 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-600 { --tw-gradient-from: #9333ea; --tw-gradient-to: rgb(147 51 234 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-700 { --tw-gradient-from: #7e22ce; --tw-gradient-to: rgb(126 34 206 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-800 { --tw-gradient-from: #6b21a8; --tw-gradient-to: rgb(107 33 168 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-900 { --tw-gradient-from: #581c87; --tw-gradient-to: rgb(88 28 135 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-purple-950 { --tw-gradient-from: #3b0764; --tw-gradient-to: rgb(59 7 100 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-pink-50 { --tw-gradient-from: #fdf2f8; --tw-gradient-to: rgb(253 242 248 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-100 { --tw-gradient-from: #fce7f3; --tw-gradient-to: rgb(252 231 243 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-200 { --tw-gradient-from: #fbcfe8; --tw-gradient-to: rgb(251 207 232 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-300 { --tw-gradient-from: #f9a8d4; --tw-gradient-to: rgb(249 168 212 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-400 { --tw-gradient-from: #f472b6; --tw-gradient-to: rgb(244 114 182 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-500 { --tw-gradient-from: #ec4899; --tw-gradient-to: rgb(236 72 153 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-600 { --tw-gradient-from: #db2777; --tw-gradient-to: rgb(219 39 119 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-700 { --tw-gradient-from: #be185d; --tw-gradient-to: rgb(190 24 93 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-800 { --tw-gradient-from: #9d174d; --tw-gradient-to: rgb(157 23 77 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-900 { --tw-gradient-from: #831843; --tw-gradient-to: rgb(131 24 67 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-pink-950 { --tw-gradient-from: #500724; --tw-gradient-to: rgb(80 7 36 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

.from-white { --tw-gradient-from: #ffffff; --tw-gradient-to: rgb(255 255 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-black { --tw-gradient-from: #000000; --tw-gradient-to: rgb(0 0 0 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-transparent { --tw-gradient-from: transparent; --tw-gradient-to: rgb(0 0 0 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }

/* Gradient Color Stops - VIA */
.via-slate-50 { --tw-gradient-to: rgb(248 250 252 / 0); --tw-gradient-stops: var(--tw-gradient-from), #f8fafc, var(--tw-gradient-to); }
.via-slate-100 { --tw-gradient-to: rgb(241 245 249 / 0); --tw-gradient-stops: var(--tw-gradient-from), #f1f5f9, var(--tw-gradient-to); }
.via-slate-200 { --tw-gradient-to: rgb(226 232 240 / 0); --tw-gradient-stops: var(--tw-gradient-from), #e2e8f0, var(--tw-gradient-to); }
.via-slate-300 { --tw-gradient-to: rgb(203 213 225 / 0); --tw-gradient-stops: var(--tw-gradient-from), #cbd5e1, var(--tw-gradient-to); }
.via-slate-400 { --tw-gradient-to: rgb(148 163 184 / 0); --tw-gradient-stops: var(--tw-gradient-from), #94a3b8, var(--tw-gradient-to); }
.via-slate-500 { --tw-gradient-to: rgb(100 116 139 / 0); --tw-gradient-stops: var(--tw-gradient-from), #64748b, var(--tw-gradient-to); }
.via-slate-600 { --tw-gradient-to: rgb(71 85 105 / 0); --tw-gradient-stops: var(--tw-gradient-from), #475569, var(--tw-gradient-to); }
.via-slate-700 { --tw-gradient-to: rgb(51 65 85 / 0); --tw-gradient-stops: var(--tw-gradient-from), #334155, var(--tw-gradient-to); }
.via-slate-800 { --tw-gradient-to: rgb(30 41 59 / 0); --tw-gradient-stops: var(--tw-gradient-from), #1e293b, var(--tw-gradient-to); }
.via-slate-900 { --tw-gradient-to: rgb(15 23 42 / 0); --tw-gradient-stops: var(--tw-gradient-from), #0f172a, var(--tw-gradient-to); }
.via-slate-950 { --tw-gradient-to: rgb(2 6 23 / 0); --tw-gradient-stops: var(--tw-gradient-from), #020617, var(--tw-gradient-to); }

.via-gray-50 { --tw-gradient-to: rgb(249 250 251 / 0); --tw-gradient-stops: var(--tw-gradient-from), #f9fafb, var(--tw-gradient-to); }
.via-gray-100 { --tw-gradient-to: rgb(243 244 246 / 0); --tw-gradient-stops: var(--tw-gradient-from), #f3f4f6, var(--tw-gradient-to); }
.via-gray-200 { --tw-gradient-to: rgb(229 231 235 / 0); --tw-gradient-stops: var(--tw-gradient-from), #e5e7eb, var(--tw-gradient-to); }
.via-gray-300 { --tw-gradient-to: rgb(209 213 219 / 0); --tw-gradient-stops: var(--tw-gradient-from), #d1d5db, var(--tw-gradient-to); }
.via-gray-400 { --tw-gradient-to: rgb(156 163 175 / 0); --tw-gradient-stops: var(--tw-gradient-from), #9ca3af, var(--tw-gradient-to); }
.via-gray-500 { --tw-gradient-to: rgb(107 114 128 / 0); --tw-gradient-stops: var(--tw-gradient-from), #6b7280, var(--tw-gradient-to); }
.via-gray-600 { --tw-gradient-to: rgb(75 85 99 / 0); --tw-gradient-stops: var(--tw-gradient-from), #4b5563, var(--tw-gradient-to); }
.via-gray-700 { --tw-gradient-to: rgb(55 65 81 / 0); --tw-gradient-stops: var(--tw-gradient-from), #374151, var(--tw-gradient-to); }
.via-gray-800 { --tw-gradient-to: rgb(31 41 59 / 0); --tw-gradient-stops: var(--tw-gradient-from), #1f2937, var(--tw-gradient-to); }
.via-gray-900 { --tw-gradient-to: rgb(17 24 39 / 0); --tw-gradient-stops: var(--tw-gradient-from), #111827, var(--tw-gradient-to); }
.via-gray-950 { --tw-gradient-to: rgb(3 7 18 / 0); --tw-gradient-stops: var(--tw-gradient-from), #030712, var(--tw-gradient-to); }

.via-red-50 { --tw-gradient-to: rgb(254 242 242 / 0); --tw-gradient-stops: var(--tw-gradient-from), #fef2f2, var(--tw-gradient-to); }
.via-red-100 { --tw-gradient-to: rgb(254 226 226 / 0); --tw-gradient-stops: var(--tw-gradient-from), #fee2e2, var(--tw-gradient-to); }
.via-red-200 { --tw-gradient-to: rgb(254 202 202 / 0); --tw-gradient-stops: var(--tw-gradient-from), #fecaca, var(--tw-gradient-to); }
.via-red-300 { --tw-gradient-to: rgb(252 165 165 / 0); --tw-gradient-stops: var(--tw-gradient-from), #fca5a5, var(--tw-gradient-to); }
.via-red-400 { --tw-gradient-to: rgb(248 113 113 / 0); --tw-gradient-stops: var(--tw-gradient-from), #f87171, var(--tw-gradient-to); }
.via-red-500 { --tw-gradient-to: rgb(239 68 68 / 0); --tw-gradient-stops: var(--tw-gradient-from), #ef4444, var(--tw-gradient-to); }
.via-red-600 { --tw-gradient-to: rgb(220 38 38 / 0); --tw-gradient-stops: var(--tw-gradient-from), #dc2626, var(--tw-gradient-to); }
.via-red-700 { --tw-gradient-to: rgb(185 28 28 / 0); --tw-gradient-stops: var(--tw-gradient-from), #b91c1c, var(--tw-gradient-to); }
.via-red-800 { --tw-gradient-to: rgb(153 27 27 / 0); --tw-gradient-stops: var(--tw-gradient-from), #991b1b, var(--tw-gradient-to); }
.via-red-900 { --tw-gradient-to: rgb(127 29 29 / 0); --tw-gradient-stops: var(--tw-gradient-from), #7f1d1d, var(--tw-gradient-to); }
.via-red-950 { --tw-gradient-to: rgb(69 10 10 / 0); --tw-gradient-stops: var(--tw-gradient-from), #450a0a, var(--tw-gradient-to); }

.via-blue-50 { --tw-gradient-to: rgb(239 246 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), #eff6ff, var(--tw-gradient-to); }
.via-blue-100 { --tw-gradient-to: rgb(219 234 254 / 0); --tw-gradient-stops: var(--tw-gradient-from), #dbeafe, var(--tw-gradient-to); }
.via-blue-200 { --tw-gradient-to: rgb(191 219 254 / 0); --tw-gradient-stops: var(--tw-gradient-from), #bfdbfe, var(--tw-gradient-to); }
.via-blue-300 { --tw-gradient-to: rgb(147 197 253 / 0); --tw-gradient-stops: var(--tw-gradient-from), #93c5fd, var(--tw-gradient-to); }
.via-blue-400 { --tw-gradient-to: rgb(96 165 250 / 0); --tw-gradient-stops: var(--tw-gradient-from), #60a5fa, var(--tw-gradient-to); }
.via-blue-500 { --tw-gradient-to: rgb(59 130 246 / 0); --tw-gradient-stops: var(--tw-gradient-from), #3b82f6, var(--tw-gradient-to); }
.via-blue-600 { --tw-gradient-to: rgb(37 99 235 / 0); --tw-gradient-stops: var(--tw-gradient-from), #2563eb, var(--tw-gradient-to); }
.via-blue-700 { --tw-gradient-to: rgb(29 78 216 / 0); --tw-gradient-stops: var(--tw-gradient-from), #1d4ed8, var(--tw-gradient-to); }
.via-blue-800 { --tw-gradient-to: rgb(30 64 175 / 0); --tw-gradient-stops: var(--tw-gradient-from), #1e40af, var(--tw-gradient-to); }
.via-blue-900 { --tw-gradient-to: rgb(30 58 138 / 0); --tw-gradient-stops: var(--tw-gradient-from), #1e3a8a, var(--tw-gradient-to); }
.via-blue-950 { --tw-gradient-to: rgb(23 37 84 / 0); --tw-gradient-stops: var(--tw-gradient-from), #172554, var(--tw-gradient-to); }

.via-purple-50 { --tw-gradient-to: rgb(250 245 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), #faf5ff, var(--tw-gradient-to); }
.via-purple-100 { --tw-gradient-to: rgb(243 232 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), #f3e8ff, var(--tw-gradient-to); }
.via-purple-200 { --tw-gradient-to: rgb(233 213 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), #e9d5ff, var(--tw-gradient-to); }
.via-purple-300 { --tw-gradient-to: rgb(216 180 254 / 0); --tw-gradient-stops: var(--tw-gradient-from), #d8b4fe, var(--tw-gradient-to); }
.via-purple-400 { --tw-gradient-to: rgb(192 132 252 / 0); --tw-gradient-stops: var(--tw-gradient-from), #c084fc, var(--tw-gradient-to); }
.via-purple-500 { --tw-gradient-to: rgb(168 85 247 / 0); --tw-gradient-stops: var(--tw-gradient-from), #a855f7, var(--tw-gradient-to); }
.via-purple-600 { --tw-gradient-to: rgb(147 51 234 / 0); --tw-gradient-stops: var(--tw-gradient-from), #9333ea, var(--tw-gradient-to); }
.via-purple-700 { --tw-gradient-to: rgb(126 34 206 / 0); --tw-gradient-stops: var(--tw-gradient-from), #7e22ce, var(--tw-gradient-to); }
.via-purple-800 { --tw-gradient-to: rgb(107 33 168 / 0); --tw-gradient-stops: var(--tw-gradient-from), #6b21a8, var(--tw-gradient-to); }
.via-purple-900 { --tw-gradient-to: rgb(88 28 135 / 0); --tw-gradient-stops: var(--tw-gradient-from), #581c87, var(--tw-gradient-to); }
.via-purple-950 { --tw-gradient-to: rgb(59 7 100 / 0); --tw-gradient-stops: var(--tw-gradient-from), #3b0764, var(--tw-gradient-to); }

.via-white { --tw-gradient-to: rgb(255 255 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), #ffffff, var(--tw-gradient-to); }
.via-black { --tw-gradient-to: rgb(0 0 0 / 0); --tw-gradient-stops: var(--tw-gradient-from), #000000, var(--tw-gradient-to); }
.via-transparent { --tw-gradient-to: rgb(0 0 0 / 0); --tw-gradient-stops: var(--tw-gradient-from), transparent, var(--tw-gradient-to); }

/* Gradient Color Stops - TO */
.to-slate-50 { --tw-gradient-to: #f8fafc; }
.to-slate-100 { --tw-gradient-to: #f1f5f9; }
.to-slate-200 { --tw-gradient-to: #e2e8f0; }
.to-slate-300 { --tw-gradient-to: #cbd5e1; }
.to-slate-400 { --tw-gradient-to: #94a3b8; }
.to-slate-500 { --tw-gradient-to: #64748b; }
.to-slate-600 { --tw-gradient-to: #475569; }
.to-slate-700 { --tw-gradient-to: #334155; }
.to-slate-800 { --tw-gradient-to: #1e293b; }
.to-slate-900 { --tw-gradient-to: #0f172a; }
.to-slate-950 { --tw-gradient-to: #020617; }

.to-gray-50 { --tw-gradient-to: #f9fafb; }
.to-gray-100 { --tw-gradient-to: #f3f4f6; }
.to-gray-200 { --tw-gradient-to: #e5e7eb; }
.to-gray-300 { --tw-gradient-to: #d1d5db; }
.to-gray-400 { --tw-gradient-to: #9ca3af; }
.to-gray-500 { --tw-gradient-to: #6b7280; }
.to-gray-600 { --tw-gradient-to: #4b5563; }
.to-gray-700 { --tw-gradient-to: #374151; }
.to-gray-800 { --tw-gradient-to: #1f2937; }
.to-gray-900 { --tw-gradient-to: #111827; }
.to-gray-950 { --tw-gradient-to: #030712; }

.to-red-50 { --tw-gradient-to: #fef2f2; }
.to-red-100 { --tw-gradient-to: #fee2e2; }
.to-red-200 { --tw-gradient-to: #fecaca; }
.to-red-300 { --tw-gradient-to: #fca5a5; }
.to-red-400 { --tw-gradient-to: #f87171; }
.to-red-500 { --tw-gradient-to: #ef4444; }
.to-red-600 { --tw-gradient-to: #dc2626; }
.to-red-700 { --tw-gradient-to: #b91c1c; }
.to-red-800 { --tw-gradient-to: #991b1b; }
.to-red-900 { --tw-gradient-to: #7f1d1d; }
.to-red-950 { --tw-gradient-to: #450a0a; }

.to-orange-50 { --tw-gradient-to: #fff7ed; }
.to-orange-100 { --tw-gradient-to: #ffedd5; }
.to-orange-200 { --tw-gradient-to: #fed7aa; }
.to-orange-300 { --tw-gradient-to: #fdba74; }
.to-orange-400 { --tw-gradient-to: #fb923c; }
.to-orange-500 { --tw-gradient-to: #f97316; }
.to-orange-600 { --tw-gradient-to: #ea580c; }
.to-orange-700 { --tw-gradient-to: #c2410c; }
.to-orange-800 { --tw-gradient-to: #9a3412; }
.to-orange-900 { --tw-gradient-to: #7c2d12; }
.to-orange-950 { --tw-gradient-to: #431407; }

.to-yellow-50 { --tw-gradient-to: #fefce8; }
.to-yellow-100 { --tw-gradient-to: #fef9c3; }
.to-yellow-200 { --tw-gradient-to: #fef08a; }
.to-yellow-300 { --tw-gradient-to: #fde047; }
.to-yellow-400 { --tw-gradient-to: #facc15; }
.to-yellow-500 { --tw-gradient-to: #eab308; }
.to-yellow-600 { --tw-gradient-to: #ca8a04; }
.to-yellow-700 { --tw-gradient-to: #a16207; }
.to-yellow-800 { --tw-gradient-to: #854d0e; }
.to-yellow-900 { --tw-gradient-to: #713f12; }
.to-yellow-950 { --tw-gradient-to: #422006; }

.to-green-50 { --tw-gradient-to: #f0fdf4; }
.to-green-100 { --tw-gradient-to: #dcfce7; }
.to-green-200 { --tw-gradient-to: #bbf7d0; }
.to-green-300 { --tw-gradient-to: #86efac; }
.to-green-400 { --tw-gradient-to: #4ade80; }
.to-green-500 { --tw-gradient-to: #22c55e; }
.to-green-600 { --tw-gradient-to: #16a34a; }
.to-green-700 { --tw-gradient-to: #15803d; }
.to-green-800 { --tw-gradient-to: #166534; }
.to-green-900 { --tw-gradient-to: #14532d; }
.to-green-950 { --tw-gradient-to: #052e16; }

.to-blue-50 { --tw-gradient-to: #eff6ff; }
.to-blue-100 { --tw-gradient-to: #dbeafe; }
.to-blue-200 { --tw-gradient-to: #bfdbfe; }
.to-blue-300 { --tw-gradient-to: #93c5fd; }
.to-blue-400 { --tw-gradient-to: #60a5fa; }
.to-blue-500 { --tw-gradient-to: #3b82f6; }
.to-blue-600 { --tw-gradient-to: #2563eb; }
.to-blue-700 { --tw-gradient-to: #1d4ed8; }
.to-blue-800 { --tw-gradient-to: #1e40af; }
.to-blue-900 { --tw-gradient-to: #1e3a8a; }
.to-blue-950 { --tw-gradient-to: #172554; }

.to-purple-50 { --tw-gradient-to: #faf5ff; }
.to-purple-100 { --tw-gradient-to: #f3e8ff; }
.to-purple-200 { --tw-gradient-to: #e9d5ff; }
.to-purple-300 { --tw-gradient-to: #d8b4fe; }
.to-purple-400 { --tw-gradient-to: #c084fc; }
.to-purple-500 { --tw-gradient-to: #a855f7; }
.to-purple-600 { --tw-gradient-to: #9333ea; }
.to-purple-700 { --tw-gradient-to: #7e22ce; }
.to-purple-800 { --tw-gradient-to: #6b21a8; }
.to-purple-900 { --tw-gradient-to: #581c87; }
.to-purple-950 { --tw-gradient-to: #3b0764; }

.to-pink-50 { --tw-gradient-to: #fdf2f8; }
.to-pink-100 { --tw-gradient-to: #fce7f3; }
.to-pink-200 { --tw-gradient-to: #fbcfe8; }
.to-pink-300 { --tw-gradient-to: #f9a8d4; }
.to-pink-400 { --tw-gradient-to: #f472b6; }
.to-pink-500 { --tw-gradient-to: #ec4899; }
.to-pink-600 { --tw-gradient-to: #db2777; }
.to-pink-700 { --tw-gradient-to: #be185d; }
.to-pink-800 { --tw-gradient-to: #9d174d; }
.to-pink-900 { --tw-gradient-to: #831843; }
.to-pink-950 { --tw-gradient-to: #500724; }

.to-white { --tw-gradient-to: #ffffff; }
.to-black { --tw-gradient-to: #000000; }
.to-transparent { --tw-gradient-to: transparent; }
.animate-float { animation: float 3s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
.animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-bounce-slow { animation: bounce 2s infinite; }
.text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.text-shadow-lg { text-shadow: 0 4px 8px rgba(0,0,0,0.2); }
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.hover-lift:hover { transform: translateY(-4px); transition: transform 0.3s ease; }
.hover-scale:hover { transform: scale(1.05); transition: transform 0.3s ease; }
.fade-in-up { opacity: 0; transform: translateY(30px); transition: all 0.6s ease; }
.fade-in-up.visible { opacity: 1; transform: translateY(0); }
.slide-in-left { opacity: 0; transform: translateX(-50px); transition: all 0.6s ease; }
.slide-in-left.visible { opacity: 1; transform: translateX(0); }
.scale-in { opacity: 0; transform: scale(0.9); transition: all 0.5s ease; }
.scale-in.visible { opacity: 1; transform: scale(1); }

/* Full Tailwind Color Palette */
/* Slate */
.bg-slate-50 { background-color: #f8fafc; }
.bg-slate-100 { background-color: #f1f5f9; }
.bg-slate-200 { background-color: #e2e8f0; }
.bg-slate-300 { background-color: #cbd5e1; }
.bg-slate-400 { background-color: #94a3b8; }
.bg-slate-500 { background-color: #64748b; }
.bg-slate-600 { background-color: #475569; }
.bg-slate-700 { background-color: #334155; }
.bg-slate-800 { background-color: #1e293b; }
.bg-slate-900 { background-color: #0f172a; }
.bg-slate-950 { background-color: #020617; }

.text-slate-50 { color: #f8fafc; }
.text-slate-100 { color: #f1f5f9; }
.text-slate-200 { color: #e2e8f0; }
.text-slate-300 { color: #cbd5e1; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
.text-slate-600 { color: #475569; }
.text-slate-700 { color: #334155; }
.text-slate-800 { color: #1e293b; }
.text-slate-900 { color: #0f172a; }
.text-slate-950 { color: #020617; }

/* Gray */
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-gray-300 { background-color: #d1d5db; }
.bg-gray-400 { background-color: #9ca3af; }
.bg-gray-500 { background-color: #6b7280; }
.bg-gray-600 { background-color: #4b5563; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-900 { background-color: #111827; }
.bg-gray-950 { background-color: #030712; }

.text-gray-50 { color: #f9fafb; }
.text-gray-100 { color: #f3f4f6; }
.text-gray-200 { color: #e5e7eb; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-gray-900 { color: #111827; }
.text-gray-950 { color: #030712; }

/* Red */
.bg-red-50 { background-color: #fef2f2; }
.bg-red-100 { background-color: #fee2e2; }
.bg-red-200 { background-color: #fecaca; }
.bg-red-300 { background-color: #fca5a5; }
.bg-red-400 { background-color: #f87171; }
.bg-red-500 { background-color: #ef4444; }
.bg-red-600 { background-color: #dc2626; }
.bg-red-700 { background-color: #b91c1c; }
.bg-red-800 { background-color: #991b1b; }
.bg-red-900 { background-color: #7f1d1d; }
.bg-red-950 { background-color: #450a0a; }

.text-red-50 { color: #fef2f2; }
.text-red-100 { color: #fee2e2; }
.text-red-200 { color: #fecaca; }
.text-red-300 { color: #fca5a5; }
.text-red-400 { color: #f87171; }
.text-red-500 { color: #ef4444; }
.text-red-600 { color: #dc2626; }
.text-red-700 { color: #b91c1c; }
.text-red-800 { color: #991b1b; }
.text-red-900 { color: #7f1d1d; }
.text-red-950 { color: #450a0a; }

/* Orange */
.bg-orange-50 { background-color: #fff7ed; }
.bg-orange-100 { background-color: #ffedd5; }
.bg-orange-200 { background-color: #fed7aa; }
.bg-orange-300 { background-color: #fdba74; }
.bg-orange-400 { background-color: #fb923c; }
.bg-orange-500 { background-color: #f97316; }
.bg-orange-600 { background-color: #ea580c; }
.bg-orange-700 { background-color: #c2410c; }
.bg-orange-800 { background-color: #9a3412; }
.bg-orange-900 { background-color: #7c2d12; }
.bg-orange-950 { background-color: #431407; }

.text-orange-50 { color: #fff7ed; }
.text-orange-100 { color: #ffedd5; }
.text-orange-200 { color: #fed7aa; }
.text-orange-300 { color: #fdba74; }
.text-orange-400 { color: #fb923c; }
.text-orange-500 { color: #f97316; }
.text-orange-600 { color: #ea580c; }
.text-orange-700 { color: #c2410c; }
.text-orange-800 { color: #9a3412; }
.text-orange-900 { color: #7c2d12; }
.text-orange-950 { color: #431407; }

/* Amber */
.bg-amber-50 { background-color: #fffbeb; }
.bg-amber-100 { background-color: #fef3c7; }
.bg-amber-200 { background-color: #fde68a; }
.bg-amber-300 { background-color: #fcd34d; }
.bg-amber-400 { background-color: #fbbf24; }
.bg-amber-500 { background-color: #f59e0b; }
.bg-amber-600 { background-color: #d97706; }
.bg-amber-700 { background-color: #b45309; }
.bg-amber-800 { background-color: #92400e; }
.bg-amber-900 { background-color: #78350f; }
.bg-amber-950 { background-color: #451a03; }

.text-amber-50 { color: #fffbeb; }
.text-amber-100 { color: #fef3c7; }
.text-amber-200 { color: #fde68a; }
.text-amber-300 { color: #fcd34d; }
.text-amber-400 { color: #fbbf24; }
.text-amber-500 { color: #f59e0b; }
.text-amber-600 { color: #d97706; }
.text-amber-700 { color: #b45309; }
.text-amber-800 { color: #92400e; }
.text-amber-900 { color: #78350f; }
.text-amber-950 { color: #451a03; }

/* Yellow */
.bg-yellow-50 { background-color: #fefce8; }
.bg-yellow-100 { background-color: #fef9c3; }
.bg-yellow-200 { background-color: #fef08a; }
.bg-yellow-300 { background-color: #fde047; }
.bg-yellow-400 { background-color: #facc15; }
.bg-yellow-500 { background-color: #eab308; }
.bg-yellow-600 { background-color: #ca8a04; }
.bg-yellow-700 { background-color: #a16207; }
.bg-yellow-800 { background-color: #854d0e; }
.bg-yellow-900 { background-color: #713f12; }
.bg-yellow-950 { background-color: #422006; }

.text-yellow-50 { color: #fefce8; }
.text-yellow-100 { color: #fef9c3; }
.text-yellow-200 { color: #fef08a; }
.text-yellow-300 { color: #fde047; }
.text-yellow-400 { color: #facc15; }
.text-yellow-500 { color: #eab308; }
.text-yellow-600 { color: #ca8a04; }
.text-yellow-700 { color: #a16207; }
.text-yellow-800 { color: #854d0e; }
.text-yellow-900 { color: #713f12; }
.text-yellow-950 { color: #422006; }

/* Lime */
.bg-lime-50 { background-color: #f7fee7; }
.bg-lime-100 { background-color: #ecfccb; }
.bg-lime-200 { background-color: #d9f99d; }
.bg-lime-300 { background-color: #bef264; }
.bg-lime-400 { background-color: #a3e635; }
.bg-lime-500 { background-color: #84cc16; }
.bg-lime-600 { background-color: #65a30d; }
.bg-lime-700 { background-color: #4d7c0f; }
.bg-lime-800 { background-color: #365314; }
.bg-lime-900 { background-color: #1a2e05; }
.bg-lime-950 { background-color: #0f1a02; }

.text-lime-50 { color: #f7fee7; }
.text-lime-100 { color: #ecfccb; }
.text-lime-200 { color: #d9f99d; }
.text-lime-300 { color: #bef264; }
.text-lime-400 { color: #a3e635; }
.text-lime-500 { color: #84cc16; }
.text-lime-600 { color: #65a30d; }
.text-lime-700 { color: #4d7c0f; }
.text-lime-800 { color: #365314; }
.text-lime-900 { color: #1a2e05; }
.text-lime-950 { color: #0f1a02; }

/* Green */
.bg-green-50 { background-color: #f0fdf4; }
.bg-green-100 { background-color: #dcfce7; }
.bg-green-200 { background-color: #bbf7d0; }
.bg-green-300 { background-color: #86efac; }
.bg-green-400 { background-color: #4ade80; }
.bg-green-500 { background-color: #22c55e; }
.bg-green-600 { background-color: #16a34a; }
.bg-green-700 { background-color: #15803d; }
.bg-green-800 { background-color: #166534; }
.bg-green-900 { background-color: #14532d; }
.bg-green-950 { background-color: #052e16; }

.text-green-50 { color: #f0fdf4; }
.text-green-100 { color: #dcfce7; }
.text-green-200 { color: #bbf7d0; }
.text-green-300 { color: #86efac; }
.text-green-400 { color: #4ade80; }
.text-green-500 { color: #22c55e; }
.text-green-600 { color: #16a34a; }
.text-green-700 { color: #15803d; }
.text-green-800 { color: #166534; }
.text-green-900 { color: #14532d; }
.text-green-950 { color: #052e16; }

/* Emerald */
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-emerald-100 { background-color: #d1fae5; }
.bg-emerald-200 { background-color: #a7f3d0; }
.bg-emerald-300 { background-color: #6ee7b7; }
.bg-emerald-400 { background-color: #34d399; }
.bg-emerald-500 { background-color: #10b981; }
.bg-emerald-600 { background-color: #059669; }
.bg-emerald-700 { background-color: #047857; }
.bg-emerald-800 { background-color: #065f46; }
.bg-emerald-900 { background-color: #064e3b; }
.bg-emerald-950 { background-color: #022c22; }

.text-emerald-50 { color: #ecfdf5; }
.text-emerald-100 { color: #d1fae5; }
.text-emerald-200 { color: #a7f3d0; }
.text-emerald-300 { color: #6ee7b7; }
.text-emerald-400 { color: #34d399; }
.text-emerald-500 { color: #10b981; }
.text-emerald-600 { color: #059669; }
.text-emerald-700 { color: #047857; }
.text-emerald-800 { color: #065f46; }
.text-emerald-900 { color: #064e3b; }
.text-emerald-950 { color: #022c22; }

/* Teal */
.bg-teal-50 { background-color: #f0fdfa; }
.bg-teal-100 { background-color: #ccfbf1; }
.bg-teal-200 { background-color: #99f6e4; }
.bg-teal-300 { background-color: #5eead4; }
.bg-teal-400 { background-color: #2dd4bf; }
.bg-teal-500 { background-color: #14b8a6; }
.bg-teal-600 { background-color: #0d9488; }
.bg-teal-700 { background-color: #0f766e; }
.bg-teal-800 { background-color: #115e59; }
.bg-teal-900 { background-color: #134e4a; }
.bg-teal-950 { background-color: #042f2e; }

.text-teal-50 { color: #f0fdfa; }
.text-teal-100 { color: #ccfbf1; }
.text-teal-200 { color: #99f6e4; }
.text-teal-300 { color: #5eead4; }
.text-teal-400 { color: #2dd4bf; }
.text-teal-500 { color: #14b8a6; }
.text-teal-600 { color: #0d9488; }
.text-teal-700 { color: #0f766e; }
.text-teal-800 { color: #115e59; }
.text-teal-900 { color: #134e4a; }
.text-teal-950 { color: #042f2e; }

/* Cyan */
.bg-cyan-50 { background-color: #ecfeff; }
.bg-cyan-100 { background-color: #cffafe; }
.bg-cyan-200 { background-color: #a5f3fc; }
.bg-cyan-300 { background-color: #67e8f9; }
.bg-cyan-400 { background-color: #22d3ee; }
.bg-cyan-500 { background-color: #06b6d4; }
.bg-cyan-600 { background-color: #0891b2; }
.bg-cyan-700 { background-color: #0e7490; }
.bg-cyan-800 { background-color: #155e75; }
.bg-cyan-900 { background-color: #164e63; }
.bg-cyan-950 { background-color: #083344; }

.text-cyan-50 { color: #ecfeff; }
.text-cyan-100 { color: #cffafe; }
.text-cyan-200 { color: #a5f3fc; }
.text-cyan-300 { color: #67e8f9; }
.text-cyan-400 { color: #22d3ee; }
.text-cyan-500 { color: #06b6d4; }
.text-cyan-600 { color: #0891b2; }
.text-cyan-700 { color: #0e7490; }
.text-cyan-800 { color: #155e75; }
.text-cyan-900 { color: #164e63; }
.text-cyan-950 { color: #083344; }

/* Sky */
.bg-sky-50 { background-color: #f0f9ff; }
.bg-sky-100 { background-color: #e0f2fe; }
.bg-sky-200 { background-color: #bae6fd; }
.bg-sky-300 { background-color: #7dd3fc; }
.bg-sky-400 { background-color: #38bdf8; }
.bg-sky-500 { background-color: #0ea5e9; }
.bg-sky-600 { background-color: #0284c7; }
.bg-sky-700 { background-color: #0369a1; }
.bg-sky-800 { background-color: #075985; }
.bg-sky-900 { background-color: #0c4a6e; }
.bg-sky-950 { background-color: #082f49; }

.text-sky-50 { color: #f0f9ff; }
.text-sky-100 { color: #e0f2fe; }
.text-sky-200 { color: #bae6fd; }
.text-sky-300 { color: #7dd3fc; }
.text-sky-400 { color: #38bdf8; }
.text-sky-500 { color: #0ea5e9; }
.text-sky-600 { color: #0284c7; }
.text-sky-700 { color: #0369a1; }
.text-sky-800 { color: #075985; }
.text-sky-900 { color: #0c4a6e; }
.text-sky-950 { color: #082f49; }

/* Blue */
.bg-blue-50 { background-color: #eff6ff; }
.bg-blue-100 { background-color: #dbeafe; }
.bg-blue-200 { background-color: #bfdbfe; }
.bg-blue-300 { background-color: #93c5fd; }
.bg-blue-400 { background-color: #60a5fa; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-blue-600 { background-color: #2563eb; }
.bg-blue-700 { background-color: #1d4ed8; }
.bg-blue-800 { background-color: #1e40af; }
.bg-blue-900 { background-color: #1e3a8a; }
.bg-blue-950 { background-color: #172554; }

.text-blue-50 { color: #eff6ff; }
.text-blue-100 { color: #dbeafe; }
.text-blue-200 { color: #bfdbfe; }
.text-blue-300 { color: #93c5fd; }
.text-blue-400 { color: #60a5fa; }
.text-blue-500 { color: #3b82f6; }
.text-blue-600 { color: #2563eb; }
.text-blue-700 { color: #1d4ed8; }
.text-blue-800 { color: #1e40af; }
.text-blue-900 { color: #1e3a8a; }
.text-blue-950 { color: #172554; }

/* Indigo */
.bg-indigo-50 { background-color: #eef2ff; }
.bg-indigo-100 { background-color: #e0e7ff; }
.bg-indigo-200 { background-color: #c7d2fe; }
.bg-indigo-300 { background-color: #a5b4fc; }
.bg-indigo-400 { background-color: #818cf8; }
.bg-indigo-500 { background-color: #6366f1; }
.bg-indigo-600 { background-color: #4f46e5; }
.bg-indigo-700 { background-color: #4338ca; }
.bg-indigo-800 { background-color: #3730a3; }
.bg-indigo-900 { background-color: #312e81; }
.bg-indigo-950 { background-color: #1e1b4b; }

.text-indigo-50 { color: #eef2ff; }
.text-indigo-100 { color: #e0e7ff; }
.text-indigo-200 { color: #c7d2fe; }
.text-indigo-300 { color: #a5b4fc; }
.text-indigo-400 { color: #818cf8; }
.text-indigo-500 { color: #6366f1; }
.text-indigo-600 { color: #4f46e5; }
.text-indigo-700 { color: #4338ca; }
.text-indigo-800 { color: #3730a3; }
.text-indigo-900 { color: #312e81; }
.text-indigo-950 { color: #1e1b4b; }

/* Violet */
.bg-violet-50 { background-color: #f5f3ff; }
.bg-violet-100 { background-color: #ede9fe; }
.bg-violet-200 { background-color: #ddd6fe; }
.bg-violet-300 { background-color: #c4b5fd; }
.bg-violet-400 { background-color: #a78bfa; }
.bg-violet-500 { background-color: #8b5cf6; }
.bg-violet-600 { background-color: #7c3aed; }
.bg-violet-700 { background-color: #6d28d9; }
.bg-violet-800 { background-color: #5b21b6; }
.bg-violet-900 { background-color: #4c1d95; }
.bg-violet-950 { background-color: #2e1065; }

.text-violet-50 { color: #f5f3ff; }
.text-violet-100 { color: #ede9fe; }
.text-violet-200 { color: #ddd6fe; }
.text-violet-300 { color: #c4b5fd; }
.text-violet-400 { color: #a78bfa; }
.text-violet-500 { color: #8b5cf6; }
.text-violet-600 { color: #7c3aed; }
.text-violet-700 { color: #6d28d9; }
.text-violet-800 { color: #5b21b6; }
.text-violet-900 { color: #4c1d95; }
.text-violet-950 { color: #2e1065; }

/* Purple */
.bg-purple-50 { background-color: #faf5ff; }
.bg-purple-100 { background-color: #f3e8ff; }
.bg-purple-200 { background-color: #e9d5ff; }
.bg-purple-300 { background-color: #d8b4fe; }
.bg-purple-400 { background-color: #c084fc; }
.bg-purple-500 { background-color: #a855f7; }
.bg-purple-600 { background-color: #9333ea; }
.bg-purple-700 { background-color: #7e22ce; }
.bg-purple-800 { background-color: #6b21a8; }
.bg-purple-900 { background-color: #581c87; }
.bg-purple-950 { background-color: #3b0764; }

.text-purple-50 { color: #faf5ff; }
.text-purple-100 { color: #f3e8ff; }
.text-purple-200 { color: #e9d5ff; }
.text-purple-300 { color: #d8b4fe; }
.text-purple-400 { color: #c084fc; }
.text-purple-500 { color: #a855f7; }
.text-purple-600 { color: #9333ea; }
.text-purple-700 { color: #7e22ce; }
.text-purple-800 { color: #6b21a8; }
.text-purple-900 { color: #581c87; }
.text-purple-950 { color: #3b0764; }

/* Fuchsia */
.bg-fuchsia-50 { background-color: #fdf4ff; }
.bg-fuchsia-100 { background-color: #fae8ff; }
.bg-fuchsia-200 { background-color: #f5d0fe; }
.bg-fuchsia-300 { background-color: #f0abfc; }
.bg-fuchsia-400 { background-color: #e879f9; }
.bg-fuchsia-500 { background-color: #d946ef; }
.bg-fuchsia-600 { background-color: #c026d3; }
.bg-fuchsia-700 { background-color: #a21caf; }
.bg-fuchsia-800 { background-color: #86198f; }
.bg-fuchsia-900 { background-color: #701a75; }
.bg-fuchsia-950 { background-color: #4a044e; }

.text-fuchsia-50 { color: #fdf4ff; }
.text-fuchsia-100 { color: #fae8ff; }
.text-fuchsia-200 { color: #f5d0fe; }
.text-fuchsia-300 { color: #f0abfc; }
.text-fuchsia-400 { color: #e879f9; }
.text-fuchsia-500 { color: #d946ef; }
.text-fuchsia-600 { color: #c026d3; }
.text-fuchsia-700 { color: #a21caf; }
.text-fuchsia-800 { color: #86198f; }
.text-fuchsia-900 { color: #701a75; }
.text-fuchsia-950 { color: #4a044e; }

/* Pink */
.bg-pink-50 { background-color: #fdf2f8; }
.bg-pink-100 { background-color: #fce7f3; }
.bg-pink-200 { background-color: #fbcfe8; }
.bg-pink-300 { background-color: #f9a8d4; }
.bg-pink-400 { background-color: #f472b6; }
.bg-pink-500 { background-color: #ec4899; }
.bg-pink-600 { background-color: #db2777; }
.bg-pink-700 { background-color: #be185d; }
.bg-pink-800 { background-color: #9d174d; }
.bg-pink-900 { background-color: #831843; }
.bg-pink-950 { background-color: #500724; }

.text-pink-50 { color: #fdf2f8; }
.text-pink-100 { color: #fce7f3; }
.text-pink-200 { color: #fbcfe8; }
.text-pink-300 { color: #f9a8d4; }
.text-pink-400 { color: #f472b6; }
.text-pink-500 { color: #ec4899; }
.text-pink-600 { color: #db2777; }
.text-pink-700 { color: #be185d; }
.text-pink-800 { color: #9d174d; }
.text-pink-900 { color: #831843; }
.text-pink-950 { color: #500724; }

/* Rose */
.bg-rose-50 { background-color: #fff1f2; }
.bg-rose-100 { background-color: #ffe4e6; }
.bg-rose-200 { background-color: #fecdd3; }
.bg-rose-300 { background-color: #fda4af; }
.bg-rose-400 { background-color: #fb7185; }
.bg-rose-500 { background-color: #f43f5e; }
.bg-rose-600 { background-color: #e11d48; }
.bg-rose-700 { background-color: #be123c; }
.bg-rose-800 { background-color: #9f1239; }
.bg-rose-900 { background-color: #881337; }
.bg-rose-950 { background-color: #4c0519; }

.text-rose-50 { color: #fff1f2; }
.text-rose-100 { color: #ffe4e6; }
.text-rose-200 { color: #fecdd3; }
.text-rose-300 { color: #fda4af; }
.text-rose-400 { color: #fb7185; }
.text-rose-500 { color: #f43f5e; }
.text-rose-600 { color: #e11d48; }
.text-rose-700 { color: #be123c; }
.text-rose-800 { color: #9f1239; }
.text-rose-900 { color: #881337; }
.text-rose-950 { color: #4c0519; }

/* Additional Utilities */
.bg-white { background-color: #ffffff; }
.bg-black { background-color: #000000; }
.bg-transparent { background-color: transparent; }
.text-white { color: #ffffff; }
.text-black { color: #000000; }
.text-transparent { color: transparent; }
.text-current { color: currentColor; }

/* Border Colors */
.border-white { border-color: #ffffff; }
.border-black { border-color: #000000; }
.border-transparent { border-color: transparent; }
.border-current { border-color: currentColor; }

/* FULL TAILWIND UTILITY CLASSES */

/* Layout */
.container { width: 100%; }
@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
@media (min-width: 1536px) { .container { max-width: 1536px; } }

/* Display */
.block { display: block; }
.inline-block { display: inline-block; }
.inline { display: inline; }
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.table { display: table; }
.inline-table { display: inline-table; }
.table-caption { display: table-caption; }
.table-cell { display: table-cell; }
.table-column { display: table-column; }
.table-column-group { display: table-column-group; }
.table-footer-group { display: table-footer-group; }
.table-header-group { display: table-header-group; }
.table-row-group { display: table-row-group; }
.table-row { display: table-row; }
.flow-root { display: flow-root; }
.grid { display: grid; }
.inline-grid { display: inline-grid; }
.contents { display: contents; }
.list-item { display: list-item; }
.hidden { display: none; }

/* Position */
.static { position: static; }
.fixed { position: fixed; }
.absolute { position: absolute; }
.relative { position: relative; }
.sticky { position: sticky; }

/* Top/Right/Bottom/Left */
.inset-0 { top: 0px; right: 0px; bottom: 0px; left: 0px; }
.inset-x-0 { left: 0px; right: 0px; }
.inset-y-0 { top: 0px; bottom: 0px; }
.top-0 { top: 0px; }
.right-0 { right: 0px; }
.bottom-0 { bottom: 0px; }
.left-0 { left: 0px; }
.top-1 { top: 0.25rem; }
.right-1 { right: 0.25rem; }
.bottom-1 { bottom: 0.25rem; }
.left-1 { left: 0.25rem; }
.top-2 { top: 0.5rem; }
.right-2 { right: 0.5rem; }
.bottom-2 { bottom: 0.5rem; }
.left-2 { left: 0.5rem; }
.top-4 { top: 1rem; }
.right-4 { right: 1rem; }
.bottom-4 { bottom: 1rem; }
.left-4 { left: 1rem; }
.top-8 { top: 2rem; }
.right-8 { right: 2rem; }
.bottom-8 { bottom: 2rem; }
.left-8 { left: 2rem; }
.top-1\\/2 { top: 50%; }
.right-1\\/2 { right: 50%; }
.bottom-1\\/2 { bottom: 50%; }
.left-1\\/2 { left: 50%; }
.top-1\\/3 { top: 33.333333%; }
.top-2\\/3 { top: 66.666667%; }
.top-1\\/4 { top: 25%; }
.top-3\\/4 { top: 75%; }

/* Z-Index */
.z-0 { z-index: 0; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }
.z-auto { z-index: auto; }

/* Flexbox */
.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-initial { flex: 0 1 auto; }
.flex-none { flex: none; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-shrink { flex-shrink: 1; }
.flex-grow-0 { flex-grow: 0; }
.flex-grow { flex-grow: 1; }
.flex-row { flex-direction: row; }
.flex-row-reverse { flex-direction: row-reverse; }
.flex-col { flex-direction: column; }
.flex-col-reverse { flex-direction: column-reverse; }
.flex-wrap { flex-wrap: wrap; }
.flex-wrap-reverse { flex-wrap: wrap-reverse; }
.flex-nowrap { flex-wrap: nowrap; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.items-stretch { align-items: stretch; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-evenly { justify-content: space-evenly; }
.justify-items-start { justify-items: start; }
.justify-items-end { justify-items: end; }
.justify-items-center { justify-items: center; }
.justify-items-stretch { justify-items: stretch; }

/* Grid */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
.col-span-1 { grid-column: span 1 / span 1; }
.col-span-2 { grid-column: span 2 / span 2; }
.col-span-3 { grid-column: span 3 / span 3; }
.col-span-4 { grid-column: span 4 / span 4; }
.col-span-6 { grid-column: span 6 / span 6; }
.col-span-12 { grid-column: span 12 / span 12; }
.gap-0 { gap: 0px; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.gap-10 { gap: 2.5rem; }
.gap-12 { gap: 3rem; }
.gap-x-4 { column-gap: 1rem; }
.gap-y-4 { row-gap: 1rem; }

/* Spacing - Padding */
.p-0 { padding: 0px; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.p-10 { padding: 2.5rem; }
.p-12 { padding: 3rem; }
.p-16 { padding: 4rem; }
.p-20 { padding: 5rem; }
.p-24 { padding: 6rem; }
.px-0 { padding-left: 0px; padding-right: 0px; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }
.px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
.px-12 { padding-left: 3rem; padding-right: 3rem; }
.py-0 { padding-top: 0px; padding-bottom: 0px; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.py-24 { padding-top: 6rem; padding-bottom: 6rem; }
.pt-0 { padding-top: 0px; }
.pt-1 { padding-top: 0.25rem; }
.pt-2 { padding-top: 0.5rem; }
.pt-4 { padding-top: 1rem; }
.pt-8 { padding-top: 2rem; }
.pt-16 { padding-top: 4rem; }
.pt-24 { padding-top: 6rem; }
.pr-0 { padding-right: 0px; }
.pr-1 { padding-right: 0.25rem; }
.pr-2 { padding-right: 0.5rem; }
.pr-4 { padding-right: 1rem; }
.pr-8 { padding-right: 2rem; }
.pb-0 { padding-bottom: 0px; }
.pb-1 { padding-bottom: 0.25rem; }
.pb-2 { padding-bottom: 0.5rem; }
.pb-4 { padding-bottom: 1rem; }
.pb-8 { padding-bottom: 2rem; }
.pb-16 { padding-bottom: 4rem; }
.pb-24 { padding-bottom: 6rem; }
.pl-0 { padding-left: 0px; }
.pl-1 { padding-left: 0.25rem; }
.pl-2 { padding-left: 0.5rem; }
.pl-4 { padding-left: 1rem; }
.pl-8 { padding-left: 2rem; }

/* Spacing - Margin */
.m-0 { margin: 0px; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 0.75rem; }
.m-4 { margin: 1rem; }
.m-5 { margin: 1.25rem; }
.m-6 { margin: 1.5rem; }
.m-8 { margin: 2rem; }
.m-10 { margin: 2.5rem; }
.m-12 { margin: 3rem; }
.m-auto { margin: auto; }
.mx-0 { margin-left: 0px; margin-right: 0px; }
.mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
.mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
.mx-3 { margin-left: 0.75rem; margin-right: 0.75rem; }
.mx-4 { margin-left: 1rem; margin-right: 1rem; }
.mx-6 { margin-left: 1.5rem; margin-right: 1.5rem; }
.mx-8 { margin-left: 2rem; margin-right: 2rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.my-0 { margin-top: 0px; margin-bottom: 0px; }
.my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
.my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
.my-8 { margin-top: 2rem; margin-bottom: 2rem; }
.my-12 { margin-top: 3rem; margin-bottom: 3rem; }
.mt-0 { margin-top: 0px; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mt-12 { margin-top: 3rem; }
.mt-16 { margin-top: 4rem; }
.mt-20 { margin-top: 5rem; }
.mt-24 { margin-top: 6rem; }
.mr-0 { margin-right: 0px; }
.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mr-3 { margin-right: 0.75rem; }
.mr-4 { margin-right: 1rem; }
.mr-6 { margin-right: 1.5rem; }
.mr-8 { margin-right: 2rem; }
.mb-0 { margin-bottom: 0px; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-12 { margin-bottom: 3rem; }
.mb-16 { margin-bottom: 4rem; }
.mb-20 { margin-bottom: 5rem; }
.mb-24 { margin-bottom: 6rem; }
.ml-0 { margin-left: 0px; }
.ml-1 { margin-left: 0.25rem; }
.ml-2 { margin-left: 0.5rem; }
.ml-3 { margin-left: 0.75rem; }
.ml-4 { margin-left: 1rem; }
.ml-6 { margin-left: 1.5rem; }
.ml-8 { margin-left: 2rem; }

/* Space Between */
.space-x-0 > :not([hidden]) ~ :not([hidden]) { margin-left: 0px; }
.space-x-1 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.25rem; }
.space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
.space-x-3 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.75rem; }
.space-x-4 > :not([hidden]) ~ :not([hidden]) { margin-left: 1rem; }
.space-x-6 > :not([hidden]) ~ :not([hidden]) { margin-left: 1.5rem; }
.space-x-8 > :not([hidden]) ~ :not([hidden]) { margin-left: 2rem; }
.space-y-0 > :not([hidden]) ~ :not([hidden]) { margin-top: 0px; }
.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
.space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
.space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
.space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
.space-y-12 > :not([hidden]) ~ :not([hidden]) { margin-top: 3rem; }
.space-y-16 > :not([hidden]) ~ :not([hidden]) { margin-top: 4rem; }

/* Width */
.w-0 { width: 0px; }
.w-1 { width: 0.25rem; }
.w-2 { width: 0.5rem; }
.w-3 { width: 0.75rem; }
.w-4 { width: 1rem; }
.w-5 { width: 1.25rem; }
.w-6 { width: 1.5rem; }
.w-7 { width: 1.75rem; }
.w-8 { width: 2rem; }
.w-9 { width: 2.25rem; }
.w-10 { width: 2.5rem; }
.w-11 { width: 2.75rem; }
.w-12 { width: 3rem; }
.w-14 { width: 3.5rem; }
.w-16 { width: 4rem; }
.w-20 { width: 5rem; }
.w-24 { width: 6rem; }
.w-28 { width: 7rem; }
.w-32 { width: 8rem; }
.w-36 { width: 9rem; }
.w-40 { width: 10rem; }
.w-44 { width: 11rem; }
.w-48 { width: 12rem; }
.w-52 { width: 13rem; }
.w-56 { width: 14rem; }
.w-60 { width: 15rem; }
.w-64 { width: 16rem; }
.w-72 { width: 18rem; }
.w-80 { width: 20rem; }
.w-96 { width: 24rem; }
.w-auto { width: auto; }
.w-1\\/2 { width: 50%; }
.w-1\\/3 { width: 33.333333%; }
.w-2\\/3 { width: 66.666667%; }
.w-1\\/4 { width: 25%; }
.w-2\\/4 { width: 50%; }
.w-3\\/4 { width: 75%; }
.w-1\\/5 { width: 20%; }
.w-2\\/5 { width: 40%; }
.w-3\\/5 { width: 60%; }
.w-4\\/5 { width: 80%; }
.w-1\\/6 { width: 16.666667%; }
.w-2\\/6 { width: 33.333333%; }
.w-3\\/6 { width: 50%; }
.w-4\\/6 { width: 66.666667%; }
.w-5\\/6 { width: 83.333333%; }
.w-1\\/12 { width: 8.333333%; }
.w-2\\/12 { width: 16.666667%; }
.w-3\\/12 { width: 25%; }
.w-4\\/12 { width: 33.333333%; }
.w-5\\/12 { width: 41.666667%; }
.w-6\\/12 { width: 50%; }
.w-7\\/12 { width: 58.333333%; }
.w-8\\/12 { width: 66.666667%; }
.w-9\\/12 { width: 75%; }
.w-10\\/12 { width: 83.333333%; }
.w-11\\/12 { width: 91.666667%; }
.w-full { width: 100%; }
.w-screen { width: 100vw; }
.w-min { width: min-content; }
.w-max { width: max-content; }
.w-fit { width: fit-content; }

/* Height */
.h-0 { height: 0px; }
.h-1 { height: 0.25rem; }
.h-2 { height: 0.5rem; }
.h-3 { height: 0.75rem; }
.h-4 { height: 1rem; }
.h-5 { height: 1.25rem; }
.h-6 { height: 1.5rem; }
.h-7 { height: 1.75rem; }
.h-8 { height: 2rem; }
.h-9 { height: 2.25rem; }
.h-10 { height: 2.5rem; }
.h-11 { height: 2.75rem; }
.h-12 { height: 3rem; }
.h-14 { height: 3.5rem; }
.h-16 { height: 4rem; }
.h-20 { height: 5rem; }
.h-24 { height: 6rem; }
.h-28 { height: 7rem; }
.h-32 { height: 8rem; }
.h-36 { height: 9rem; }
.h-40 { height: 10rem; }
.h-44 { height: 11rem; }
.h-48 { height: 12rem; }
.h-52 { height: 13rem; }
.h-56 { height: 14rem; }
.h-60 { height: 15rem; }
.h-64 { height: 16rem; }
.h-72 { height: 18rem; }
.h-80 { height: 20rem; }
.h-96 { height: 24rem; }
.h-auto { height: auto; }
.h-1\\/2 { height: 50%; }
.h-1\\/3 { height: 33.333333%; }
.h-2\\/3 { height: 66.666667%; }
.h-1\\/4 { height: 25%; }
.h-2\\/4 { height: 50%; }
.h-3\\/4 { height: 75%; }
.h-1\\/5 { height: 20%; }
.h-2\\/5 { height: 40%; }
.h-3\\/5 { height: 60%; }
.h-4\\/5 { height: 80%; }
.h-1\\/6 { height: 16.666667%; }
.h-2\\/6 { height: 33.333333%; }
.h-3\\/6 { height: 50%; }
.h-4\\/6 { height: 66.666667%; }
.h-5\\/6 { height: 83.333333%; }
.h-full { height: 100%; }
.h-screen { height: 100vh; }
.h-min { height: min-content; }
.h-max { height: max-content; }
.h-fit { height: fit-content; }

/* Min/Max Width */
.min-w-0 { min-width: 0px; }
.min-w-full { min-width: 100%; }
.min-w-min { min-width: min-content; }
.min-w-max { min-width: max-content; }
.min-w-fit { min-width: fit-content; }
.max-w-0 { max-width: 0rem; }
.max-w-none { max-width: none; }
.max-w-xs { max-width: 20rem; }
.max-w-sm { max-width: 24rem; }
.max-w-md { max-width: 28rem; }
.max-w-lg { max-width: 32rem; }
.max-w-xl { max-width: 36rem; }
.max-w-2xl { max-width: 42rem; }
.max-w-3xl { max-width: 48rem; }
.max-w-4xl { max-width: 56rem; }
.max-w-5xl { max-width: 64rem; }
.max-w-6xl { max-width: 72rem; }
.max-w-7xl { max-width: 80rem; }
.max-w-full { max-width: 100%; }
.max-w-min { max-width: min-content; }
.max-w-max { max-width: max-content; }
.max-w-fit { max-width: fit-content; }
.max-w-prose { max-width: 65ch; }
.max-w-screen-sm { max-width: 640px; }
.max-w-screen-md { max-width: 768px; }
.max-w-screen-lg { max-width: 1024px; }
.max-w-screen-xl { max-width: 1280px; }
.max-w-screen-2xl { max-width: 1536px; }

/* Min/Max Height */
.min-h-0 { min-height: 0px; }
.min-h-full { min-height: 100%; }
.min-h-screen { min-height: 100vh; }
.min-h-min { min-height: min-content; }
.min-h-max { min-height: max-content; }
.min-h-fit { min-height: fit-content; }
.max-h-0 { max-height: 0px; }
.max-h-1 { max-height: 0.25rem; }
.max-h-2 { max-height: 0.5rem; }
.max-h-3 { max-height: 0.75rem; }
.max-h-4 { max-height: 1rem; }
.max-h-5 { max-height: 1.25rem; }
.max-h-6 { max-height: 1.5rem; }
.max-h-full { max-height: 100%; }
.max-h-screen { max-height: 100vh; }

/* Typography */
.font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
.font-serif { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }
.font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.text-6xl { font-size: 3.75rem; line-height: 1; }
.text-7xl { font-size: 4.5rem; line-height: 1; }
.text-8xl { font-size: 6rem; line-height: 1; }
.text-9xl { font-size: 8rem; line-height: 1; }
.font-thin { font-weight: 100; }
.font-extralight { font-weight: 200; }
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
.not-italic { font-style: normal; }
.antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.subpixel-antialiased { -webkit-font-smoothing: auto; -moz-osx-font-smoothing: auto; }

/* Text Alignment */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }
.text-start { text-align: start; }
.text-end { text-align: end; }

/* Text Decoration */
.underline { text-decoration-line: underline; }
.overline { text-decoration-line: overline; }
.line-through { text-decoration-line: line-through; }
.no-underline { text-decoration-line: none; }

/* Text Transform */
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }
.normal-case { text-transform: none; }

/* Line Height */
.leading-3 { line-height: .75rem; }
.leading-4 { line-height: 1rem; }
.leading-5 { line-height: 1.25rem; }
.leading-6 { line-height: 1.5rem; }
.leading-7 { line-height: 1.75rem; }
.leading-8 { line-height: 2rem; }
.leading-9 { line-height: 2.25rem; }
.leading-10 { line-height: 2.5rem; }
.leading-none { line-height: 1; }
.leading-tight { line-height: 1.25; }
.leading-snug { line-height: 1.375; }
.leading-normal { line-height: 1.5; }
.leading-relaxed { line-height: 1.625; }
.leading-loose { line-height: 2; }

/* Letter Spacing */
.tracking-tighter { letter-spacing: -0.05em; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-normal { letter-spacing: 0em; }
.tracking-wide { letter-spacing: 0.025em; }
.tracking-wider { letter-spacing: 0.05em; }
.tracking-widest { letter-spacing: 0.1em; }

/* Borders */
.border-0 { border-width: 0px; }
.border { border-width: 1px; }
.border-2 { border-width: 2px; }
.border-4 { border-width: 4px; }
.border-8 { border-width: 8px; }
.border-t { border-top-width: 1px; }
.border-r { border-right-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-l { border-left-width: 1px; }
.border-t-0 { border-top-width: 0px; }
.border-r-0 { border-right-width: 0px; }
.border-b-0 { border-bottom-width: 0px; }
.border-l-0 { border-left-width: 0px; }
.border-solid { border-style: solid; }
.border-dashed { border-style: dashed; }
.border-dotted { border-style: dotted; }
.border-double { border-style: double; }
.border-hidden { border-style: hidden; }
.border-none { border-style: none; }

/* Border Radius */
.rounded-none { border-radius: 0px; }
.rounded-sm { border-radius: 0.125rem; }
.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-3xl { border-radius: 1.5rem; }
.rounded-full { border-radius: 9999px; }
.rounded-t-none { border-top-left-radius: 0px; border-top-right-radius: 0px; }
.rounded-t-sm { border-top-left-radius: 0.125rem; border-top-right-radius: 0.125rem; }
.rounded-t { border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem; }
.rounded-t-md { border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; }
.rounded-t-lg { border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
.rounded-t-xl { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; }
.rounded-t-2xl { border-top-left-radius: 1rem; border-top-right-radius: 1rem; }
.rounded-t-3xl { border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem; }
.rounded-t-full { border-top-left-radius: 9999px; border-top-right-radius: 9999px; }

/* Shadows */
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
.shadow-inner { box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05); }
.shadow-none { box-shadow: 0 0 #0000; }

/* Opacity */
.opacity-0 { opacity: 0; }
.opacity-5 { opacity: 0.05; }
.opacity-10 { opacity: 0.1; }
.opacity-20 { opacity: 0.2; }
.opacity-25 { opacity: 0.25; }
.opacity-30 { opacity: 0.3; }
.opacity-40 { opacity: 0.4; }
.opacity-50 { opacity: 0.5; }
.opacity-60 { opacity: 0.6; }
.opacity-70 { opacity: 0.7; }
.opacity-75 { opacity: 0.75; }
.opacity-80 { opacity: 0.8; }
.opacity-90 { opacity: 0.9; }
.opacity-95 { opacity: 0.95; }
.opacity-100 { opacity: 1; }

/* Overflow */
.overflow-auto { overflow: auto; }
.overflow-hidden { overflow: hidden; }
.overflow-clip { overflow: clip; }
.overflow-visible { overflow: visible; }
.overflow-scroll { overflow: scroll; }
.overflow-x-auto { overflow-x: auto; }
.overflow-y-auto { overflow-y: auto; }
.overflow-x-hidden { overflow-x: hidden; }
.overflow-y-hidden { overflow-y: hidden; }
.overflow-x-clip { overflow-x: clip; }
.overflow-y-clip { overflow-y: clip; }
.overflow-x-visible { overflow-x: visible; }
.overflow-y-visible { overflow-y: visible; }
.overflow-x-scroll { overflow-x: scroll; }
.overflow-y-scroll { overflow-y: scroll; }

/* Object Fit */
.object-contain { object-fit: contain; }
.object-cover { object-fit: cover; }
.object-fill { object-fit: fill; }
.object-none { object-fit: none; }
.object-scale-down { object-fit: scale-down; }

/* Object Position */
.object-bottom { object-position: bottom; }
.object-center { object-position: center; }
.object-left { object-position: left; }
.object-left-bottom { object-position: left bottom; }
.object-left-top { object-position: left top; }
.object-right { object-position: right; }
.object-right-bottom { object-position: right bottom; }
.object-right-top { object-position: right top; }
.object-top { object-position: top; }

/* Cursor */
.cursor-auto { cursor: auto; }
.cursor-default { cursor: default; }
.cursor-pointer { cursor: pointer; }
.cursor-wait { cursor: wait; }
.cursor-text { cursor: text; }
.cursor-move { cursor: move; }
.cursor-help { cursor: help; }
.cursor-not-allowed { cursor: not-allowed; }

/* Pointer Events */
.pointer-events-none { pointer-events: none; }
.pointer-events-auto { pointer-events: auto; }

/* User Select */
.select-none { user-select: none; }
.select-text { user-select: text; }
.select-all { user-select: all; }
.select-auto { user-select: auto; }

/* Resize */
.resize-none { resize: none; }
.resize-y { resize: vertical; }
.resize-x { resize: horizontal; }
.resize { resize: both; }

/* Transform */
.transform { transform: var(--tw-transform); }
.transform-cpu { transform: var(--tw-transform); }
.transform-gpu { transform: translate3d(var(--tw-translate-x), var(--tw-translate-y), 0) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.transform-none { transform: none; }

/* Translate */
.translate-x-0 { --tw-translate-x: 0px; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.translate-x-1 { --tw-translate-x: 0.25rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.translate-x-2 { --tw-translate-x: 0.5rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.translate-x-4 { --tw-translate-x: 1rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.translate-x-5 { --tw-translate-x: 1.25rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.translate-x-6 { --tw-translate-x: 1.5rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.-translate-x-1\\/2 { --tw-translate-x: -50%; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.translate-y-0 { --tw-translate-y: 0px; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.-translate-y-1\\/2 { --tw-translate-y: -50%; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

/* Scale */
.scale-0 { --tw-scale-x: 0; --tw-scale-y: 0; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-50 { --tw-scale-x: .5; --tw-scale-y: .5; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-75 { --tw-scale-x: .75; --tw-scale-y: .75; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-90 { --tw-scale-x: .9; --tw-scale-y: .9; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-95 { --tw-scale-x: .95; --tw-scale-y: .95; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-100 { --tw-scale-x: 1; --tw-scale-y: 1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-105 { --tw-scale-x: 1.05; --tw-scale-y: 1.05; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-110 { --tw-scale-x: 1.1; --tw-scale-y: 1.1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-125 { --tw-scale-x: 1.25; --tw-scale-y: 1.25; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.scale-150 { --tw-scale-x: 1.5; --tw-scale-y: 1.5; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

/* Rotate */
.rotate-0 { --tw-rotate: 0deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.rotate-1 { --tw-rotate: 1deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.rotate-2 { --tw-rotate: 2deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.rotate-3 { --tw-rotate: 3deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.rotate-6 { --tw-rotate: 6deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.rotate-12 { --tw-rotate: 12deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.rotate-45 { --tw-rotate: 45deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.rotate-90 { --tw-rotate: 90deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.rotate-180 { --tw-rotate: 180deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

/* Transitions */
.transition-none { transition-property: none; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-shadow { transition-property: box-shadow; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

/* Duration */
.duration-75 { transition-duration: 75ms; }
.duration-100 { transition-duration: 100ms; }
.duration-150 { transition-duration: 150ms; }
.duration-200 { transition-duration: 200ms; }
.duration-300 { transition-duration: 300ms; }
.duration-500 { transition-duration: 500ms; }
.duration-700 { transition-duration: 700ms; }
.duration-1000 { transition-duration: 1000ms; }

/* Ease */
.ease-linear { transition-timing-function: linear; }
.ease-in { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }
.ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }

/* Animation */
.animate-none { animation: none; }
.animate-spin { animation: spin 1s linear infinite; }
.animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-bounce { animation: bounce 1s infinite; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

/* Responsive Design */
@media (min-width: 640px) {
  .sm\\:block { display: block; }
  .sm\\:flex { display: flex; }
  .sm\\:grid { display: grid; }
  .sm\\:hidden { display: none; }
  .sm\\:flex-row { flex-direction: row; }
  .sm\\:flex-col { flex-direction: column; }
  .sm\\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .sm\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .sm\\:text-base { font-size: 1rem; line-height: 1.5rem; }
  .sm\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .sm\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .sm\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .sm\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .sm\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .sm\\:text-5xl { font-size: 3rem; line-height: 1; }
  .sm\\:py-20 { padding-top: 5rem; padding-bottom: 5rem; }
  .sm\\:py-24 { padding-top: 6rem; padding-bottom: 6rem; }
}

@media (min-width: 768px) {
  .md\\:block { display: block; }
  .md\\:flex { display: flex; }
  .md\\:grid { display: grid; }
  .md\\:hidden { display: none; }
  .md\\:flex-row { flex-direction: row; }
  .md\\:flex-col { flex-direction: column; }
  .md\\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .md\\:w-5\\/12 { width: 41.666667%; }
  .md\\:text-base { font-size: 1rem; line-height: 1.5rem; }
  .md\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .md\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .md\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .md\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .md\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .md\\:text-5xl { font-size: 3rem; line-height: 1; }
  .md\\:text-6xl { font-size: 3.75rem; line-height: 1; }
  .md\\:mb-0 { margin-bottom: 0px; }
  .md\\:mb-16 { margin-bottom: 4rem; }
  .md\\:mb-20 { margin-bottom: 5rem; }
  .md\\:p-8 { padding: 2rem; }
  .md\\:pr-8 { padding-right: 2rem; }
  .md\\:pl-8 { padding-left: 2rem; }
  .md\\:text-right { text-align: right; }
  .md\\:space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
  .md\\:space-y-16 > :not([hidden]) ~ :not([hidden]) { margin-top: 4rem; }
  .md\\:gap-8 { gap: 2rem; }
}

@media (min-width: 1024px) {
  .lg\\:block { display: block; }
  .lg\\:flex { display: flex; }
  .lg\\:grid { display: grid; }
  .lg\\:hidden { display: none; }
  .lg\\:flex-row { flex-direction: row; }
  .lg\\:flex-col { flex-direction: column; }
  .lg\\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .lg\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .lg\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .lg\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .lg\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .lg\\:text-5xl { font-size: 3rem; line-height: 1; }
  .lg\\:text-6xl { font-size: 3.75rem; line-height: 1; }
  .lg\\:text-7xl { font-size: 4.5rem; line-height: 1; }
  .lg\\:gap-12 { gap: 3rem; }
}

@media (min-width: 1280px) {
  .xl\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .xl\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .xl\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .xl\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .xl\\:text-5xl { font-size: 3rem; line-height: 1; }
  .xl\\:text-6xl { font-size: 3.75rem; line-height: 1; }
  .xl\\:text-7xl { font-size: 4.5rem; line-height: 1; }
}

/* COMPREHENSIVE HOVER STATES */

/* Hover Background Colors - All Colors */
.hover\\:bg-slate-50:hover { background-color: #f8fafc; }
.hover\\:bg-slate-100:hover { background-color: #f1f5f9; }
.hover\\:bg-slate-200:hover { background-color: #e2e8f0; }
.hover\\:bg-slate-300:hover { background-color: #cbd5e1; }
.hover\\:bg-slate-400:hover { background-color: #94a3b8; }
.hover\\:bg-slate-500:hover { background-color: #64748b; }
.hover\\:bg-slate-600:hover { background-color: #475569; }
.hover\\:bg-slate-700:hover { background-color: #334155; }
.hover\\:bg-slate-800:hover { background-color: #1e293b; }
.hover\\:bg-slate-900:hover { background-color: #0f172a; }
.hover\\:bg-slate-950:hover { background-color: #020617; }

.hover\\:bg-gray-50:hover { background-color: #f9fafb; }
.hover\\:bg-gray-100:hover { background-color: #f3f4f6; }
.hover\\:bg-gray-200:hover { background-color: #e5e7eb; }
.hover\\:bg-gray-300:hover { background-color: #d1d5db; }
.hover\\:bg-gray-400:hover { background-color: #9ca3af; }
.hover\\:bg-gray-500:hover { background-color: #6b7280; }
.hover\\:bg-gray-600:hover { background-color: #4b5563; }
.hover\\:bg-gray-700:hover { background-color: #374151; }
.hover\\:bg-gray-800:hover { background-color: #1f2937; }
.hover\\:bg-gray-900:hover { background-color: #111827; }
.hover\\:bg-gray-950:hover { background-color: #030712; }

.hover\\:bg-red-50:hover { background-color: #fef2f2; }
.hover\\:bg-red-100:hover { background-color: #fee2e2; }
.hover\\:bg-red-200:hover { background-color: #fecaca; }
.hover\\:bg-red-300:hover { background-color: #fca5a5; }
.hover\\:bg-red-400:hover { background-color: #f87171; }
.hover\\:bg-red-500:hover { background-color: #ef4444; }
.hover\\:bg-red-600:hover { background-color: #dc2626; }
.hover\\:bg-red-700:hover { background-color: #b91c1c; }
.hover\\:bg-red-800:hover { background-color: #991b1b; }
.hover\\:bg-red-900:hover { background-color: #7f1d1d; }
.hover\\:bg-red-950:hover { background-color: #450a0a; }

.hover\\:bg-orange-50:hover { background-color: #fff7ed; }
.hover\\:bg-orange-100:hover { background-color: #ffedd5; }
.hover\\:bg-orange-200:hover { background-color: #fed7aa; }
.hover\\:bg-orange-300:hover { background-color: #fdba74; }
.hover\\:bg-orange-400:hover { background-color: #fb923c; }
.hover\\:bg-orange-500:hover { background-color: #f97316; }
.hover\\:bg-orange-600:hover { background-color: #ea580c; }
.hover\\:bg-orange-700:hover { background-color: #c2410c; }
.hover\\:bg-orange-800:hover { background-color: #9a3412; }
.hover\\:bg-orange-900:hover { background-color: #7c2d12; }
.hover\\:bg-orange-950:hover { background-color: #431407; }

.hover\\:bg-yellow-50:hover { background-color: #fefce8; }
.hover\\:bg-yellow-100:hover { background-color: #fef9c3; }
.hover\\:bg-yellow-200:hover { background-color: #fef08a; }
.hover\\:bg-yellow-300:hover { background-color: #fde047; }
.hover\\:bg-yellow-400:hover { background-color: #facc15; }
.hover\\:bg-yellow-500:hover { background-color: #eab308; }
.hover\\:bg-yellow-600:hover { background-color: #ca8a04; }
.hover\\:bg-yellow-700:hover { background-color: #a16207; }
.hover\\:bg-yellow-800:hover { background-color: #854d0e; }
.hover\\:bg-yellow-900:hover { background-color: #713f12; }
.hover\\:bg-yellow-950:hover { background-color: #422006; }

.hover\\:bg-green-50:hover { background-color: #f0fdf4; }
.hover\\:bg-green-100:hover { background-color: #dcfce7; }
.hover\\:bg-green-200:hover { background-color: #bbf7d0; }
.hover\\:bg-green-300:hover { background-color: #86efac; }
.hover\\:bg-green-400:hover { background-color: #4ade80; }
.hover\\:bg-green-500:hover { background-color: #22c55e; }
.hover\\:bg-green-600:hover { background-color: #16a34a; }
.hover\\:bg-green-700:hover { background-color: #15803d; }
.hover\\:bg-green-800:hover { background-color: #166534; }
.hover\\:bg-green-900:hover { background-color: #14532d; }
.hover\\:bg-green-950:hover { background-color: #052e16; }

.hover\\:bg-blue-50:hover { background-color: #eff6ff; }
.hover\\:bg-blue-100:hover { background-color: #dbeafe; }
.hover\\:bg-blue-200:hover { background-color: #bfdbfe; }
.hover\\:bg-blue-300:hover { background-color: #93c5fd; }
.hover\\:bg-blue-400:hover { background-color: #60a5fa; }
.hover\\:bg-blue-500:hover { background-color: #3b82f6; }
.hover\\:bg-blue-600:hover { background-color: #2563eb; }
.hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
.hover\\:bg-blue-800:hover { background-color: #1e40af; }
.hover\\:bg-blue-900:hover { background-color: #1e3a8a; }
.hover\\:bg-blue-950:hover { background-color: #172554; }

.hover\\:bg-purple-50:hover { background-color: #faf5ff; }
.hover\\:bg-purple-100:hover { background-color: #f3e8ff; }
.hover\\:bg-purple-200:hover { background-color: #e9d5ff; }
.hover\\:bg-purple-300:hover { background-color: #d8b4fe; }
.hover\\:bg-purple-400:hover { background-color: #c084fc; }
.hover\\:bg-purple-500:hover { background-color: #a855f7; }
.hover\\:bg-purple-600:hover { background-color: #9333ea; }
.hover\\:bg-purple-700:hover { background-color: #7e22ce; }
.hover\\:bg-purple-800:hover { background-color: #6b21a8; }
.hover\\:bg-purple-900:hover { background-color: #581c87; }
.hover\\:bg-purple-950:hover { background-color: #3b0764; }

.hover\\:bg-pink-50:hover { background-color: #fdf2f8; }
.hover\\:bg-pink-100:hover { background-color: #fce7f3; }
.hover\\:bg-pink-200:hover { background-color: #fbcfe8; }
.hover\\:bg-pink-300:hover { background-color: #f9a8d4; }
.hover\\:bg-pink-400:hover { background-color: #f472b6; }
.hover\\:bg-pink-500:hover { background-color: #ec4899; }
.hover\\:bg-pink-600:hover { background-color: #db2777; }
.hover\\:bg-pink-700:hover { background-color: #be185d; }
.hover\\:bg-pink-800:hover { background-color: #9d174d; }
.hover\\:bg-pink-900:hover { background-color: #831843; }
.hover\\:bg-pink-950:hover { background-color: #500724; }

.hover\\:bg-white:hover { background-color: #ffffff; }
.hover\\:bg-black:hover { background-color: #000000; }
.hover\\:bg-transparent:hover { background-color: transparent; }

/* Hover Text Colors - All Colors */
.hover\\:text-slate-50:hover { color: #f8fafc; }
.hover\\:text-slate-100:hover { color: #f1f5f9; }
.hover\\:text-slate-200:hover { color: #e2e8f0; }
.hover\\:text-slate-300:hover { color: #cbd5e1; }
.hover\\:text-slate-400:hover { color: #94a3b8; }
.hover\\:text-slate-500:hover { color: #64748b; }
.hover\\:text-slate-600:hover { color: #475569; }
.hover\\:text-slate-700:hover { color: #334155; }
.hover\\:text-slate-800:hover { color: #1e293b; }
.hover\\:text-slate-900:hover { color: #0f172a; }
.hover\\:text-slate-950:hover { color: #020617; }

.hover\\:text-gray-50:hover { color: #f9fafb; }
.hover\\:text-gray-100:hover { color: #f3f4f6; }
.hover\\:text-gray-200:hover { color: #e5e7eb; }
.hover\\:text-gray-300:hover { color: #d1d5db; }
.hover\\:text-gray-400:hover { color: #9ca3af; }
.hover\\:text-gray-500:hover { color: #6b7280; }
.hover\\:text-gray-600:hover { color: #4b5563; }
.hover\\:text-gray-700:hover { color: #374151; }
.hover\\:text-gray-800:hover { color: #1f2937; }
.hover\\:text-gray-900:hover { color: #111827; }
.hover\\:text-gray-950:hover { color: #030712; }

.hover\\:text-red-50:hover { color: #fef2f2; }
.hover\\:text-red-100:hover { color: #fee2e2; }
.hover\\:text-red-200:hover { color: #fecaca; }
.hover\\:text-red-300:hover { color: #fca5a5; }
.hover\\:text-red-400:hover { color: #f87171; }
.hover\\:text-red-500:hover { color: #ef4444; }
.hover\\:text-red-600:hover { color: #dc2626; }
.hover\\:text-red-700:hover { color: #b91c1c; }
.hover\\:text-red-800:hover { color: #991b1b; }
.hover\\:text-red-900:hover { color: #7f1d1d; }
.hover\\:text-red-950:hover { color: #450a0a; }

.hover\\:text-blue-50:hover { color: #eff6ff; }
.hover\\:text-blue-100:hover { color: #dbeafe; }
.hover\\:text-blue-200:hover { color: #bfdbfe; }
.hover\\:text-blue-300:hover { color: #93c5fd; }
.hover\\:text-blue-400:hover { color: #60a5fa; }
.hover\\:text-blue-500:hover { color: #3b82f6; }
.hover\\:text-blue-600:hover { color: #2563eb; }
.hover\\:text-blue-700:hover { color: #1d4ed8; }
.hover\\:text-blue-800:hover { color: #1e40af; }
.hover\\:text-blue-900:hover { color: #1e3a8a; }
.hover\\:text-blue-950:hover { color: #172554; }

.hover\\:text-green-50:hover { color: #f0fdf4; }
.hover\\:text-green-100:hover { color: #dcfce7; }
.hover\\:text-green-200:hover { color: #bbf7d0; }
.hover\\:text-green-300:hover { color: #86efac; }
.hover\\:text-green-400:hover { color: #4ade80; }
.hover\\:text-green-500:hover { color: #22c55e; }
.hover\\:text-green-600:hover { color: #16a34a; }
.hover\\:text-green-700:hover { color: #15803d; }
.hover\\:text-green-800:hover { color: #166534; }
.hover\\:text-green-900:hover { color: #14532d; }
.hover\\:text-green-950:hover { color: #052e16; }

.hover\\:text-purple-50:hover { color: #faf5ff; }
.hover\\:text-purple-100:hover { color: #f3e8ff; }
.hover\\:text-purple-200:hover { color: #e9d5ff; }
.hover\\:text-purple-300:hover { color: #d8b4fe; }
.hover\\:text-purple-400:hover { color: #c084fc; }
.hover\\:text-purple-500:hover { color: #a855f7; }
.hover\\:text-purple-600:hover { color: #9333ea; }
.hover\\:text-purple-700:hover { color: #7e22ce; }
.hover\\:text-purple-800:hover { color: #6b21a8; }
.hover\\:text-purple-900:hover { color: #581c87; }
.hover\\:text-purple-950:hover { color: #3b0764; }

.hover\\:text-white:hover { color: #ffffff; }
.hover\\:text-black:hover { color: #000000; }

/* Hover Border Colors */
.hover\\:border-slate-200:hover { border-color: #e2e8f0; }
.hover\\:border-slate-300:hover { border-color: #cbd5e1; }
.hover\\:border-slate-400:hover { border-color: #94a3b8; }
.hover\\:border-gray-200:hover { border-color: #e5e7eb; }
.hover\\:border-gray-300:hover { border-color: #d1d5db; }
.hover\\:border-gray-400:hover { border-color: #9ca3af; }
.hover\\:border-red-300:hover { border-color: #fca5a5; }
.hover\\:border-red-400:hover { border-color: #f87171; }
.hover\\:border-red-500:hover { border-color: #ef4444; }
.hover\\:border-blue-300:hover { border-color: #93c5fd; }
.hover\\:border-blue-400:hover { border-color: #60a5fa; }
.hover\\:border-blue-500:hover { border-color: #3b82f6; }
.hover\\:border-green-300:hover { border-color: #86efac; }
.hover\\:border-green-400:hover { border-color: #4ade80; }
.hover\\:border-green-500:hover { border-color: #22c55e; }
.hover\\:border-purple-300:hover { border-color: #d8b4fe; }
.hover\\:border-purple-400:hover { border-color: #c084fc; }
.hover\\:border-purple-500:hover { border-color: #a855f7; }

/* Hover Opacity */
.hover\\:opacity-0:hover { opacity: 0; }
.hover\\:opacity-5:hover { opacity: 0.05; }
.hover\\:opacity-10:hover { opacity: 0.1; }
.hover\\:opacity-20:hover { opacity: 0.2; }
.hover\\:opacity-25:hover { opacity: 0.25; }
.hover\\:opacity-30:hover { opacity: 0.3; }
.hover\\:opacity-40:hover { opacity: 0.4; }
.hover\\:opacity-50:hover { opacity: 0.5; }
.hover\\:opacity-60:hover { opacity: 0.6; }
.hover\\:opacity-70:hover { opacity: 0.7; }
.hover\\:opacity-75:hover { opacity: 0.75; }
.hover\\:opacity-80:hover { opacity: 0.8; }
.hover\\:opacity-90:hover { opacity: 0.9; }
.hover\\:opacity-95:hover { opacity: 0.95; }
.hover\\:opacity-100:hover { opacity: 1; }

/* Hover Shadows */
.hover\\:shadow-none:hover { box-shadow: 0 0 #0000; }
.hover\\:shadow-sm:hover { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.hover\\:shadow:hover { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.hover\\:shadow-xl:hover { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.hover\\:shadow-2xl:hover { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }

/* Hover Transforms */
.hover\\:scale-0:hover { --tw-scale-x: 0; --tw-scale-y: 0; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:scale-50:hover { --tw-scale-x: .5; --tw-scale-y: .5; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:scale-75:hover { --tw-scale-x: .75; --tw-scale-y: .75; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:scale-90:hover { --tw-scale-x: .9; --tw-scale-y: .9; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:scale-95:hover { --tw-scale-x: .95; --tw-scale-y: .95; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:scale-100:hover { --tw-scale-x: 1; --tw-scale-y: 1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:scale-105:hover { --tw-scale-x: 1.05; --tw-scale-y: 1.05; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:scale-110:hover { --tw-scale-x: 1.1; --tw-scale-y: 1.1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:scale-125:hover { --tw-scale-x: 1.25; --tw-scale-y: 1.25; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

.hover\\:-translate-y-1:hover { --tw-translate-y: -0.25rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:-translate-y-2:hover { --tw-translate-y: -0.5rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:-translate-y-3:hover { --tw-translate-y: -0.75rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:-translate-y-4:hover { --tw-translate-y: -1rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

.hover\\:rotate-1:hover { --tw-rotate: 1deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:rotate-2:hover { --tw-rotate: 2deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:rotate-3:hover { --tw-rotate: 3deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:rotate-6:hover { --tw-rotate: 6deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:rotate-12:hover { --tw-rotate: 12deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:-rotate-1:hover { --tw-rotate: -1deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:-rotate-2:hover { --tw-rotate: -2deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:-rotate-3:hover { --tw-rotate: -3deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:-rotate-6:hover { --tw-rotate: -6deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.hover\\:-rotate-12:hover { --tw-rotate: -12deg; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

/* Hover Background Opacity */
.hover\\:bg-opacity-0:hover { --tw-bg-opacity: 0; }
.hover\\:bg-opacity-5:hover { --tw-bg-opacity: 0.05; }
.hover\\:bg-opacity-10:hover { --tw-bg-opacity: 0.1; }
.hover\\:bg-opacity-20:hover { --tw-bg-opacity: 0.2; }
.hover\\:bg-opacity-25:hover { --tw-bg-opacity: 0.25; }
.hover\\:bg-opacity-30:hover { --tw-bg-opacity: 0.3; }
.hover\\:bg-opacity-40:hover { --tw-bg-opacity: 0.4; }
.hover\\:bg-opacity-50:hover { --tw-bg-opacity: 0.5; }
.hover\\:bg-opacity-60:hover { --tw-bg-opacity: 0.6; }
.hover\\:bg-opacity-70:hover { --tw-bg-opacity: 0.7; }
.hover\\:bg-opacity-75:hover { --tw-bg-opacity: 0.75; }
.hover\\:bg-opacity-80:hover { --tw-bg-opacity: 0.8; }
.hover\\:bg-opacity-90:hover { --tw-bg-opacity: 0.9; }
.hover\\:bg-opacity-95:hover { --tw-bg-opacity: 0.95; }
.hover\\:bg-opacity-100:hover { --tw-bg-opacity: 1; }

/* FOCUS STATES */
.focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
.focus\\:outline:focus { outline-style: solid; }
.focus\\:outline-0:focus { outline-width: 0px; }
.focus\\:outline-1:focus { outline-width: 1px; }
.focus\\:outline-2:focus { outline-width: 2px; }
.focus\\:outline-4:focus { outline-width: 4px; }
.focus\\:outline-8:focus { outline-width: 8px; }

.focus\\:outline-white:focus { outline-color: #ffffff; }
.focus\\:outline-black:focus { outline-color: #000000; }
.focus\\:outline-gray-500:focus { outline-color: #6b7280; }
.focus\\:outline-red-500:focus { outline-color: #ef4444; }
.focus\\:outline-blue-500:focus { outline-color: #3b82f6; }
.focus\\:outline-green-500:focus { outline-color: #22c55e; }
.focus\\:outline-purple-500:focus { outline-color: #a855f7; }

.focus\\:ring-0:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.focus\\:ring-1:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.focus\\:ring-2:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.focus\\:ring-4:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }

.focus\\:ring-white:focus { --tw-ring-opacity: 1; --tw-ring-color: rgb(255 255 255 / var(--tw-ring-opacity)); }
.focus\\:ring-black:focus { --tw-ring-opacity: 1; --tw-ring-color: rgb(0 0 0 / var(--tw-ring-opacity)); }
.focus\\:ring-gray-500:focus { --tw-ring-opacity: 1; --tw-ring-color: rgb(107 114 128 / var(--tw-ring-opacity)); }
.focus\\:ring-red-500:focus { --tw-ring-opacity: 1; --tw-ring-color: rgb(239 68 68 / var(--tw-ring-opacity)); }
.focus\\:ring-blue-500:focus { --tw-ring-opacity: 1; --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity)); }
.focus\\:ring-green-500:focus { --tw-ring-opacity: 1; --tw-ring-color: rgb(34 197 94 / var(--tw-ring-opacity)); }
.focus\\:ring-purple-500:focus { --tw-ring-opacity: 1; --tw-ring-color: rgb(168 85 247 / var(--tw-ring-opacity)); }

.focus\\:border-blue-500:focus { border-color: #3b82f6; }
.focus\\:border-red-500:focus { border-color: #ef4444; }
.focus\\:border-green-500:focus { border-color: #22c55e; }
.focus\\:border-purple-500:focus { border-color: #a855f7; }

/* ACTIVE STATES */
.active\\:bg-gray-100:active { background-color: #f3f4f6; }
.active\\:bg-gray-200:active { background-color: #e5e7eb; }
.active\\:bg-blue-600:active { background-color: #2563eb; }
.active\\:bg-blue-700:active { background-color: #1d4ed8; }
.active\\:bg-red-600:active { background-color: #dc2626; }
.active\\:bg-red-700:active { background-color: #b91c1c; }
.active\\:bg-green-600:active { background-color: #16a34a; }
.active\\:bg-green-700:active { background-color: #15803d; }
.active\\:bg-purple-600:active { background-color: #9333ea; }
.active\\:bg-purple-700:active { background-color: #7e22ce; }

.active\\:text-white:active { color: #ffffff; }
.active\\:text-gray-900:active { color: #111827; }

.active\\:scale-95:active { --tw-scale-x: .95; --tw-scale-y: .95; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

/* DISABLED STATES */
.disabled\\:opacity-50:disabled { opacity: 0.5; }
.disabled\\:opacity-75:disabled { opacity: 0.75; }
.disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
.disabled\\:bg-gray-100:disabled { background-color: #f3f4f6; }
.disabled\\:bg-gray-200:disabled { background-color: #e5e7eb; }
.disabled\\:text-gray-400:disabled { color: #9ca3af; }
.disabled\\:text-gray-500:disabled { color: #6b7280; }
.disabled\\:border-gray-200:disabled { border-color: #e5e7eb; }
.disabled\\:border-gray-300:disabled { border-color: #d1d5db; }

/* GROUP HOVER STATES */
.group:hover .group-hover\\:opacity-100 { opacity: 1; }
.group:hover .group-hover\\:opacity-75 { opacity: 0.75; }
.group:hover .group-hover\\:opacity-50 { opacity: 0.5; }
.group:hover .group-hover\\:scale-105 { --tw-scale-x: 1.05; --tw-scale-y: 1.05; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.group:hover .group-hover\\:scale-110 { --tw-scale-x: 1.1; --tw-scale-y: 1.1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.group:hover .group-hover\\:-translate-y-1 { --tw-translate-y: -0.25rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.group:hover .group-hover\\:-translate-y-2 { --tw-translate-y: -0.5rem; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.group:hover .group-hover\\:bg-white { background-color: #ffffff; }
.group:hover .group-hover\\:bg-gray-50 { background-color: #f9fafb; }
.group:hover .group-hover\\:bg-blue-50 { background-color: #eff6ff; }
.group:hover .group-hover\\:text-blue-600 { color: #2563eb; }
.group:hover .group-hover\\:text-gray-900 { color: #111827; }

/* TRANSITIONS */
.transition-none { transition-property: none; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-shadow { transition-property: box-shadow; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

.duration-75 { transition-duration: 75ms; }
.duration-100 { transition-duration: 100ms; }
.duration-150 { transition-duration: 150ms; }
.duration-200 { transition-duration: 200ms; }
.duration-300 { transition-duration: 300ms; }
.duration-500 { transition-duration: 500ms; }
.duration-700 { transition-duration: 700ms; }
.duration-1000 { transition-duration: 1000ms; }

.ease-linear { transition-timing-function: linear; }
.ease-in { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }
.ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }

.delay-75 { transition-delay: 75ms; }
.delay-100 { transition-delay: 100ms; }
.delay-150 { transition-delay: 150ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-500 { transition-delay: 500ms; }
.delay-700 { transition-delay: 700ms; }
.delay-1000 { transition-delay: 1000ms; }

/* ANIMATIONS */
.animate-none { animation: none; }
.animate-spin { animation: spin 1s linear infinite; }
.animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-bounce { animation: bounce 1s infinite; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

/* RESPONSIVE UTILITIES */
@media (min-width: 640px) {
  .sm\\:block { display: block; }
  .sm\\:flex { display: flex; }
  .sm\\:hidden { display: none; }
  .sm\\:grid { display: grid; }
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .sm\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .sm\\:text-base { font-size: 1rem; line-height: 1.5rem; }
  .sm\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .sm\\:py-4 { padding-top: 1rem; padding-bottom: 1rem; }
}

@media (min-width: 768px) {
  .md\\:block { display: block; }
  .md\\:flex { display: flex; }
  .md\\:hidden { display: none; }
  .md\\:grid { display: grid; }
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .md\\:text-base { font-size: 1rem; line-height: 1.5rem; }
  .md\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .md\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .md\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .md\\:py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
}

@media (min-width: 1024px) {
  .lg\\:block { display: block; }
  .lg\\:flex { display: flex; }
  .lg\\:hidden { display: none; }
  .lg\\:grid { display: grid; }
  .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .lg\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .lg\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .lg\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .lg\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .lg\\:py-8 { padding-top: 2rem; padding-bottom: 2rem; }
}

@media (min-width: 1280px) {
  .xl\\:block { display: block; }
  .xl\\:flex { display: flex; }
  .xl\\:hidden { display: none; }
  .xl\\:grid { display: grid; }
  .xl\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .xl\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .xl\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .xl\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .xl\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .xl\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .xl\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
}

@media (min-width: 1536px) {
  .\\32xl\\:block { display: block; }
  .\\32xl\\:flex { display: flex; }
  .\\32xl\\:hidden { display: none; }
  .\\32xl\\:grid { display: grid; }
  .\\32xl\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .\\32xl\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .\\32xl\\:grid-cols-7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }
  .\\32xl\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .\\32xl\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .\\32xl\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .\\32xl\\:text-5xl { font-size: 3rem; line-height: 1; }
}

/* ADDITIONAL MISSING UTILITIES */
.line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
.line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.line-clamp-3 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.line-clamp-4 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
.line-clamp-5 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 5; }
.line-clamp-6 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; }
.line-clamp-none { overflow: visible; display: block; -webkit-box-orient: horizontal; -webkit-line-clamp: none; }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
.not-sr-only { position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal; }

.appearance-none { appearance: none; }
.appearance-auto { appearance: auto; }

.outline-none { outline: 2px solid transparent; outline-offset: 2px; }
.outline { outline-style: solid; }
.outline-dashed { outline-style: dashed; }
.outline-dotted { outline-style: dotted; }
.outline-double { outline-style: double; }

.ring-0 { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.ring-1 { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.ring-2 { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.ring-4 { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.ring-8 { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(8px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }

.ring-white { --tw-ring-opacity: 1; --tw-ring-color: rgb(255 255 255 / var(--tw-ring-opacity)); }
.ring-black { --tw-ring-opacity: 1; --tw-ring-color: rgb(0 0 0 / var(--tw-ring-opacity)); }
.ring-gray-500 { --tw-ring-opacity: 1; --tw-ring-color: rgb(107 114 128 / var(--tw-ring-opacity)); }
.ring-red-500 { --tw-ring-opacity: 1; --tw-ring-color: rgb(239 68 68 / var(--tw-ring-opacity)); }
.ring-blue-500 { --tw-ring-opacity: 1; --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity)); }
.ring-green-500 { --tw-ring-opacity: 1; --tw-ring-color: rgb(34 197 94 / var(--tw-ring-opacity)); }
.ring-purple-500 { --tw-ring-opacity: 1; --tw-ring-color: rgb(168 85 247 / var(--tw-ring-opacity)); }

.ring-opacity-5 { --tw-ring-opacity: 0.05; }
.ring-opacity-10 { --tw-ring-opacity: 0.1; }
.ring-opacity-20 { --tw-ring-opacity: 0.2; }
.ring-opacity-25 { --tw-ring-opacity: 0.25; }
.ring-opacity-30 { --tw-ring-opacity: 0.3; }
.ring-opacity-40 { --tw-ring-opacity: 0.4; }
.ring-opacity-50 { --tw-ring-opacity: 0.5; }
.ring-opacity-60 { --tw-ring-opacity: 0.6; }
.ring-opacity-70 { --tw-ring-opacity: 0.7; }
.ring-opacity-75 { --tw-ring-opacity: 0.75; }
.ring-opacity-80 { --tw-ring-opacity: 0.8; }
.ring-opacity-90 { --tw-ring-opacity: 0.9; }
.ring-opacity-95 { --tw-ring-opacity: 0.95; }
.ring-opacity-100 { --tw-ring-opacity: 1; }

.ring-offset-0 { --tw-ring-offset-width: 0px; }
.ring-offset-1 { --tw-ring-offset-width: 1px; }
.ring-offset-2 { --tw-ring-offset-width: 2px; }
.ring-offset-4 { --tw-ring-offset-width: 4px; }
.ring-offset-8 { --tw-ring-offset-width: 8px; }

.ring-offset-white { --tw-ring-offset-color: #ffffff; }
.ring-offset-black { --tw-ring-offset-color: #000000; }
.ring-offset-gray-50 { --tw-ring-offset-color: #f9fafb; }
.ring-offset-gray-100 { --tw-ring-offset-color: #f3f4f6; }

/* FILTER UTILITIES */
.filter { filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow); }
.filter-none { filter: none; }

.blur-none { --tw-blur: blur(0); }
.blur-sm { --tw-blur: blur(4px); }
.blur { --tw-blur: blur(8px); }
.blur-md { --tw-blur: blur(12px); }
.blur-lg { --tw-blur: blur(16px); }
.blur-xl { --tw-blur: blur(24px); }
.blur-2xl { --tw-blur: blur(40px); }
.blur-3xl { --tw-blur: blur(64px); }

.brightness-0 { --tw-brightness: brightness(0); }
.brightness-50 { --tw-brightness: brightness(.5); }
.brightness-75 { --tw-brightness: brightness(.75); }
.brightness-90 { --tw-brightness: brightness(.9); }
.brightness-95 { --tw-brightness: brightness(.95); }
.brightness-100 { --tw-brightness: brightness(1); }
.brightness-105 { --tw-brightness: brightness(1.05); }
.brightness-110 { --tw-brightness: brightness(1.1); }
.brightness-125 { --tw-brightness: brightness(1.25); }
.brightness-150 { --tw-brightness: brightness(1.5); }
.brightness-200 { --tw-brightness: brightness(2); }

.contrast-0 { --tw-contrast: contrast(0); }
.contrast-50 { --tw-contrast: contrast(.5); }
.contrast-75 { --tw-contrast: contrast(.75); }
.contrast-100 { --tw-contrast: contrast(1); }
.contrast-125 { --tw-contrast: contrast(1.25); }
.contrast-150 { --tw-contrast: contrast(1.5); }
.contrast-200 { --tw-contrast: contrast(2); }

.grayscale-0 { --tw-grayscale: grayscale(0); }
.grayscale { --tw-grayscale: grayscale(100%); }

.invert-0 { --tw-invert: invert(0); }
.invert { --tw-invert: invert(100%); }

.sepia-0 { --tw-sepia: sepia(0); }
.sepia { --tw-sepia: sepia(100%); }

.saturate-0 { --tw-saturate: saturate(0); }
.saturate-50 { --tw-saturate: saturate(.5); }
.saturate-100 { --tw-saturate: saturate(1); }
.saturate-150 { --tw-saturate: saturate(1.5); }
.saturate-200 { --tw-saturate: saturate(2); }

.hue-rotate-0 { --tw-hue-rotate: hue-rotate(0deg); }
.hue-rotate-15 { --tw-hue-rotate: hue-rotate(15deg); }
.hue-rotate-30 { --tw-hue-rotate: hue-rotate(30deg); }
.hue-rotate-60 { --tw-hue-rotate: hue-rotate(60deg); }
.hue-rotate-90 { --tw-hue-rotate: hue-rotate(90deg); }
.hue-rotate-180 { --tw-hue-rotate: hue-rotate(180deg); }

.drop-shadow-sm { --tw-drop-shadow: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05)); }
.drop-shadow { --tw-drop-shadow: drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06)); }
.drop-shadow-md { --tw-drop-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06)); }
.drop-shadow-lg { --tw-drop-shadow: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)); }
.drop-shadow-xl { --tw-drop-shadow: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08)); }
.drop-shadow-2xl { --tw-drop-shadow: drop-shadow(0 25px 25px rgb(0 0 0 / 0.15)); }
.drop-shadow-none { --tw-drop-shadow: drop-shadow(0 0 #0000); }

/* BACKDROP FILTER UTILITIES */
.backdrop-filter { backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia); }
.backdrop-filter-none { backdrop-filter: none; }

.backdrop-blur-none { --tw-backdrop-blur: blur(0); }
.backdrop-blur-sm { --tw-backdrop-blur: blur(4px); }
.backdrop-blur { --tw-backdrop-blur: blur(8px); }
.backdrop-blur-md { --tw-backdrop-blur: blur(12px); }
.backdrop-blur-lg { --tw-backdrop-blur: blur(16px); }
.backdrop-blur-xl { --tw-backdrop-blur: blur(24px); }
.backdrop-blur-2xl { --tw-backdrop-blur: blur(40px); }
.backdrop-blur-3xl { --tw-backdrop-blur: blur(64px); }

.backdrop-brightness-0 { --tw-backdrop-brightness: brightness(0); }
.backdrop-brightness-50 { --tw-backdrop-brightness: brightness(.5); }
.backdrop-brightness-75 { --tw-backdrop-brightness: brightness(.75); }
.backdrop-brightness-90 { --tw-backdrop-brightness: brightness(.9); }
.backdrop-brightness-95 { --tw-backdrop-brightness: brightness(.95); }
.backdrop-brightness-100 { --tw-backdrop-brightness: brightness(1); }
.backdrop-brightness-105 { --tw-backdrop-brightness: brightness(1.05); }
.backdrop-brightness-110 { --tw-backdrop-brightness: brightness(1.1); }
.backdrop-brightness-125 { --tw-backdrop-brightness: brightness(1.25); }
.backdrop-brightness-150 { --tw-backdrop-brightness: brightness(1.5); }
.backdrop-brightness-200 { --tw-backdrop-brightness: brightness(2); }

.backdrop-contrast-0 { --tw-backdrop-contrast: contrast(0); }
.backdrop-contrast-50 { --tw-backdrop-contrast: contrast(.5); }
.backdrop-contrast-75 { --tw-backdrop-contrast: contrast(.75); }
.backdrop-contrast-100 { --tw-backdrop-contrast: contrast(1); }
.backdrop-contrast-125 { --tw-backdrop-contrast: contrast(1.25); }
.backdrop-contrast-150 { --tw-backdrop-contrast: contrast(1.5); }
.backdrop-contrast-200 { --tw-backdrop-contrast: contrast(2); }

.backdrop-grayscale-0 { --tw-backdrop-grayscale: grayscale(0); }
.backdrop-grayscale { --tw-backdrop-grayscale: grayscale(100%); }

.backdrop-invert-0 { --tw-backdrop-invert: invert(0); }
.backdrop-invert { --tw-backdrop-invert: invert(100%); }

.backdrop-opacity-0 { --tw-backdrop-opacity: opacity(0); }
.backdrop-opacity-5 { --tw-backdrop-opacity: opacity(0.05); }
.backdrop-opacity-10 { --tw-backdrop-opacity: opacity(0.1); }
.backdrop-opacity-20 { --tw-backdrop-opacity: opacity(0.2); }
.backdrop-opacity-25 { --tw-backdrop-opacity: opacity(0.25); }
.backdrop-opacity-30 { --tw-backdrop-opacity: opacity(0.3); }
.backdrop-opacity-40 { --tw-backdrop-opacity: opacity(0.4); }
.backdrop-opacity-50 { --tw-backdrop-opacity: opacity(0.5); }
.backdrop-opacity-60 { --tw-backdrop-opacity: opacity(0.6); }
.backdrop-opacity-70 { --tw-backdrop-opacity: opacity(0.7); }
.backdrop-opacity-75 { --tw-backdrop-opacity: opacity(0.75); }
.backdrop-opacity-80 { --tw-backdrop-opacity: opacity(0.8); }
.backdrop-opacity-90 { --tw-backdrop-opacity: opacity(0.9); }
.backdrop-opacity-95 { --tw-backdrop-opacity: opacity(0.95); }
.backdrop-opacity-100 { --tw-backdrop-opacity: opacity(1); }

.backdrop-saturate-0 { --tw-backdrop-saturate: saturate(0); }
.backdrop-saturate-50 { --tw-backdrop-saturate: saturate(.5); }
.backdrop-saturate-100 { --tw-backdrop-saturate: saturate(1); }
.backdrop-saturate-150 { --tw-backdrop-saturate: saturate(1.5); }
.backdrop-saturate-200 { --tw-backdrop-saturate: saturate(2); }

.backdrop-sepia-0 { --tw-backdrop-sepia: sepia(0); }
.backdrop-sepia { --tw-backdrop-sepia: sepia(100%); }

.backdrop-hue-rotate-0 { --tw-backdrop-hue-rotate: hue-rotate(0deg); }
.backdrop-hue-rotate-15 { --tw-backdrop-hue-rotate: hue-rotate(15deg); }
.backdrop-hue-rotate-30 { --tw-backdrop-hue-rotate: hue-rotate(30deg); }
.backdrop-hue-rotate-60 { --tw-backdrop-hue-rotate: hue-rotate(60deg); }
.backdrop-hue-rotate-90 { --tw-backdrop-hue-rotate: hue-rotate(90deg); }
.backdrop-hue-rotate-180 { --tw-backdrop-hue-rotate: hue-rotate(180deg); }

/* Group Hover */
.group:hover .group-hover\\:opacity-100 { opacity: 1; }
.group:hover .group-hover\\:scale-105 { --tw-scale-x: 1.05; --tw-scale-y: 1.05; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
.group:hover .group-hover\\:scale-110 { --tw-scale-x: 1.1; --tw-scale-y: 1.1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

/* Focus States */
.focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
.focus\\:ring-2:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.focus\\:ring-blue-500:focus { --tw-ring-color: #3b82f6; }

/* Utilities */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
.not-sr-only { position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal; }
`;

    styleElement.textContent = cssContent;
    document.head.appendChild(styleElement);
    styleSheetRef.current = styleElement;

    return () => {
      if (styleSheetRef.current) {
        styleSheetRef.current.remove();
      }
    };
  }, [model.styleVariables, model.animations]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .scale-in');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const updateComponentState = useCallback((key, value) => {
    dispatch({ type: 'SET_COMPONENT_STATE', key, value });
  }, []);

  const updateFormData = useCallback((field, value) => {
    dispatch({ type: 'SET_FORM_DATA', field, value });
  }, []);

  const setFormErrors = useCallback((errors) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const safeGet = useCallback((obj, path, fallback = '') => {
    if (!obj || !path) return fallback;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return fallback;
      }
      current = current[key];
    }
    
    return current !== null && current !== undefined ? current : fallback;
  }, []);

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
        
        const newErrors = {};
        const { formData } = state;
        
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
        
        dispatch({ type: 'CLEAR_ERRORS' });
        updateComponentState(`${formId}_submitted`, true);
        
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

  const handleComponentEdit = useCallback((component) => {
    if (!isEditing) return;
    console.log('Opening edit dialog for component:', component);
    setEditingComponent(component);
    setEditDialogOpen(true);
  }, [isEditing]);

  const handleDialogSave = useCallback((updatedComponent) => {
    console.log('Dialog save - updating component:', updatedComponent);
    if (onUpdate && editingComponent) {
      const updatedModel = updateComponentInModel(model, editingComponent.id, updatedComponent);
      onUpdate(updatedModel);
    }
    setEditDialogOpen(false);
    setEditingComponent(null);
  }, [model, onUpdate, editingComponent]);

  const handleDialogClose = useCallback(() => {
    setEditDialogOpen(false);
    setEditingComponent(null);
  }, []);

  const updateComponentInModel = useCallback((model, targetId, updatedComponent) => {
    const updateNode = (node) => {
      if (!node) return node;
      
      if (Array.isArray(node)) {
        return node.map(updateNode);
      }
      
      if (typeof node === 'object' && node !== null) {
        if (node.id === targetId) {
          return updatedComponent;
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
  }, []);

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
            processedNode.children = generateSpecComponents(context.content?.specifications, processedNode);
          } else if (processedNode.children.includes('Object.entries(content.specifications)')) {
            processedNode.children = generateSpecComponents(context.content?.specifications, processedNode);
          } else if (processedNode.children.includes('gallery.component')) {
            processedNode.children = [];
          } else if (processedNode.children === 'SPECIALTIES_ARRAY') {
            const items = context.content?.specialties || [];
            const templateType = model?.metadata?.template || 'professional';
            processedNode.children = generateSpecialtiesArray(items, templateType);
          } else if (processedNode.children === 'ACHIEVEMENTS_ARRAY') {
            const items = context.content?.achievements || [];
            const templateType = model?.metadata?.template || 'professional';
            processedNode.children = generateAchievementsArray(items, templateType);
          } else if (processedNode.children === 'TESTIMONIALS_ARRAY') {
            // Handle testimonials array
            const items = safeGet(context.content, 'impact.testimonials', []);
            console.log('💬 [TESTIMONIALS_ARRAY] Processing testimonials:', items.length);
            processedNode.children = items.slice(0, 5).map((testimonial, index) => ({
              id: `testimonial-${index}`,
              type: 'div',
              props: { className: 'testimonial-item p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow' },
              children: [
                {
                  type: 'p',
                  props: { className: 'text-gray-700 italic text-lg leading-relaxed' },
                  children: [`"${testimonial}"`]
                }
              ]
            }));
          } else if (processedNode.children === 'METRICS_ARRAY') {
            // Handle metrics array
            const items = safeGet(context.content, 'impact.metrics', []);
            console.log('📊 [METRICS_ARRAY] Processing metrics:', items.length);
            processedNode.children = items.slice(0, 3).map((metric, index) => ({
              id: `metric-${index}`,
              type: 'div',
              props: { className: 'metric-item text-center p-6 bg-white rounded-lg shadow' },
              children: [
                {
                  type: 'div',
                  props: { className: 'text-3xl font-bold text-blue-600 mb-2' },
                  children: [metric.split(' ')[0] || '100+']
                },
                {
                  type: 'p',
                  props: { className: 'text-gray-600' },
                  children: [metric.split(' ').slice(1).join(' ') || 'Achievement']
                }
              ]
            }));
          } else if (processedNode.children === 'CASE_STUDIES_ARRAY') {
            // Handle case studies array
            const items = safeGet(context.content, 'impact.cases', []);
            console.log('📚 [CASE_STUDIES_ARRAY] Processing case studies:', items.length);
            processedNode.children = items.slice(0, 3).map((caseStudy, index) => ({
              id: `case-study-${index}`,
              type: 'div',
              props: { className: 'case-study-item p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500 mb-6 max-w-4xl mx-auto' },
              children: [
                {
                  type: 'h4',
                  props: { className: 'font-bold text-gray-900 mb-3 text-lg' },
                  children: [`Success Story ${index + 1}`]
                },
                {
                  type: 'p',
                  props: { className: 'text-gray-700 leading-relaxed' },
                  children: [caseStudy]
                }
              ]
            }));
          } else if (processedNode.children === 'AWARDS_ARRAY') {
            // Handle awards array
            const items = safeGet(context.content, 'impact.awards', []);
            console.log('🏆 [AWARDS_ARRAY] Processing awards:', items.length);
            processedNode.children = items.slice(0, 5).map((award, index) => ({
              id: `award-${index}`,
              type: 'div',
              props: { className: 'award-item inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium m-2 hover:bg-yellow-200 transition-colors' },
              children: [
                {
                  type: 'span',
                  props: { className: 'mr-2 text-lg' },
                  children: ['🏆']
                },
                award
              ]
            }));
          } else if (processedNode.children === 'HERO_GALLERY') {
            // Handle hero gallery - CENTERED FOR SINGLE ITEMS
            const items = safeGet(context.content, 'visuals.hero', []);
            console.log('🖼️ [HERO_GALLERY] Processing hero images:', items.length);
            if (items.length === 0) {
              processedNode.children = [{
                type: 'div',
                props: { className: 'text-center py-12 text-gray-400 bg-gray-50 rounded-lg' },
                children: ['Hero images will appear here when uploaded']
              }];
            } else {
              processedNode.children = [{
                type: 'div',
                props: { className: `grid gap-6 justify-items-center ${items.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : items.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : items.length <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}` },
                children: items.map((image, index) => ({
                  id: `hero-image-${index}`,
                  type: 'div',
                  props: { className: 'relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 w-full' },
                  children: [
                    {
                      type: 'img',
                      props: { 
                        src: image.url || image,
                        alt: `Hero image ${index + 1}`,
                        className: 'w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500'
                      }
                    },
                    {
                      type: 'div',
                      props: { className: 'absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' }
                    }
                  ]
                }))
              }];
            }
          } else if (processedNode.children === 'PROCESS_GALLERY') {
            // Handle process gallery - PERFECT FIT SIZING
            const items = safeGet(context.content, 'visuals.process', []);
            console.log('🖼️ [PROCESS_GALLERY] Processing process images:', items.length);
            if (items.length === 0) {
              processedNode.children = [{
                type: 'div',
                props: { className: 'bg-white rounded-2xl shadow-2xl p-8 min-h-[400px] flex items-center justify-center' },
                children: [{
                  type: 'p',
                  props: { className: 'text-gray-400 text-lg font-medium text-center' },
                  children: ['Process photos will appear here when uploaded']
                }]
              }];
            } else {
              processedNode.children = [{
                type: 'div',
                props: { className: 'bg-white rounded-2xl shadow-2xl p-6 overflow-hidden' },
                children: [{
                  type: 'div',
                  props: { className: `grid gap-4 ${items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}` },
                  children: items.map((image, index) => ({
                    id: `process-image-${index}`,
                    type: 'div',
                    props: { className: 'relative group overflow-hidden rounded-lg' },
                    children: [
                      {
                        type: 'img',
                        props: { 
                          src: image.url || image,
                          alt: `Process image ${index + 1}`,
                          className: 'w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300'
                        }
                      }
                    ]
                  }))
                }]
              }];
            }
          } else if (processedNode.children === 'BEFORE_AFTER_GALLERY') {
            // Handle before/after gallery - ADAPTIVE SLIDER SIZE
            const items = safeGet(context.content, 'visuals.beforeAfter', []);
            console.log('🖼️ [BEFORE_AFTER_GALLERY] Processing before/after images:', items.length);
            if (items.length === 0) {
              processedNode.children = [{
                type: 'div',
                props: { className: 'text-center py-12 text-gray-400 bg-gray-50 rounded-lg' },
                children: ['Before & after images will appear here when uploaded (upload in pairs for interactive sliders)']
              }];
            } else {
              // Group images in pairs for before/after comparison
              const pairs = [];
              for (let i = 0; i < items.length; i += 2) {
                if (items[i + 1]) {
                  pairs.push([items[i], items[i + 1]]);
                } else {
                  pairs.push([items[i], null]);
                }
              }
              
              processedNode.children = [{
                type: 'div',
                props: { className: 'space-y-12' },
                children: pairs.map((pair, pairIndex) => ({
                  id: `before-after-pair-${pairIndex}`,
                  type: 'div',
                  props: { className: 'w-full' },
                  children: [
                    pair[1] ? {
                      type: 'BeforeAfterSlider',
                      props: { 
                        beforeImage: pair[0].url || pair[0],
                        afterImage: pair[1].url || pair[1],
                        className: 'mb-4'
                      }
                    } : {
                      type: 'div',
                      props: { className: 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto' },
                      children: [
                        {
                          type: 'div',
                          props: { className: 'relative group' },
                          children: [
                            {
                              type: 'img',
                              props: { 
                                src: pair[0].url || pair[0],
                                alt: `Before ${pairIndex + 1}`,
                                className: 'w-full h-80 object-cover object-center rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300'
                              }
                            },
                            {
                              type: 'div',
                              props: { className: 'absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold' },
                              children: ['BEFORE']
                            }
                          ]
                        },
                        {
                          type: 'div',
                          props: { className: 'flex items-center justify-center h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300' },
                          children: [{
                            type: 'p',
                            props: { className: 'text-gray-400 text-center' },
                            children: ['Upload "After" image to create interactive slider']
                          }]
                        }
                      ]
                    }
                  ]
                }))
              }];
            }
          } else if (processedNode.children === 'LIFESTYLE_GALLERY') {
            // Handle lifestyle gallery - CENTERED FOR SINGLE ITEMS
            const items = safeGet(context.content, 'visuals.lifestyle', []);
            console.log('🖼️ [LIFESTYLE_GALLERY] Processing lifestyle images:', items.length);
            if (items.length === 0) {
              processedNode.children = [{
                type: 'div',
                props: { className: 'text-center py-12 text-gray-400 bg-gray-50 rounded-lg' },
                children: ['Lifestyle images will appear here when uploaded']
              }];
            } else {
              processedNode.children = [{
                type: 'div',
                props: { className: `grid gap-6 justify-items-center ${items.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : items.length <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' : items.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : items.length <= 6 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}` },
                children: items.map((image, index) => ({
                  id: `lifestyle-image-${index}`,
                  type: 'div',
                  props: { className: 'relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full' },
                  children: [
                    {
                      type: 'img',
                      props: { 
                        src: image.url || image,
                        alt: `Lifestyle ${index + 1}`,
                        className: 'w-full h-64 object-cover object-center group-hover:scale-110 transition-transform duration-500'
                      }
                    },
                    {
                      type: 'div',
                      props: { className: 'absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' }
                    }
                  ]
                }))
              }];
            }
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
  }, [processEventHandlers, model, safeGet]);

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
      
      // Handle BeforeAfterSlider component
      if (type === 'BeforeAfterSlider') {
        return (
          <BeforeAfterSlider
            key={key}
            beforeImage={props.beforeImage}
            afterImage={props.afterImage}
            className={props.className || ''}
          />
        );
      }
      
      const enhancedProps = { ...props };
      
      // Make elements clickable for editing
      if (isEditing && (editable?.contentEditable || (id && children))) {
        const originalOnClick = enhancedProps.onClick;
        
        enhancedProps.onClick = (e) => {
          e.stopPropagation();
          if (originalOnClick && typeof originalOnClick === 'function') {
            originalOnClick(e);
          }
          
          console.log('Element clicked for editing:', { id, type, children });
          
          const editableComp = {
            ...comp,
            editable: { contentEditable: true }
          };
          
          handleComponentEdit(editableComp);
          if (onComponentSelect) {
            onComponentSelect(editableComp);
          }
        };
        
        enhancedProps.className = `${enhancedProps.className || ''} cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 transition-all hover:bg-blue-50`.trim();
        
        if (selectedComponentId === id) {
          enhancedProps.className += ' outline outline-2 outline-blue-500 outline-offset-2 bg-blue-50';
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

      // Keep fallback inline editing for emergency cases
      if (isEditing && editable?.contentEditable && editingText === id) {
        const currentText = Array.isArray(children) ? children[0] : children;
        
        return (
          <div key={key} className="relative">
            <div className="absolute -top-6 left-0 text-xs text-blue-600 bg-white px-2 rounded border border-blue-200">
              Editing: {id}
            </div>
            <textarea
              ref={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleTextSave(id);
                } else if (e.key === 'Escape') {
                  handleTextCancel();
                }
              }}
              onBlur={() => handleTextSave(id)}
              className="w-full px-3 py-2 border-2 border-blue-500 rounded focus:outline-none resize-none"
              rows={Math.min(Math.max(editValue.split('\n').length, 2), 8)}
              placeholder="Edit text content... (Ctrl+Enter to save, Escape to cancel)"
            />
            <div className="text-xs text-gray-500 mt-1">
              Ctrl+Enter to save • Escape to cancel
            </div>
          </div>
        );
      }

      // Process children
      let renderedChildren = null;
      if (!isVoidElement && children) {
        if (Array.isArray(children)) {
          renderedChildren = children.map((child, index) => {
            return renderComponent(child, `${key}-child-${index}`);
          });
        } else {
          renderedChildren = renderComponent(children, `${key}-child`);
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
  }, [model, images, isEditing, onComponentSelect, selectedComponentId, editingText, editValue, state.componentState, state.formData, state.errors, eventHandlers, handleComponentEdit, handleTextEdit, handleTextSave, handleTextCancel]);

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
        console.log(`🎨 [RENDERER] Render #${renderCountRef.current} - Processing component tree`);
        console.log('🎨 [RENDERER] Enhanced context:', enhancedContext);
      }
      return processNode(model.component, enhancedContext);
    } catch (error) {
      console.error('Error processing component tree:', error);
      setRenderError(error);
      return null;
    }
  }, [model.component, enhancedContext, processNode, debug]);
  
  if (debug) {
    console.log('🎨 [RENDERER] Processed component:', processedComponent);
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
        
        {/* Component Edit Dialog */}
        <ComponentEditDialog
          isOpen={editDialogOpen}
          onClose={handleDialogClose}
          component={editingComponent}
          onSave={handleDialogSave}
          debug={debug}
        />
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedJSONModelRenderer;