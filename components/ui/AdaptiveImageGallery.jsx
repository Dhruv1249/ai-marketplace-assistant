'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ImageLightbox from './ImageLightbox';

const AdaptiveImageGallery = ({ images, className = '', type = 'hero' }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [maxHeight, setMaxHeight] = useState(320);
  const containerRef = useRef(null);
  const imageRefs = useRef([]);

  // Calculate the maximum height needed to show all images without cropping
  const calculateMaxHeight = useCallback(() => {
    if (!images || images.length === 0) return;

    const containerWidth = containerRef.current?.offsetWidth || 800;
    const imageWidth = Math.min(containerWidth / Math.min(images.length, 4), 400); // Max 4 columns, max 400px width
    
    let maxCalculatedHeight = 320; // Default minimum height

    images.forEach((image, index) => {
      const imgElement = imageRefs.current[index];
      if (imgElement && imgElement.complete && imgElement.naturalHeight > 0) {
        const aspectRatio = imgElement.naturalWidth / imgElement.naturalHeight;
        const calculatedHeight = imageWidth / aspectRatio;
        maxCalculatedHeight = Math.max(maxCalculatedHeight, calculatedHeight);
      }
    });

    // Cap the maximum height to prevent extremely tall images from dominating
    const finalHeight = Math.min(maxCalculatedHeight, 500);
    setMaxHeight(finalHeight);
  }, [images]);

  useEffect(() => {
    calculateMaxHeight();
    window.addEventListener('resize', calculateMaxHeight);
    return () => window.removeEventListener('resize', calculateMaxHeight);
  }, [calculateMaxHeight]);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`text-center py-12 text-gray-400 bg-gray-50 rounded-lg ${className}`}>
        {type === 'hero' && 'Hero images will appear here when uploaded'}
        {type === 'process' && 'Process photos will appear here when uploaded'}
        {type === 'lifestyle' && 'Lifestyle images will appear here when uploaded'}
        {type === 'beforeAfter' && 'Before & after images will appear here when uploaded'}
      </div>
    );
  }

  // Determine grid layout based on number of images
  const getGridClass = () => {
    if (images.length === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (images.length === 2) return 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto';
    if (images.length === 3) return 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto';
    if (images.length === 4) return 'grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto';
    if (images.length <= 6) return 'grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto';
  };

  return (
    <div className={`w-full ${className}`}>
      <div ref={containerRef} className={`grid gap-4 justify-items-center ${getGridClass()}`}>
        {images.map((image, index) => {
          const imageUrl = image?.url || image;
          return (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-full"
              onClick={() => openLightbox(index)}
              style={{ height: maxHeight }}
            >
              {/* Hidden image for dimension calculation */}
              <img
                ref={(el) => (imageRefs.current[index] = el)}
                src={imageUrl}
                alt={`${type} ${index + 1}`}
                style={{ display: 'none' }}
                onLoad={calculateMaxHeight}
              />
              
              {/* Visible image */}
              <img
                src={imageUrl}
                alt={`${type} ${index + 1}`}
                className="w-full h-full object-contain bg-gray-100 group-hover:scale-105 transition-transform duration-500"
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-2">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        isOpen={lightboxOpen}
        currentIndex={currentImageIndex}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </div>
  );
};

export default AdaptiveImageGallery;