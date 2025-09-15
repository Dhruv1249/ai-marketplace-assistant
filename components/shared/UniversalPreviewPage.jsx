'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Eye, Code, Bot, Settings, Palette, Save, RotateCcw, Globe } from 'lucide-react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';
import UniversalSourceCodeEditor from '@/components/shared/UniversalSourceCodeEditor';
import UniversalAIAssistant from '@/components/shared/UniversalAIAssistant';

// Import seller info templates for fallback
import professionalTemplate from '@/components/seller-info/templates/professional-template.json';
import creativeTemplate from '@/components/seller-info/templates/creative-template.json';
import executiveTemplate from '@/components/seller-info/templates/executive-template.json';
import personalTemplate from '@/components/seller-info/templates/personal-template.json';

// Import product story templates
import journeyTemplate from '@/components/seller-info/templates/journey-template.json';
import craftTemplate from '@/components/seller-info/templates/craft-template.json';
import impactTemplate from '@/components/seller-info/templates/impact-template.json';
import modernTemplate from '@/components/seller-info/templates/modern-template.json';

const SELLER_TEMPLATE_MAP = {
  'professional': professionalTemplate,
  'creative': creativeTemplate,
  'executive': executiveTemplate,
  'personal': personalTemplate,
};

const PRODUCT_STORY_TEMPLATE_MAP = {
  'journey': journeyTemplate,
  'craft': craftTemplate,
  'impact': impactTemplate,
  'modern': modernTemplate,
};

/**
 * UNIFIED PREVIEW PAGE - ENHANCED FOR PRODUCT STORIES
 */
export default function UniversalPreviewPage({ 
  type = 'product', // 'product', 'seller-info', or 'product-story'
  backUrl = '/create',
  storageKey = 'previewData',
  title = 'Template Preview',
  helpText = 'Keep the creation tab open to view uploaded images in this preview.',
  showHeader = true,
  showEditingUI = true
}) {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sourceCodeEditorOpen, setSourceCodeEditorOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [styleVariables, setStyleVariables] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // ENHANCED DATA LOADING - Works for product stories
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      console.log(`🔍 [UNIFIED] Loading data from ${storageKey}...`);
      
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log(`✅ [UNIFIED] Data loaded:`, {
          keys: Object.keys(parsed),
          hasModel: !!parsed.model,
          hasContent: !!parsed.content,
          hasImages: !!parsed.images,
          type: type
        });
        
        // UNIFIED STRUCTURE: { model, content, images }
        const unifiedData = normalizeDataStructure(parsed, type);
        setData(unifiedData);
        
      } else {
        console.error(`❌ [UNIFIED] No ${storageKey} found in localStorage`);
      }
    } catch (e) {
      console.error(`❌ [UNIFIED] Failed to read or parse ${storageKey}:`, e);
    }
  }, [storageKey, type]);

  /**
   * ENHANCED NORMALIZE DATA STRUCTURE
   * Handles product stories, seller info, and legacy formats
   */
  const normalizeDataStructure = (rawData, dataType) => {
    console.log('🔄 [NORMALIZE] Input data:', rawData);
    console.log('🔄 [NORMALIZE] Data type:', dataType);
    
    // Already in unified format
    if (rawData.model && rawData.content) {
      console.log('✅ [NORMALIZE] Already in unified format');
      return {
        model: rawData.model,
        content: rawData.content,
        images: rawData.images || []
      };
    }
    
    // NEW: Product story format from our form
    if (dataType === 'product-story') {
      console.log('🔄 [NORMALIZE] Converting product-story format');
      
      // If we have productStoryData and templateType (from our form)
      if (rawData.productStoryData && rawData.templateType) {
        const template = PRODUCT_STORY_TEMPLATE_MAP[rawData.templateType] || journeyTemplate;
        
        return {
          model: template,
          content: rawData.productStoryData,
          images: getAllImagesFromProductStory(rawData.productStoryData)
        };
      }
      
      // If we already have model and content
      if (rawData.model && rawData.content) {
        return {
          model: rawData.model,
          content: rawData.content,
          images: rawData.images || []
        };
      }
    }
    
    // Legacy seller-info format: { sellerData, templateType }
    if (rawData.sellerData && rawData.templateType) {
      console.log('🔄 [NORMALIZE] Converting legacy seller-info format');
      const template = SELLER_TEMPLATE_MAP[rawData.templateType] || professionalTemplate;
      
      return {
        model: template,
        content: {
          name: rawData.sellerData.name || '',
          title: rawData.sellerData.title || '',
          bio: rawData.sellerData.bio || '',
          story: rawData.sellerData.story || '',
          experience: rawData.sellerData.experience || '',
          specialties: rawData.sellerData.specialties || [],
          achievements: rawData.sellerData.achievements || [],
          photos: rawData.sellerData.photos || [],
          contact: rawData.sellerData.contact || {},
          businessInfo: rawData.sellerData.businessInfo || {},
        },
        images: rawData.sellerData.photos?.map(photo => photo.url) || []
      };
    }
    
    console.error('❌ [NORMALIZE] Unknown data format:', rawData);
    return null;
  };

  // Helper function to extract all images from product story data
  const getAllImagesFromProductStory = (productStoryData) => {
    const images = [];
    
    if (productStoryData.visuals) {
      Object.values(productStoryData.visuals).forEach(visualArray => {
        if (Array.isArray(visualArray)) {
          visualArray.forEach(visual => {
            if (visual.url) images.push(visual.url);
          });
        }
      });
    }
    
    return images;
  };

  /**
   * UNIFIED ARRAY EXTRACTION - Works for both product and seller-info
   */
  const extractArrayDataFromTemplate = useCallback((updatedTemplate, currentContent) => {
    console.log('🔍 [ARRAYS] Extracting array data...');
    
    const extractFromNode = (node, arrayData = { 
      specialties: currentContent?.specialties || [], 
      achievements: currentContent?.achievements || [],
      testimonials: currentContent?.impact?.testimonials || [],
      metrics: currentContent?.impact?.metrics || []
    }) => {
      if (!node) return arrayData;
      
      if (Array.isArray(node)) {
        node.forEach(child => extractFromNode(child, arrayData));
        return arrayData;
      }
      
      if (typeof node === 'object' && node !== null) {
        // Check for specialties list
        if (node.id === 'specialties-list' && Array.isArray(node.children)) {
          const specialtyItems = node.children
            .filter(child => child && child.id && child.id.startsWith('specialty-'))
            .map(child => {
              if (Array.isArray(child.children) && child.children[0]) {
                return typeof child.children[0] === 'string' ? child.children[0] : '';
              }
              return '';
            })
            .filter(item => item.trim());
          
          if (specialtyItems.length > 0) {
            arrayData.specialties = specialtyItems;
            console.log('✅ [ARRAYS] Extracted specialties:', specialtyItems);
          }
        }
        
        // Check for achievements list
        if (node.id === 'achievements-list' && Array.isArray(node.children)) {
          const achievementItems = node.children
            .filter(child => child && child.id && child.id.startsWith('achievement-'))
            .map(child => {
              if (Array.isArray(child.children) && child.children[0]) {
                let text = typeof child.children[0] === 'string' ? child.children[0] : '';
                text = text.replace(/^•\s*/, '');
                return text;
              }
              return '';
            })
            .filter(item => item.trim());
          
          if (achievementItems.length > 0) {
            arrayData.achievements = achievementItems;
            console.log('✅ [ARRAYS] Extracted achievements:', achievementItems);
          }
        }
        
        // Recursively check children
        if (node.children) {
          extractFromNode(node.children, arrayData);
        }
      }
      
      return arrayData;
    };
    
    return extractFromNode(updatedTemplate.component);
  }, []);

  /**
   * UNIFIED TEMPLATE UPDATE HANDLER - Enhanced for product stories
   */
  const handleTemplateUpdate = useCallback((updatedTemplate) => {
    console.log('🔄 [UNIFIED UPDATE] === TEMPLATE UPDATE START ===');
    console.log('Template ID:', updatedTemplate?.metadata?.template);
    console.log('Update triggered for type:', type);
    
    setData(currentData => {
      if (!currentData) {
        console.error('❌ [UNIFIED UPDATE] No current data to update');
        return currentData;
      }

      console.log('📊 [UNIFIED UPDATE] Current data keys:', Object.keys(currentData));
      
      // UNIFIED UPDATE LOGIC - Same for all types
      let updatedData = {
        ...currentData,
        model: updatedTemplate
      };
      
      // For seller-info, also extract array data
      if (type === 'seller-info') {
        const arrayData = extractArrayDataFromTemplate(updatedTemplate, currentData.content);
        updatedData.content = {
          ...currentData.content,
          specialties: arrayData.specialties,
          achievements: arrayData.achievements
        };
        
        console.log('✅ [UNIFIED UPDATE] Updated seller arrays:', {
          specialties: arrayData.specialties.length,
          achievements: arrayData.achievements.length
        });
      }
      
      // For product-story, handle impact arrays
      if (type === 'product-story') {
        const arrayData = extractArrayDataFromTemplate(updatedTemplate, currentData.content);
        if (currentData.content.impact) {
          updatedData.content = {
            ...currentData.content,
            impact: {
              ...currentData.content.impact,
              testimonials: arrayData.testimonials,
              metrics: arrayData.metrics
            }
          };
        }
        
        console.log('✅ [UNIFIED UPDATE] Updated product story arrays:', {
          testimonials: arrayData.testimonials.length,
          metrics: arrayData.metrics.length
        });
      }
      
      console.log('💾 [UNIFIED UPDATE] Saving updated data to localStorage immediately...');
      
      // IMMEDIATE SAVE AND RE-RENDER - Same for all types
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        console.log('✅ [UNIFIED UPDATE] Successfully saved to localStorage');
        
        // FORCE IMMEDIATE RE-RENDER
        setRenderKey(prev => {
          const newKey = prev + 1;
          console.log(`🔄 [UNIFIED UPDATE] Forcing re-render with key: ${newKey}`);
          return newKey;
        });
        
        // Show success indicator
        setHasUnsavedChanges(true);
        setTimeout(() => setHasUnsavedChanges(false), 2000);
        
      } catch (error) {
        console.error('❌ [UNIFIED UPDATE] Failed to save to localStorage:', error);
      }
      
      // Update style variables
      if (updatedTemplate.styleVariables) {
        setStyleVariables(updatedTemplate.styleVariables);
      }
      
      console.log('🔄 [UNIFIED UPDATE] === TEMPLATE UPDATE END ===');
      return updatedData;
    });
  }, [storageKey, type, extractArrayDataFromTemplate]);

  // Handle component selection in edit mode
  const handleComponentSelect = useCallback((component) => {
    console.log('🎯 [UNIFIED] Component selected:', component?.id);
    setSelectedComponentId(component?.id || null);
  }, []);

  // Handle source code editor actions
  const handleSourceCodeSave = useCallback((newHTML) => {
    console.log('💾 [UNIFIED] Source code saved');
    setSourceCodeEditorOpen(false);
  }, []);

  const handleSourceCodeReset = useCallback(() => {
    console.log('🔄 [UNIFIED] Template reset to default');
    if (data?.model) {
      setStyleVariables({});
    }
  }, [data]);

  // Handle AI assistant template updates
  const handleAITemplateUpdate = useCallback((updatedTemplate) => {
    console.log('🤖 [UNIFIED] AI template update');
    handleTemplateUpdate(updatedTemplate);
    setAiAssistantOpen(false);
  }, [handleTemplateUpdate]);

  // Handle manual save - allows users to save current state anytime
  const handleManualSave = useCallback(() => {
    if (!data) {
      alert('No data to save');
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log('✅ [MANUAL SAVE] Data saved to localStorage');
      
      // Show success indicator
      setHasUnsavedChanges(true);
      setTimeout(() => setHasUnsavedChanges(false), 2000);
      
      alert('Template saved successfully!');
    } catch (error) {
      console.error('❌ [MANUAL SAVE] Failed to save:', error);
      alert('Failed to save template. Please try again.');
    }
  }, [data, storageKey]);

  // Handle manual reset - resets template to original default
  const handleManualReset = useCallback(() => {
    if (!window.confirm('Reset template to original default? All changes will be lost.')) {
      return;
    }

    try {
      // Get the original template based on type
      let originalTemplate;
      
      if (type === 'seller-info') {
        // For seller-info, try to get the original template type from current data
        const templateType = data?.templateType || 'professional';
        originalTemplate = SELLER_TEMPLATE_MAP[templateType] || professionalTemplate;
      } else if (type === 'product-story') {
        // For product-story, try to get the original template type from current data
        const templateType = data?.templateType || 'journey';
        originalTemplate = PRODUCT_STORY_TEMPLATE_MAP[templateType] || journeyTemplate;
      } else {
        // For product, we need to determine what the original template was
        // This is a simplified approach - you might want to store the original template type
        originalTemplate = data?.model || null;
      }

      if (!originalTemplate) {
        alert('No original template available to reset to.');
        return;
      }

      // Create reset data structure
      const resetData = {
        model: originalTemplate,
        content: data?.content || {},
        images: data?.images || []
      };

      // Save reset data to localStorage
      localStorage.setItem(storageKey, JSON.stringify(resetData));
      
      // Update component state
      setData(resetData);
      setStyleVariables({});
      setSelectedComponentId(null);
      setIsEditing(false);
      
      // Force re-render
      setRenderKey(prev => prev + 1);
      
      console.log('✅ [MANUAL RESET] Template reset to original');
      alert('Template reset to original successfully!');
      
    } catch (error) {
      console.error('❌ [MANUAL RESET] Failed to reset:', error);
      alert('Failed to reset template. Please try again.');
    }
  }, [data, storageKey, type]);

  // Handle product story publishing
  const handlePublishProductStory = useCallback(async () => {
    if (!data || type !== 'product-story') {
      alert('No product story data to publish');
      return;
    }

    try {
      // Get the raw data from localStorage to access productId and other metadata
      const rawData = localStorage.getItem(storageKey);
      if (!rawData) {
        alert('No product story data found. Please go back and create your story first.');
        return;
      }

      const parsedData = JSON.parse(rawData);
      
      // Check if we have a productId (for product-specific stories)
      const productId = parsedData.productStoryData?.productId || 
                       parsedData.content?.productId || 
                       parsedData.productId;

      if (!productId) {
        alert('No product ID found. Please create this story page from a published product.');
        return;
      }

      // Get template type
      const templateType = parsedData.templateType || 'journey';

      // Prepare custom page data with proper model structure
      const customPageData = {
        productId: productId,
        templateType: templateType,
        model: data.model,
        content: data.content,
        productStoryData: data.content,
        publishedAt: new Date().toISOString()
      };

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('customData', JSON.stringify(customPageData));

      // Add custom page images if they exist
      let imageIndex = 0;
      if (data.content.visuals) {
        Object.values(data.content.visuals).forEach(visualArray => {
          if (Array.isArray(visualArray)) {
            visualArray.forEach(visual => {
              if (visual.file) {
                formData.append(`customImage_${imageIndex}`, visual.file);
                imageIndex++;
              }
            });
          }
        });
      }

      console.log('🚀 [PUBLISH] Publishing product story:', {
        productId,
        templateType,
        hasContent: !!data.content,
        hasModel: !!data.model,
        imageCount: imageIndex
      });

      // Save custom page data
      const response = await fetch('/api/products/save-custom', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Product story page published successfully!');
        // Navigate to the product page
        window.location.href = `/marketplace/${productId}`;
      } else {
        alert(`Failed to publish: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ [PUBLISH] Error publishing product story:', error);
      alert('An error occurred while publishing the story page. Please try again.');
    }
  }, [data, type, storageKey]);

  const getTemplateName = () => {
    if (!data?.model?.metadata?.template) return 'Template';
    return data.model.metadata.template.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Template.jsx';
  };

  /**
   * UNIFIED RENDERING - Single path for all types
   */
  const renderPreviewContent = () => {
    if (!data) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-4">No preview data found.</p>
            <p className="text-gray-500">
              {type === 'product-story' 
                ? 'Go back to the Product Story page, fill in your information, and click Preview.'
                : type === 'seller-info' 
                ? 'Go back to the Seller Info page, fill in your information, and click Preview.'
                : 'Go back to the Create page, generate content, choose a layout, and click Preview.'
              }
            </p>
          </div>
        </div>
      );
    }

    console.log('🎨 [UNIFIED RENDER] Rendering with unified renderer, key:', renderKey);
    console.log('🎨 [UNIFIED RENDER] Content data:', data.content);
    
    // SINGLE RENDERER FOR ALL TYPES
    return (
      <EnhancedJSONModelRenderer
        key={renderKey}
        model={data.model}
        content={data.content}
        images={data.images}
        isEditing={isEditing}
        onUpdate={handleTemplateUpdate}
        onComponentSelect={handleComponentSelect}
        selectedComponentId={selectedComponentId}
        styleVariables={styleVariables}
        debug={true}
      />
    );
  };

  const getTemplateInfoBar = () => {
    if (!data?.model?.metadata) return null;

    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {data.model.metadata.name || 'Template'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Palette size={14} className="text-gray-500" />
            <span className="text-xs text-gray-600">
              {type === 'product-story' ? 'Product Story Layout' : 
               type === 'seller-info' ? 'Seller Info Layout' : 'Product Layout'}
            </span>
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
              Enhanced Renderer
            </span>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded animate-pulse">
                Saved ✓
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          v{data.model.metadata.version || '1.0'} • Render: #{renderKey} • 
          {type === 'product-story' 
            ? ` Content: ${Object.keys(data?.content || {}).length} sections`
            : type === 'seller-info' 
            ? ` Arrays: ${data?.content?.specialties?.length || 0} specialties, ${data?.content?.achievements?.length || 0} achievements`
            : ' Product Template'
          }
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Controls Bar - Positioned below global nav */}
      {showHeader && (
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {backUrl === 'back' ? (
                  <button 
                    onClick={() => window.history.back()} 
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back</span>
                  </button>
                ) : (
                  <Link href={backUrl} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back</span>
                  </Link>
                )}
                <div className="h-4 w-px bg-gray-300"></div>
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Publish Button for Product Stories */}
                {type === 'product-story' && (
                  <button
                    onClick={handlePublishProductStory}
                    className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Globe size={14} />
                    <span>Publish</span>
                  </button>
                )}

                {showEditingUI && (
                  <>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isEditing 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <Eye size={14} />
                          <span>Preview</span>
                        </>
                      ) : (
                        <>
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSourceCodeEditorOpen(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 hover:bg-gray-100 border rounded-lg transition-colors text-sm"
                    >
                      <Code size={14} />
                      <span>Code</span>
                    </button>

                    <button
                      onClick={() => setAiAssistantOpen(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-white text-purple-700 hover:bg-purple-50 border rounded-lg transition-colors text-sm"
                    >
                      <Bot size={14} />
                      <span>AI</span>
                    </button>

                    <button
                      onClick={handleManualSave}
                      className="flex items-center gap-1 px-3 py-2 bg-white text-green-700 hover:bg-green-50 border rounded-lg transition-colors text-sm"
                    >
                      <Save size={14} />
                      <span>Save</span>
                    </button>

                    <button
                      onClick={handleManualReset}
                      className="flex items-center gap-1 px-3 py-2 bg-white text-red-700 hover:bg-red-50 border rounded-lg transition-colors text-sm"
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  </>
                )}
                
                <div className="text-xs text-gray-500 ml-2 hidden lg:block">
                  {helpText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Info Bar - Only show if showEditingUI is true */}
      {showEditingUI && getTemplateInfoBar()}

      {/* Full Screen Preview */}
      <div className="w-full">
        {renderPreviewContent()}
      </div>

      {/* Edit Mode Helper - Removed as requested */}

      {/* Universal Editors - Only show if showEditingUI is true */}
      {showEditingUI && (
        <>
          <UniversalSourceCodeEditor
            isOpen={sourceCodeEditorOpen}
            onClose={() => setSourceCodeEditorOpen(false)}
            onSave={handleSourceCodeSave}
            onReset={handleSourceCodeReset}
            templateData={data}
            templateName={getTemplateName()}
            onTemplateUpdate={handleTemplateUpdate}
            type={type}
          />

          <UniversalAIAssistant
            isOpen={aiAssistantOpen}
            onClose={() => setAiAssistantOpen(false)}
            onTemplateUpdate={handleAITemplateUpdate}
            templateData={data}
            templateName={getTemplateName()}
            type={type}
          />
        </>
      )}
    </div>
  );
}