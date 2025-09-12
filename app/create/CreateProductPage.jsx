'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';

// Import step components
import ContentGenerationStep from '@/components/create-product/ContentGenerationStep';
import ContentReviewStep from '@/components/create-product/ContentReviewStep';
import PricingStep from '@/components/create-product/PricingStep';
import ImagesLayoutStep from '@/components/create-product/ImagesLayoutStep';
import PublishStep from '@/components/create-product/PublishStep';
import BackButton from '@/components/animated icon/BackButton';
import DeleteButton from '@/components/animated icon/DeleteButton';
import DiscardButton from '@/components/animated icon/Discard';
import { db, auth } from '@/app/login/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import GeneratingLoding from '@/components/animated icon/GeneratingLoding';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


const CreateProductPage = () => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [pricing, setPricing] = useState({
    basePrice: 0,
    discount: {
      enabled: false,
      type: 'percentage',
      value: 0,
      finalPrice: 0
    }
  });
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [featureExplanations, setFeatureExplanations] = useState({});
  const [isGeneratingExplanations, setIsGeneratingExplanations] = useState(false);
  const [featuresConfirmed, setFeaturesConfirmed] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Effect to scroll to top whenever step changes
  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const handleContentGenerated = (content) => {
    setGeneratedContent(content);
    setCurrentStep(2);
  };

  const steps = [
    { id: 1, name: 'Generate Content', description: 'Use AI to create your product page content' },
    { id: 2, name: 'Review & Edit', description: 'Review and customize the generated content' },
    { id: 3, name: 'Set Pricing', description: 'Configure product pricing and discounts' },
    { id: 4, name: 'Images & Upload', description: 'Upload product images' },
    { id: 5, name: 'Publish', description: 'Publish your product page to the marketplace' }
  ];

  const generateFeatureExplanations = async () => {
    if (!generatedContent?.features || generatedContent.features.length === 0) return;
    
    setIsGeneratingExplanations(true);
    try {
      const response = await fetch('/api/ai/generate-feature-explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: generatedContent.features,
          productTitle: generatedContent.title,
          productDescription: generatedContent.description
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFeatureExplanations(result.data);
      } else {
        console.error('Failed to generate feature explanations:', result.error);
      }
    } catch (error) {
      console.error('Error generating feature explanations:', error);
    } finally {
      setIsGeneratingExplanations(false);
    }
  };

  const generateSingleFeatureExplanation = async (feature, index) => {
    if (!feature.trim()) return;
    
    try {
      const response = await fetch('/api/ai/generate-feature-explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: [feature],
          productTitle: generatedContent.title,
          productDescription: generatedContent.description
        }),
      });

      const result = await response.json();
      if (result.success && result.data[feature]) {
        setFeatureExplanations(prev => ({
          ...prev,
          [feature]: result.data[feature]
        }));
      }
    } catch (error) {
      console.error('Error generating single feature explanation:', error);
    }
  };

  const handleStepChange = (targetStep) => {
    // Prevent navigation if AI is generating
    if (isGeneratingExplanations || isGeneratingContent) {
      return;
    }

    // If going back and there are changes, show warning
    if (targetStep < currentStep) {
      setShowBackWarning(true);
      setPendingStep(targetStep);
    } else {
      setCurrentStep(targetStep);
    }
  };

  const confirmStepChange = () => {
    // Reset state based on step
    if (pendingStep === 1) {
      setGeneratedContent(null);
      setFeatureExplanations({});
      setFeaturesConfirmed(false);
      setPricing({
        basePrice: 0,
        discount: { enabled: false, type: 'percentage', value: 0, finalPrice: 0 }
      });
      setThumbnailImage(null);
      setAdditionalImages([]);
    } else if (pendingStep === 2) {
      setFeatureExplanations({});
      setFeaturesConfirmed(false);
    }
    
    setCurrentStep(pendingStep);
    setShowBackWarning(false);
    setPendingStep(null);
  };

  const cancelStepChange = () => {
    setShowBackWarning(false);
    setPendingStep(null);
  };

  const regenerateSection = async (section) => {
    if (!generatedContent) return;
    
    setIsGeneratingContent(true);
    try {
      const response = await fetch('/api/ai/regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          context: {
            title: generatedContent.title,
            description: generatedContent.description,
            category: generatedContent.category || '',
            targetAudience: generatedContent.targetAudience || '',
            tone: generatedContent.tone || 'professional'
          },
          currentContent: generatedContent[section]
        }),
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedContent(prev => ({
          ...prev,
          [section]: result.data
        }));
      } else {
        console.error(`Failed to regenerate ${section}:`, result.error);
      }
    } catch (error) {
      console.error('Error regenerating section:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const regenerateAllContent = async () => {
    if (!generatedContent) return;
    
    setIsGeneratingContent(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productTitle: generatedContent.title,
          productDescription: generatedContent.description,
          category: generatedContent.category || '',
          targetAudience: generatedContent.targetAudience || '',
          tone: generatedContent.tone || 'professional',
          generateOptions: {
            features: true,
            specifications: true,
            seoKeywords: true,
            metaDescription: true
          }
        }),
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedContent(result.data);
        // Reset feature explanations since content changed
        setFeatureExplanations({});
        setFeaturesConfirmed(false);
      } else {
        console.error('Failed to regenerate content:', result.error);
      }
    } catch (error) {
      console.error('Error regenerating all content:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const openPreview = () => {
    if (!generatedContent) {
      console.error('Cannot open preview: missing generatedContent');
      return;
    }
    
    try {
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
    } catch (e) {
      console.error('Failed to save previewData:', e);
    }
  };

  // --- FIRESTORE: Publish Product Handler ---
  const handlePublishProduct = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to publish a product.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        ownerId: auth.currentUser.uid,
        name: generatedContent?.title || '',
        description: generatedContent?.description || '',
        price: pricing.basePrice || 0,
        discount: pricing.discount || {},
        imageUrl: thumbnailImage?.url || '',
        additionalImages: additionalImages.map(img => img.url),
        features: generatedContent?.features || [],
        featureExplanations: featureExplanations || {},
        specifications: generatedContent?.specifications || {},
        seoKeywords: generatedContent?.seoKeywords || [],
        metaDescription: generatedContent?.metaDescription || '',
        published: true,
        createdAt: serverTimestamp(),
      });
      alert("Product published successfully!");
      // Optionally reset state or redirect here
    } catch (err) {
      alert("Failed to publish product: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Create Product Page</h1>
            </div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={openPreview}
                disabled={!generatedContent}
              >
                <Eye className="mr-2" size={16} />
                Preview
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <ContentGenerationStep onContentGenerated={handleContentGenerated} />
            )}

            {currentStep === 2 && (
              <ContentReviewStep
                generatedContent={generatedContent}
                setGeneratedContent={setGeneratedContent}
                featureExplanations={featureExplanations}
                setFeatureExplanations={setFeatureExplanations}
                featuresConfirmed={featuresConfirmed}
                setFeaturesConfirmed={setFeaturesConfirmed}
                isGeneratingExplanations={isGeneratingExplanations}
                isGeneratingContent={isGeneratingContent}
                onRegenerateSection={regenerateSection}
                onRegenerateAll={regenerateAllContent}
                onGenerateFeatureExplanations={generateFeatureExplanations}
                onGenerateSingleFeatureExplanation={generateSingleFeatureExplanation}
                onBack={() => handleStepChange(1)}
                onContinue={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 3 && (
              <PricingStep
                pricing={pricing}
                setPricing={setPricing}
                onBack={() => handleStepChange(2)}
                onContinue={() => setCurrentStep(4)}
              />
            )}

            {currentStep === 4 && (
              <ImagesLayoutStep
                generatedContent={generatedContent}
                thumbnailImage={thumbnailImage}
                setThumbnailImage={setThumbnailImage}
                additionalImages={additionalImages}
                setAdditionalImages={setAdditionalImages}
                pricing={pricing}
                featureExplanations={featureExplanations}
                onBack={() => handleStepChange(3)}
                onContinue={() => setCurrentStep(5)}
                onPreview={openPreview}
              />
            )}

            {currentStep === 5 && (
              <PublishStep
                generatedContent={generatedContent}
                pricing={pricing}
                thumbnailImage={thumbnailImage}
                additionalImages={additionalImages}
                featureExplanations={featureExplanations}
                onBack={() => handleStepChange(4)}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Be specific in your product description for better AI results</li>
                <li>• Include key features and benefits</li>
                <li>• Mention your target audience</li>
                <li>• Review and edit generated content before proceeding</li>
                <li>• Set competitive pricing with optional discounts</li>
                <li>• Upload high-quality images for better presentation</li>
                <li>• Feature explanations help customers understand benefits</li>
              </ul>
            </div>

            {generatedContent && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Content:</span>
                    <span className="font-medium text-green-600">✓ Generated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Feature Explanations:</span>
                    <span className={`font-medium ${Object.keys(featureExplanations).length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {Object.keys(featureExplanations).length > 0 ? `✓ ${Object.keys(featureExplanations).length} explanations` : '○ None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pricing:</span>
                    <span className={`font-medium ${pricing.basePrice > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {pricing.basePrice > 0 ? `✓ $${pricing.discount.finalPrice || pricing.basePrice}` : '○ Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images:</span>
                    <span className={`font-medium ${thumbnailImage ? 'text-green-600' : 'text-gray-400'}`}>
                      {thumbnailImage ? `✓ ${1 + additionalImages.length} uploaded` : '○ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {generatedContent && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Preview</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Meta Title</p>
                    <p className="text-sm text-gray-600">{generatedContent.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Meta Description</p>
                    <p className="text-sm text-gray-600">{generatedContent.metaDescription}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Keywords</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {generatedContent.seoKeywords && generatedContent.seoKeywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showBackWarning && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          {/* Lottie animation on the left side */}
          <div className="absolute left-12 bottom-20 h-full w-1/3 flex items-center justify-center pointer-events-none z-10 ml-16">
            <DotLottieReact
              src="https://lottie.host/540b131c-5ae6-4e5c-bf0a-16c17a3e47cf/hPw7pDfWXd.json"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          {/* Modal content on right with pop and border */}
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 border-2 border-black shadow-2xl relative z-20 ml-72">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Discard Changes? 
            </h3>
            <p className="text-gray-600 mb-6">
              Going back will discard all your changes and any AI generation in progress will be cancelled. 
              Are you sure you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <BackButton variant="outline" onClick={cancelStepChange}>
                Cancel
              </BackButton>
              <DiscardButton onClick={confirmStepChange} />
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isGeneratingExplanations && (
        <div className="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
            <div className="flex flex-col items-center -mt-15">
              <GeneratingLoding />
              <h3 className="text-lg font-semibold text-gray-900 -mt-18 mb-4">
                Generating Feature Explanations
              </h3>
              <p className="text-gray-600 text-sm -mt-2">
                AI is creating detailed explanations for your features. This may take a moment...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProductPage;