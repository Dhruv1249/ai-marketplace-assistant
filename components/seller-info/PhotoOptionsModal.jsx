"use client";

import React, { useState } from 'react';
import { X, Camera, Sparkles, User, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui';

export default function PhotoOptionsModal({ isOpen, onClose, onPhotoGenerated, sellerData }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPhotos, setGeneratedPhotos] = useState([]);
  const [photoCount, setPhotoCount] = useState(3);

  const generatePhotos = async () => {
    setIsGenerating(true);
    try {
      // Generate AI prompts based on seller data
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate ${photoCount} different photo prompts for a business/professional based on this information: 
          Name: ${sellerData?.name || 'Professional'}
          Title: ${sellerData?.title || 'Business Professional'}
          Business: ${sellerData?.businessInfo?.businessName || 'Professional Services'}
          Bio: ${sellerData?.bio || 'Professional service provider'}
          
          Create ${photoCount} distinct, professional photo prompts that would represent this person's business or work environment. Each prompt should be different (office, workspace, meeting, presentation, etc.) and suitable for business use. Return only the prompts, one per line.`,
          context: `Business photos for ${sellerData?.name || 'professional'}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate photo prompts');
      }

      const data = await response.json();
      const prompts = data.content.split('\n').filter(p => p.trim()).slice(0, photoCount);

      const photos = [];
      
      for (let i = 0; i < prompts.length; i++) {
        const seed = Math.floor(Math.random() * 1000000);
        const width = 512;
        const height = 512;
        const model = 'flux';

        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompts[i])}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
        
        photos.push({
          id: Date.now() + i,
          url: imageUrl,
          type: 'ai-generated',
          prompt: prompts[i],
          style: `Business Photo ${i + 1}`
        });
      }

      setGeneratedPhotos(photos);
      
    } catch (error) {
      console.error('Error generating photos:', error);
      alert('Failed to generate photos. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPhoto = (photo) => {
    onPhotoGenerated(photo.url, photo.prompt);
  };

  const handleSelectAllPhotos = () => {
    generatedPhotos.forEach(photo => {
      onPhotoGenerated(photo.url, photo.prompt);
    });
    onClose();
  };

  const handleFinishSelection = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Business Photos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!generatedPhotos.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* No Photos Option */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Photos</h3>
                <p className="text-sm text-gray-600 mb-4">Continue without adding photos</p>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                >
                  Continue Without Photos
                </Button>
              </div>

              {/* Upload Photos Option */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Upload Photos</h3>
                <p className="text-sm text-gray-600 mb-4">Upload your own business photos</p>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                >
                  Choose Files
                </Button>
              </div>

              {/* Generate Photos Option */}
              <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6 text-center">
                <Image size={48} className="mx-auto text-blue-600 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Generate Photos</h3>
                <p className="text-sm text-gray-600 mb-4">Generate business photos based on your info</p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of photos to generate:
                  </label>
                  <select
                    value={photoCount}
                    onChange={(e) => setPhotoCount(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1 photo</option>
                    <option value={2}>2 photos</option>
                    <option value={3}>3 photos</option>
                    <option value={4}>4 photos</option>
                    <option value={5}>5 photos</option>
                  </select>
                </div>

                <Button
                  onClick={generatePhotos}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="mr-2" />
                      Generate {photoCount} Photo{photoCount > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Generated Photos</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSelectAllPhotos}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add All Photos
                  </Button>
                  <Button
                    onClick={() => setGeneratedPhotos([])}
                    variant="outline"
                  >
                    Generate New Set
                  </Button>
                  <Button
                    onClick={handleFinishSelection}
                    variant="outline"
                  >
                    Done Selecting
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedPhotos.map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={photo.url}
                      alt={photo.style}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{photo.style}</h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{photo.prompt}</p>
                      <Button
                        onClick={() => handleSelectPhoto(photo)}
                        size="sm"
                        className="w-full"
                      >
                        Add This Photo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Generated based on:</strong> {sellerData?.name && `${sellerData.name}, `}
                  {sellerData?.title && `${sellerData.title}, `}
                  {sellerData?.businessInfo?.businessName && `${sellerData.businessInfo.businessName}`}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  These photos are AI-generated representations for your business profile. You can select individual photos or add all of them.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}