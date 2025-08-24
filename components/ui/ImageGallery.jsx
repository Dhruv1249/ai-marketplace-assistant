'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const ImageGallery = ({ images = [], template = 'gallery-focused', className = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">No images uploaded</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Template-specific layouts
  const renderGalleryFocused = () => (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Main Image */}
      <div className="lg:col-span-3 relative group">
        <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={`Product image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-200 hover:scale-105"
            onClick={() => setIsZoomed(true)}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </>
          )}

          {/* Zoom Icon */}
          <div className="absolute top-2 right-2 bg-white/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={16} className="text-gray-700" />
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="lg:col-span-1">
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
            {images.slice(0, 6).map((image, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {images.length > 6 && (
              <div className="aspect-square rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">+{images.length - 6}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div className={`relative max-w-2xl mx-auto ${className}`}>
      <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden group">
        <img
          src={images[currentImageIndex]}
          alt={`Product image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderClassic = () => (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <div className="relative aspect-[4/3] bg-gray-50 rounded overflow-hidden group">
        <img
          src={images[currentImageIndex]}
          alt={`Product image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover border border-gray-200"
          onClick={() => setIsZoomed(true)}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={18} className="text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={18} className="text-gray-700" />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                index === currentImageIndex
                  ? 'border-blue-600 ring-1 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderModern = () => (
    <div className={`relative ${className}`}>
      <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden group shadow-lg">
        <img
          src={images[currentImageIndex]}
          alt={`Product image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
          onClick={() => setIsZoomed(true)}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Modern Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white shadow-lg scale-125' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}

        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={18} className="text-white" />
        </div>
      </div>

      {/* Modern Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                index === currentImageIndex
                  ? 'ring-3 ring-blue-500 shadow-lg scale-105'
                  : 'ring-2 ring-gray-200 hover:ring-gray-300 hover:scale-102'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Render based on template
  const renderGallery = () => {
    switch (template) {
      case 'minimal':
        return renderMinimal();
      case 'classic':
        return renderClassic();
      case 'modern':
        return renderModern();
      case 'gallery-focused':
      default:
        return renderGalleryFocused();
    }
  };

  return (
    <>
      {renderGallery()}
      
      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[currentImageIndex]}
              alt={`Product image ${currentImageIndex + 1} - Zoomed`}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;