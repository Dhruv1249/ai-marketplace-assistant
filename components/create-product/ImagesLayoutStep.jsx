'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Eye, Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import DeleteButton from '../animated icon/DeleteButton';

const ImagesLayoutStep = ({
  generatedContent,
  thumbnailImage,
  setThumbnailImage,
  additionalImages,
  setAdditionalImages,
  pricing,
  featureExplanations,
  onBack,
  onContinue,
  onPreview
}) => {
  const thumbnailInputRef = useRef(null);
  const additionalInputRef = useRef(null);
  const prevThumbnailUrlRef = useRef(null);
  const prevAdditionalUrlsRef = useRef([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      try {
        if (prevThumbnailUrlRef.current) {
          URL.revokeObjectURL(prevThumbnailUrlRef.current);
        }
        prevAdditionalUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      } catch {}
    };
  }, []);

  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous URL
      if (prevThumbnailUrlRef.current) {
        try {
          URL.revokeObjectURL(prevThumbnailUrlRef.current);
        } catch {}
      }
      
      // Create new URL
      const url = URL.createObjectURL(file);
      prevThumbnailUrlRef.current = url;
      setThumbnailImage({ file, url });
    }
  };

  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 3 - additionalImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      const newImages = filesToAdd.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      
      // Track URLs for cleanup
      prevAdditionalUrlsRef.current.push(...newImages.map(img => img.url));
      
      setAdditionalImages(prev => [...prev, ...newImages]);
    }
  };

  const removeAdditionalImage = (index) => {
    const imageToRemove = additionalImages[index];
    if (imageToRemove?.url) {
      try {
        URL.revokeObjectURL(imageToRemove.url);
      } catch {}
      
      // Remove from tracking array
      prevAdditionalUrlsRef.current = prevAdditionalUrlsRef.current.filter(
        url => url !== imageToRemove.url
      );
    }
    
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeThumbnail = () => {
    if (thumbnailImage?.url && prevThumbnailUrlRef.current) {
      try {
        URL.revokeObjectURL(prevThumbnailUrlRef.current);
      } catch {}
      prevThumbnailUrlRef.current = null;
    }
    setThumbnailImage(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>

      <div className="space-y-8">
        {/* Thumbnail Image (Mandatory) */}
        <div>
          <div className="flex items-center mb-4">
            <ImageIcon className="mr-2 text-blue-600" size={20} />
            <h3 className="text-lg font-medium text-gray-900">
              Thumbnail Image <span className="text-red-500">*</span>
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            This will be the main image displayed in the marketplace and product page.
          </p>
          
          {!thumbnailImage ? (
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 mb-2">Click to upload thumbnail image</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-square max-w-xs rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={thumbnailImage.url}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2">
                <DeleteButton onClick={removeThumbnail} />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                Change Image
              </Button>
            </div>
          )}
          
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
            className="hidden"
          />
        </div>

        {/* Additional Images (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ImageIcon className="mr-2 text-green-600" size={20} />
              <h3 className="text-lg font-medium text-gray-900">
                Additional Images (Optional)
              </h3>
            </div>
            <span className="text-sm text-gray-500">
              {additionalImages.length}/3 images
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Add up to 3 additional images to showcase different angles or features of your product.
          </p>

          {/* Additional Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {additionalImages.map((image, index) => (
              <div key={index} className="relative">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={image.url}
                    alt={`Additional image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeAdditionalImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {/* Add More Button */}
            {additionalImages.length < 3 && (
              <div
                onClick={() => additionalInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Upload className="mb-2 text-gray-400" size={24} />
                <span className="text-sm text-gray-600">Add Image</span>
              </div>
            )}
          </div>

          <input
            ref={additionalInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesUpload}
            className="hidden"
          />

          {additionalImages.length === 0 && (
            <div className="text-center py-4">
              <Button
                variant="outline"
                onClick={() => additionalInputRef.current?.click()}
              >
                <Upload className="mr-2" size={16} />
                Upload Additional Images
              </Button>
            </div>
          )}
        </div>

        {/* Image Preview Summary */}
        {(thumbnailImage || additionalImages.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Image Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Thumbnail Image:</span>
                <span className={`font-medium ${thumbnailImage ? 'text-green-600' : 'text-red-600'}`}>
                  {thumbnailImage ? '✓ Uploaded' : '✗ Required'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Additional Images:</span>
                <span className="font-medium text-gray-900">
                  {additionalImages.length} of 3 uploaded
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="outline"
            onClick={onPreview}
            disabled={!thumbnailImage}
          >
            <FileText className="mr-2" size={16} />
            Preview Product Page
          </Button>
          <Button 
            onClick={onContinue}
            disabled={!thumbnailImage}
          >
            Continue to Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagesLayoutStep;