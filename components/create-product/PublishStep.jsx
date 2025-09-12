'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Check, AlertCircle, Loader2, Globe, FileText, Eye, BookOpen, X } from 'lucide-react';
import BackButton from '../animated icon/BackButton';
import { db, auth } from '@/app/login/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const PublishStep = ({
  generatedContent,
  pricing,
  thumbnailImage,
  additionalImages,
  featureExplanations,
  onBack
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);
  const [showStoryPageModal, setShowStoryPageModal] = useState(false);
  const [wantsStoryPage, setWantsStoryPage] = useState(false);

  const handlePublishClick = () => {
    if (isFormValid()) {
      setShowStoryPageModal(true);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishStatus(null);
    setShowStoryPageModal(false);

    try {
      // Generate unique product ID
      const productId = `product-${Date.now()}`;
      
      // Prepare standard product data
      const standardData = {
        id: productId,
        title: generatedContent.title,
        description: generatedContent.description,
        pricing: pricing,
        features: generatedContent.features || [],
        featureExplanations: featureExplanations || {},
        specifications: generatedContent.specifications || {},
        seoKeywords: generatedContent.seoKeywords || [],
        metaDescription: generatedContent.metaDescription || '',
        hasCustomPage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('standardData', JSON.stringify(standardData));

      // Add thumbnail image
      if (thumbnailImage?.file) {
        formData.append('thumbnailImage', thumbnailImage.file);
      }

      // Add additional images
      additionalImages.forEach((image, index) => {
        if (image?.file) {
          formData.append(`additionalImage_${index}`, image.file);
        }
      });

      // Save product data
      const response = await fetch('/api/products/save', {
        method: 'POST',
        body: formData, // Send as FormData instead of JSON
      });

      const result = await response.json();
      
      if (result.success) {
        // Sync minimal product info to Firestore for dashboard visibility
        try {
          const savedImages = result.savedImages || { thumbnail: null, additional: [] };
          const thumbUrl = savedImages.thumbnail ? `/api/products/${productId}/images/${savedImages.thumbnail}` : '';
          const additionalUrls = Array.isArray(savedImages.additional)
            ? savedImages.additional.map((name) => `/api/products/${productId}/images/${name}`)
            : [];
          const finalPrice = (pricing?.discount?.enabled && pricing?.discount?.finalPrice != null)
            ? pricing.discount.finalPrice
            : (pricing?.basePrice || 0);

          await setDoc(
            doc(db, 'products', productId),
            {
              ownerId: auth.currentUser?.uid || '',
              name: generatedContent.title,
              title: generatedContent.title,
              description: generatedContent.description,
              metaDescription: generatedContent.metaDescription || '',
              price: finalPrice,
              discount: pricing?.discount || {},
              imageUrl: thumbUrl,
              images: additionalUrls,
              features: generatedContent.features || [],
              featureExplanations: featureExplanations || {},
              specifications: generatedContent.specifications || {},
              seoKeywords: generatedContent.seoKeywords || [],
              hasCustomPage: false,
              marketplaceId: productId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (err) {
          console.error('Failed to sync product to Firestore:', err);
        }

        setPublishStatus({
          type: 'success',
          message: 'Product published successfully!',
          productId: productId
        });
      } else {
        setPublishStatus({
          type: 'error',
          message: result.error || 'Failed to publish product'
        });
      }
    } catch (error) {
      console.error('Error publishing product:', error);
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
      featureExplanations: featureExplanations || {},
      specifications: generatedContent?.specifications || {},
      seoKeywords: generatedContent?.seoKeywords || [],
      metaDescription: generatedContent?.metaDescription || '',
      hasCustomPage: false
    };
    
    // Store uploaded images for preview
    const previewImages = [];
    if (thumbnailImage?.url) {
      previewImages.push(thumbnailImage.url);
    }
    additionalImages.forEach(img => {
      if (img?.url) previewImages.push(img.url);
    });
    
    // Store both data and images
    localStorage.setItem('standardPreviewData', JSON.stringify(standardPreviewData));
    localStorage.setItem('previewImages', JSON.stringify(previewImages));
    
    window.open('/marketplace/preview-standard', '_blank', 'noopener,noreferrer');
  };

  const handleCreateStoryPage = (productId) => {
    // Navigate to product story page in same tab with productId
    window.location.href = `/seller-info/${productId}`;
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
          {/* Publishing Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3">Publishing Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Check className="text-green-600 mr-2" size={16} />
                </div>
                <div className="ml-1">
                  <p className="text-sm font-medium text-gray-900">Standard Product Page</p>
                  <p className="text-sm text-gray-600">
                    Your product will be published with a clean, professional layout optimized for the marketplace
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Option */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Preview Your Product Page</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={previewStandardPage}
                disabled={!isFormValid()}
              >
                <FileText className="mr-2" size={16} />
                Preview Product Page
              </Button>
            </div>
          </div>

          {/* Product Story Page Option */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <BookOpen className="mr-2 text-purple-600" size={20} />
              Enhanced Product Story Page
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a compelling product story page with rich visuals, detailed process information, and customer testimonials. 
              This will be saved as a custom page alongside your standard product listing.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wantsStoryPage"
                  checked={wantsStoryPage}
                  onChange={(e) => setWantsStoryPage(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="wantsStoryPage" className="ml-2 text-sm font-medium text-gray-900">
                  Add Product Story Page
                </label>
              </div>
              {wantsStoryPage && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  Will be created after publishing
                </span>
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
                <p className="text-gray-600">SEO Keywords:</p>
                <p className="font-medium text-gray-900">
                  {generatedContent?.seoKeywords?.length || 0} keywords
                </p>
              </div>

              <div>
                <p className="text-gray-600">Feature Explanations:</p>
                <p className="font-medium text-gray-900">
                  {Object.keys(featureExplanations || {}).length} explanations
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
            <div className={`${isPublishing ? 'pointer-events-none opacity-50' : ''}`}>
              <BackButton onClick={isPublishing ? undefined : onBack} />
            </div>
            <Button 
              onClick={handlePublishClick}
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
                  View Product Page
                </Button>
                {wantsStoryPage && (
                  <Button
                    onClick={() => handleCreateStoryPage(publishStatus.productId)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <BookOpen className="mr-2" size={16} />
                    Create Story Page
                  </Button>
                )}
                <Button
                  onClick={() => window.location.href = '/marketplace'}
                >
                  <Globe className="mr-2" size={16} />
                  Browse Marketplace
                </Button>
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

      {/* Product Story Page Modal */}
      {showStoryPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 relative">
            <button
              onClick={() => setShowStoryPageModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-purple-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Product Story Page?
              </h3>
              <p className="text-gray-600 text-sm">
                Would you like to create an enhanced product story page with rich visuals and detailed information? 
                This will be saved as a custom page for "{generatedContent?.title}".
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-purple-900 mb-2">What you'll get:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Rich visual storytelling layouts</li>
                <li>• Detailed product creation process</li>
                <li>• Customer testimonials section</li>
                <li>• Professional template designs</li>
                <li>• Enhanced SEO and engagement</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setWantsStoryPage(false);
                  handlePublish();
                }}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button
                onClick={() => {
                  setWantsStoryPage(true);
                  handlePublish();
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <BookOpen className="mr-2" size={16} />
                Yes, Create Story Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishStep;