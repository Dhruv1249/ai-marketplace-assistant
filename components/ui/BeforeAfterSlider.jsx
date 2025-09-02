'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const BeforeAfterSlider = ({ beforeImage, afterImage, className = '' }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const beforeImgRef = useRef(null);
  const afterImgRef = useRef(null);

  // Calculate dimensions based on the largest image
  const calculateDimensions = useCallback(() => {
    const beforeImg = beforeImgRef.current;
    const afterImg = afterImgRef.current;
    
    if (!beforeImg || !afterImg) return;

    const beforeLoaded = beforeImg.complete && beforeImg.naturalHeight !== 0;
    const afterLoaded = afterImg.complete && afterImg.naturalHeight !== 0;

    if (beforeLoaded && afterLoaded) {
      const beforeAspect = beforeImg.naturalWidth / beforeImg.naturalHeight;
      const afterAspect = afterImg.naturalWidth / afterImg.naturalHeight;
      
      // Use the container width as reference
      const containerWidth = containerRef.current?.offsetWidth || 800;
      
      // Calculate heights for both images at container width
      const beforeHeight = containerWidth / beforeAspect;
      const afterHeight = containerWidth / afterAspect;
      
      // Use the larger height to ensure both images fit
      const finalHeight = Math.max(beforeHeight, afterHeight);
      
      setDimensions({
        width: containerWidth,
        height: Math.min(finalHeight, 600) // Cap at 600px max height
      });
    }
  }, []);

  useEffect(() => {
    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, [calculateDimensions]);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    if (e.touches && e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  }, [updatePosition]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.touches && e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  }, [isDragging, updatePosition]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleContainerClick = useCallback((e) => {
    if (isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.cursor = 'ew-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-xl shadow-2xl cursor-ew-resize select-none max-w-4xl"
        onClick={handleContainerClick}
        onMouseDown={(e) => e.preventDefault()}
        style={{ 
          userSelect: 'none', 
          touchAction: 'none',
          width: dimensions.width || '100%',
          height: dimensions.height || 400
        }}
      >
        {/* Hidden images for dimension calculation */}
        <img
          ref={beforeImgRef}
          src={beforeImage}
          alt="Before"
          style={{ display: 'none' }}
          onLoad={calculateDimensions}
        />
        <img
          ref={afterImgRef}
          src={afterImage}
          alt="After"
          style={{ display: 'none' }}
          onLoad={calculateDimensions}
        />

        {/* Before Image - Adaptive Size */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className="pointer-events-none"
            draggable={false}
            style={{ 
              userSelect: 'none',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg pointer-events-none">
            BEFORE
          </div>
        </div>

        {/* After Image - Adaptive Size with Clip Path */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)`,
            width: '100%',
            height: '100%'
          }}
        >
          <img
            src={afterImage}
            alt="After"
            className="pointer-events-none"
            draggable={false}
            style={{ 
              userSelect: 'none',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg pointer-events-none">
            AFTER
          </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10 cursor-ew-resize"
          style={{ 
            left: `${sliderPosition}%`, 
            transform: 'translateX(-50%)'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div 
            className="absolute top-1/2 left-1/2 w-8 h-8 bg-white border-4 border-blue-500 rounded-full shadow-lg flex items-center justify-center cursor-ew-resize"
            style={{ 
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-blue-500 text-xs font-bold pointer-events-none">⟷</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm opacity-80 pointer-events-none">
          {isDragging ? 'Comparing...' : 'Drag to compare'}
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;