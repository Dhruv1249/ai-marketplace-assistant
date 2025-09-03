"use client";

import React from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui';

export default function VisualsStep({ 
  productStoryData, 
  handlePhotoUpload, 
  removePhoto, 
  fileInputRefs 
}) {
  const visualCategories = [
    {
      key: 'hero',
      title: 'Hero Product Images',
      description: 'Main product photos that showcase your product beautifully.',
      ref: 'hero'
    },
    {
      key: 'process',
      title: 'Process & Behind-the-Scenes',
      description: 'Show how your product is made, the workspace, tools, or creation process.',
      ref: 'process'
    },
    {
      key: 'lifestyle',
      title: 'Lifestyle & Usage Photos',
      description: 'Show your product in use, lifestyle contexts, or real-world scenarios.',
      ref: 'lifestyle'
    },
    {
      key: 'beforeAfter',
      title: 'Before & After Results',
      description: 'Demonstrate the transformation or results your product provides.',
      ref: 'beforeAfter'
    }
  ];

  const renderPhotoSection = (category) => (
    <div key={category.key} className="border border-gray-200 rounded-lg p-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {category.title}
      </label>
      <p className="text-sm text-gray-600 mb-4">
        {category.description}
      </p>
      
      {/* Photo Grid - Dynamic based on number of photos */}
      {productStoryData.visuals[category.key].length > 0 && (
        <div className={`grid gap-4 mb-4 ${
          productStoryData.visuals[category.key].length === 1 ? 'grid-cols-1 max-w-xs' :
          productStoryData.visuals[category.key].length === 2 ? 'grid-cols-2 max-w-md' :
          productStoryData.visuals[category.key].length <= 4 ? 'grid-cols-2 md:grid-cols-4' :
          productStoryData.visuals[category.key].length <= 6 ? 'grid-cols-2 md:grid-cols-3' :
          'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
        }`}>
          {productStoryData.visuals[category.key].map((photo, index) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url}
                alt={`${category.title} ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border hover:border-blue-300 transition-colors"
              />
              <button
                onClick={() => removePhoto(category.key, photo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handlePhotoUpload(e, category.key)}
        className="hidden"
        ref={fileInputRefs[category.ref]}
      />
      
      <Button
        onClick={() => fileInputRefs[category.ref]?.current?.click()}
        variant="outline"
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        <Upload size={16} />
        Upload {category.title}
        {productStoryData.visuals[category.key].length > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {productStoryData.visuals[category.key].length}
          </span>
        )}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <ImageIcon className="mx-auto mb-4 text-indigo-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Visual Storytelling</h2>
        <p className="text-gray-600">Add compelling visuals to bring your story to life</p>
      </div>

      {/* Dynamic Photo Sections */}
      {visualCategories.map(renderPhotoSection)}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Photo Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {visualCategories.map(category => (
            <div key={category.key} className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {productStoryData.visuals[category.key].length}
              </div>
              <div className="text-blue-800 text-xs">
                {category.title.split(' ')[0]} Photos
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Total: {Object.values(productStoryData.visuals).reduce((total, arr) => total + arr.length, 0)} photos uploaded
        </p>
      </div>
    </div>
  );
}