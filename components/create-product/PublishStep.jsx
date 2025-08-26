'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Check, AlertCircle, Loader2, Globe, FileText, Eye } from 'lucide-react';

const PublishStep = ({
  generatedContent,
  pricing,
  thumbnailImage,
  additionalImages,
  pageModel,
  featureExplanations,
  onBack,
  onPublish
}) => {
  const [createCustomPage, setCreateCustomPage] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishStatus(null);

    try {
      const result = await onPublish({
        createCustomPage,
        generatedContent,
        pricing,
        thumbnailImage,
        additionalImages,
        pageModel,
        featureExplanations
      });

      if (result.success) {
        setPublishStatus({
          type: 'success',
          message: 'Product published successfully!',
          productId: result.productId
        });
      } else {
        setPublishStatus({
          type: 'error',
          message: result.error || 'Failed to publish product'
        });
      }
    } catch (error) {
      setPublishStatus({
        type: 'error',
        message: 'An unexpected error occurred while publishing'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const previewStandardPage = () => {
    // Create standard page preview data
    const standardPreviewData = {
      id: 'preview',
      title: generatedContent?.title || 'Product Title',
      description: generatedContent?.description || 'Product description',
      pricing: pricing || {
        basePrice: 99.99,
        discount: { enabled: false, finalPrice: 99.99 }
      },
      features: generatedContent?.features || [],
      specifications: generatedContent?.specifications || {},
      seoKeywords: generatedContent?.seoKeywords || [],
      metaDescription: generatedContent?.metaDescription || '',
      hasCustomPage: createCustomPage
    };
    
    // Store in localStorage and open standard page preview
    localStorage.setItem('standardPreviewData', JSON.stringify(standardPreviewData));
    window.open('/marketplace/preview-standard', '_blank', 'noopener,noreferrer');
  };

  const previewCustomPage = () => {
    if (!generatedContent || !pageModel) return;
    
    try {
      // Create images array for preview
      const previewImages = [];
      if (thumbnailImage?.url) {
        previewImages.push(thumbnailImage.url);
      }
      additionalImages.forEach(img => {
        if (img?.url) previewImages.push(img.url);
      });

      const payload = {
        model: pageModel,
        content: {
          ...generatedContent,
          featureExplanations: featureExplanations || {},
          pricing: pricing
        },
        images: previewImages
      };
      
      localStorage.setItem('previewData', JSON.stringify(payload));
      window.open('/preview', '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Failed to save previewData:', e);
    }
  };

  const isFormValid = () => {
    return (
      generatedContent?.title &&
      generatedContent?.description &&
      pricing?.basePrice > 0 &&
      thumbnailImage
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Publish Product</h2>

      {!publishStatus && (
        <div className="space-y-6">
          {/* Publishing Options */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3">Publishing Options</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Check className="text-green-600 mr-2" size={16} />
                </div>
                <div className="ml-1">
                  <p className="text-sm font-medium text-gray-900">Standard Product Page</p>
                  <p className="text-sm text-gray-600">
                    A standard product page will always be created for marketplace listing
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="custom-page"
                    type="checkbox"
                    checked={createCustomPage}
                    onChange={(e) => setCreateCustomPage(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="custom-page" className="text-sm font-medium text-gray-900">
                    Create Custom Page (Recommended)
                  </label>
                  <p className="text-sm text-gray-600">
                    Create a custom designed page using your selected template for enhanced presentation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Preview Your Pages</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={previewStandardPage}
                disabled={!isFormValid()}
              >
                <FileText className="mr-2" size={16} />
                Preview Standard Page
              </Button>
              {createCustomPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previewCustomPage}
                  disabled={!isFormValid()}
                >
                  <Eye className="mr-2" size={16} />
                  Preview Custom Page
                </Button>
              )}
            </div>
          </div>

          {/* Product Summary */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Product Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Product Title:</p>
                <p className="font-medium text-gray-900 truncate">{generatedContent?.title}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Final Price:</p>
                <p className="font-medium text-gray-900">
                  ${pricing?.discount?.finalPrice?.toFixed(2) || pricing?.basePrice?.toFixed(2)}
                  {pricing?.discount?.enabled && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${pricing?.basePrice?.toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">Features:</p>
                <p className="font-medium text-gray-900">
                  {generatedContent?.features?.length || 0} features
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">Images:</p>
                <p className="font-medium text-gray-900">
                  1 thumbnail + {additionalImages?.length || 0} additional
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">Template:</p>
                <p className="font-medium text-gray-900 capitalize">
                  {pageModel?.metadata?.template?.replace('-', ' ') || 'Gallery Focused'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">SEO Keywords:</p>
                <p className="font-medium text-gray-900">
                  {generatedContent?.seoKeywords?.length || 0} keywords
                </p>
              </div>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Pre-publish Checklist</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                {generatedContent?.title ? (
                  <Check className="text-green-600 mr-2" size={16} />
                ) : (
                  <AlertCircle className="text-red-600 mr-2" size={16} />
                )}
                <span className={`text-sm ${generatedContent?.title ? 'text-gray-900' : 'text-red-600'}`}>
                  Product title provided
                </span>
              </div>
              
              <div className="flex items-center">
                {generatedContent?.description ? (
                  <Check className="text-green-600 mr-2" size={16} />
                ) : (
                  <AlertCircle className="text-red-600 mr-2" size={16} />
                )}
                <span className={`text-sm ${generatedContent?.description ? 'text-gray-900' : 'text-red-600'}`}>
                  Product description provided
                </span>
              </div>
              
              <div className="flex items-center">
                {pricing?.basePrice > 0 ? (
                  <Check className="text-green-600 mr-2" size={16} />
                ) : (
                  <AlertCircle className="text-red-600 mr-2" size={16} />
                )}
                <span className={`text-sm ${pricing?.basePrice > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  Valid pricing set
                </span>
              </div>
              
              <div className="flex items-center">
                {thumbnailImage ? (
                  <Check className="text-green-600 mr-2" size={16} />
                ) : (
                  <AlertCircle className="text-red-600 mr-2" size={16} />
                )}
                <span className={`text-sm ${thumbnailImage ? 'text-gray-900' : 'text-red-600'}`}>
                  Thumbnail image uploaded
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={onBack} disabled={isPublishing}>
              Back
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={!isFormValid() || isPublishing}
              className="flex items-center"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe className="mr-2" size={16} />
                  Publish to Marketplace
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Publish Status */}
      {publishStatus && (
        <div className="text-center py-8">
          {publishStatus.type === 'success' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Product Published Successfully!
              </h3>
              <p className="text-gray-600">{publishStatus.message}</p>
              
              <div className="flex gap-4 justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/marketplace/${publishStatus.productId}`, '_blank')}
                >
                  <FileText className="mr-2" size={16} />
                  View Standard Page
                </Button>
                {createCustomPage && (
                  <Button
                    onClick={() => window.open(`/marketplace/${publishStatus.productId}/custom`, '_blank')}
                  >
                    <Globe className="mr-2" size={16} />
                    View Custom Page
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Publishing Failed
              </h3>
              <p className="text-gray-600">{publishStatus.message}</p>
              
              <Button
                onClick={() => setPublishStatus(null)}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublishStep;