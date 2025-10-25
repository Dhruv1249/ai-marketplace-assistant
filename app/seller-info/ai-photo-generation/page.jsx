"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Sparkles, X, Check, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AIPhotoGenerationPage() {
  const router = useRouter();
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [productStoryData, setProductStoryData] = useState(null);
  const fileInputRef = useRef(null);

  // Load product data from localStorage
  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem('productStoryData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.productStoryData) {
          setProductStoryData(parsed.productStoryData);
        }
      }
    } catch (error) {
      console.error('Error loading product data:', error);
    }
  }, []);

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (uploadedPhotos.length + files.length > 4) {
      setError('Maximum 4 photos allowed');
      return;
    }

    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId) => {
    setUploadedPhotos(uploadedPhotos.filter(photo => {
      if (photo.id === photoId) {
        URL.revokeObjectURL(photo.preview);
      }
      return photo.id !== photoId;
    }));
  };

  const generateStory = async () => {
    if (uploadedPhotos.length === 0) {
      setError('Please upload at least 1 photo');
      return;
    }

    if (!userPrompt.trim()) {
      setError('Please describe what type of page you want');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      
      uploadedPhotos.forEach(photo => {
        formData.append('photos', photo.file);
      });

      formData.append('productName', productStoryData?.basics?.name || 'Product');
      formData.append('productCategory', productStoryData?.basics?.category || 'General');
      formData.append('userPrompt', userPrompt);

      const response = await fetch('/api/ai/generate-from-photos', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }

      const result = await response.json();
      
      if (result.success && result.templateJSON) {
        // Directly open preview with the generated template JSON
        const payload = {
          productStoryData: result.productStoryData,
          templateType: 'ai-photo-generated',
          model: result.templateJSON,
          content: result.productStoryData,
          images: result.firebaseUrls || []
        };

        try {
          console.log('📝 Saving preview data to localStorage...');
          localStorage.setItem('productStoryPreviewData', JSON.stringify(payload));
          console.log('✅ Preview data saved, navigating to preview...');
          
          // Navigate to preview in same window
          router.push('/seller-info/preview');
        } catch (error) {
          console.error('Error saving preview:', error);
          setError('Failed to save preview data. Please try again.');
        }
      } else {
        throw new Error(result.error || 'Failed to generate story');
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate story from photos');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller-info" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">AI Photo Generation</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Create Your Product Story with AI
            </h2>
            <p className="text-gray-600 mb-4">
              Upload 1-4 photos and describe your page type. AI will generate your complete story.
            </p>
          </div>

          <div
            className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors bg-indigo-50"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-100');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-100');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-100');
              handlePhotoUpload({ target: { files: e.dataTransfer.files } });
            }}
          >
            <Upload className="mx-auto text-indigo-600 mb-3" size={40} />
            <h3 className="font-medium text-gray-900 mb-2">Drag and drop photos here</h3>
            <p className="text-sm text-gray-600 mb-4">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Choose Photos
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              Supported formats: JPG, PNG, WebP (1-4 photos)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {uploadedPhotos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  Uploaded Photos ({uploadedPhotos.length}/4)
                </h3>
                {uploadedPhotos.length < 4 && (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    Add More
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedPhotos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.preview}
                      alt={photo.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Page Type *
                </label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="E.g., 'A modern, minimalist product page for eco-friendly skincare' or 'A storytelling page highlighting artisan craftsmanship'"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {userPrompt.length}/500 characters
                </p>
              </div>

              <Button
                onClick={generateStory}
                disabled={isGenerating || uploadedPhotos.length === 0 || !userPrompt.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <Loader className="animate-spin mr-2" size={16} />
                    Generating Story...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={16} />
                    Generate Story from Photos
                  </>
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> Include photos showing your product, creation process, materials, and final result for best results.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
