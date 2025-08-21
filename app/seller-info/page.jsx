"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Sparkles, User, Camera, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui';
import SellerInfoTemplateSelector from '@/components/seller-info/SellerInfoTemplateSelector';
import PhotoOptionsModal from '@/components/seller-info/PhotoOptionsModal';
import AIContentGenerator from '@/components/seller-info/AIContentGenerator';

export default function SellerInfoPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  
  const [sellerData, setSellerData] = useState({
    name: '',
    title: '',
    bio: '',
    story: '',
    experience: '',
    specialties: [],
    achievements: [],
    contact: {
      email: '',
      phone: '',
      location: '',
      website: '',
      social: {
        linkedin: '',
        twitter: '',
        instagram: '',
        facebook: ''
      }
    },
    photos: [],
    businessInfo: {
      businessName: '',
      founded: '',
      employees: '',
      description: ''
    }
  });

  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSellerData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSellerData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNestedInputChange = (parent, child, value) => {
    setSellerData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setSellerData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setSellerData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setSellerData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const generateFieldContent = async (fieldType, currentValue) => {
    setIsGenerating(true);
    try {
      let prompt = '';
      const context = `Name: ${sellerData.name}, Title: ${sellerData.title}, Business: ${sellerData.businessInfo.businessName}`;
      
      switch (fieldType) {
        case 'title':
          prompt = `Improve this professional title to be more compelling and specific: "${currentValue}". Consider the context: ${context}. Return only the improved title.`;
          break;
        case 'bio':
          prompt = `Write a compelling professional bio based on this input: "${currentValue}". Context: ${context}. Make it 2-3 sentences, professional, and engaging. Return only the bio.`;
          break;
        case 'story':
          prompt = `Create an engaging personal story based on this input: "${currentValue}". Context: ${context}. Make it 4-6 sentences about their journey, what drives them, and what makes them unique. Return only the story.`;
          break;
        case 'experience':
          prompt = `Write a professional experience summary based on this input: "${currentValue}". Context: ${context}. Include education, career progression, and expertise. 3-4 sentences. Return only the experience summary.`;
          break;
        default:
          prompt = `Improve and make this more professional: "${currentValue}". Context: ${context}`;
      }

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      handleInputChange(fieldType, data.content);
      
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSellerData(prev => ({
          ...prev,
          photos: [...prev.photos, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            type: 'uploaded',
            name: file.name
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAIPhotoGenerated = (photoUrl, prompt) => {
    setSellerData(prev => ({
      ...prev,
      photos: [...prev.photos, {
        id: Date.now(),
        url: photoUrl,
        type: 'ai-generated',
        prompt: prompt
      }]
    }));
  };

  const removePhoto = (photoId) => {
    setSellerData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const handleAIContentGenerated = (content) => {
    setSellerData(prev => ({
      ...prev,
      ...content
    }));
  };

  const handlePreview = () => {
    localStorage.setItem('sellerInfoPreviewData', JSON.stringify({
      sellerData,
      templateType: selectedTemplate
    }));
    window.open('/seller-info/preview', '_blank');
  };

  const handleSave = () => {
    // Save to localStorage or send to API
    localStorage.setItem('sellerInfoData', JSON.stringify({
      sellerData,
      templateType: selectedTemplate,
      savedAt: new Date().toISOString()
    }));
    alert('Seller information saved successfully!');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Tell us about yourself and your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={sellerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Title *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sellerData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Product Designer, CEO, Consultant"
                  />
                  <Button
                    onClick={() => generateFieldContent('title', sellerData.title)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isGenerating || !sellerData.title.trim()}
                  >
                    <Sparkles size={14} />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio *
              </label>
              <div className="flex items-start gap-2">
                <textarea
                  value={sellerData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A brief professional summary about yourself..."
                />
                <Button
                  onClick={() => generateFieldContent('bio', sellerData.bio)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 mt-2"
                  disabled={isGenerating || !sellerData.bio.trim()}
                >
                  <Sparkles size={14} />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Story
              </label>
              <div className="flex items-start gap-2">
                <textarea
                  value={sellerData.story}
                  onChange={(e) => handleInputChange('story', e.target.value)}
                  rows={6}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your journey, what drives you, and what makes you unique..."
                />
                <Button
                  onClick={() => generateFieldContent('story', sellerData.story)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 mt-2"
                  disabled={isGenerating || !sellerData.story.trim()}
                >
                  <Sparkles size={14} />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience & Background
              </label>
              <div className="flex items-start gap-2">
                <textarea
                  value={sellerData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  rows={4}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your professional experience, education, and background..."
                />
                <Button
                  onClick={() => generateFieldContent('experience', sellerData.experience)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 mt-2"
                  disabled={isGenerating || !sellerData.experience.trim()}
                >
                  <Sparkles size={14} />
                </Button>
              </div>
            </div>

            <div className="flex justify-center pt-4 border-t">
              <Button
                onClick={() => setShowAIGenerator(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles size={16} />
                Generate Content with AI
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Specialties & Achievements</h2>
              <p className="text-gray-600">Highlight your expertise and accomplishments</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties & Skills
              </label>
              {sellerData.specialties.map((specialty, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => handleArrayInputChange('specialties', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., UI/UX Design, Digital Marketing, Web Development"
                  />
                  <Button
                    onClick={() => removeArrayItem('specialties', index)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => addArrayItem('specialties')}
                variant="outline"
                size="sm"
              >
                Add Specialty
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements
              </label>
              {sellerData.achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => handleArrayInputChange('achievements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Increased sales by 150%, Led team of 20+ designers"
                  />
                  <Button
                    onClick={() => removeArrayItem('achievements', index)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => addArrayItem('achievements')}
                variant="outline"
                size="sm"
              >
                Add Achievement
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={sellerData.businessInfo.businessName}
                    onChange={(e) => handleNestedInputChange('businessInfo', 'businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your business or company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded
                  </label>
                  <input
                    type="text"
                    value={sellerData.businessInfo.founded}
                    onChange={(e) => handleNestedInputChange('businessInfo', 'founded', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2020, January 2019"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <input
                    type="text"
                    value={sellerData.businessInfo.employees}
                    onChange={(e) => handleNestedInputChange('businessInfo', 'employees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1-10, 50+, Just me"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={sellerData.businessInfo.description}
                  onChange={(e) => handleNestedInputChange('businessInfo', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your business or services..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos & Contact</h2>
              <p className="text-gray-600">Add photos and contact information</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Work Environment Photos (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Add photos that represent your work environment or profession. For example: office space, workshop, farm fields, studio, etc.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {sellerData.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt="Work Environment"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {photo.type === 'ai-generated' ? 'Generated' : 'Uploaded'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPhotoModal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Camera size={16} />
                  Add Photos
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload Photos
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={sellerData.contact.email}
                    onChange={(e) => handleNestedInputChange('contact', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={sellerData.contact.phone}
                    onChange={(e) => handleNestedInputChange('contact', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={sellerData.contact.location}
                    onChange={(e) => handleNestedInputChange('contact', 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={sellerData.contact.website}
                    onChange={(e) => handleNestedInputChange('contact', 'website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Social Media (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={sellerData.contact.social.linkedin}
                      onChange={(e) => handleNestedInputChange('contact', 'social', {...sellerData.contact.social, linkedin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={sellerData.contact.social.twitter}
                      onChange={(e) => handleNestedInputChange('contact', 'social', {...sellerData.contact.social, twitter: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={sellerData.contact.social.instagram}
                      onChange={(e) => handleNestedInputChange('contact', 'social', {...sellerData.contact.social, instagram: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={sellerData.contact.social.facebook}
                      onChange={(e) => handleNestedInputChange('contact', 'social', {...sellerData.contact.social, facebook: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
              <p className="text-gray-600">Select how you want to present your information</p>
            </div>

            <SellerInfoTemplateSelector
              sellerData={sellerData}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Seller Information</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex items-center gap-2"
              disabled={!sellerData.name || !sellerData.title}
            >
              <Eye size={16} />
              Preview
            </Button>
            
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={!sellerData.name || !sellerData.title}
            >
              <Save size={16} />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[
              { number: 1, title: 'Basic Info', completed: step > 1 },
              { number: 2, title: 'Specialties', completed: step > 2 },
              { number: 3, title: 'Photos & Contact', completed: step > 3 },
              { number: 4, title: 'Template', completed: step > 4 }
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === stepItem.number
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : stepItem.completed
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {stepItem.completed ? '✓' : stepItem.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === stepItem.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepItem.title}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    stepItem.completed ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              disabled={step === 1}
            >
              Previous
            </Button>
            
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 4 || (step === 1 && (!sellerData.name || !sellerData.title))}
            >
              {step === 4 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PhotoOptionsModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoGenerated={handleAIPhotoGenerated}
        sellerData={sellerData}
      />

      <AIContentGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onContentGenerated={handleAIContentGenerated}
        currentData={sellerData}
      />
    </div>
  );
}