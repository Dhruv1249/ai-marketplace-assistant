'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Sparkles, User, Camera, Eye, Save, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Account creation fields
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Seller info fields
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
    profilePhoto: null, // Changed from photos array to single photo
    businessInfo: {
      businessName: '',
      founded: '',
      employees: '',
      description: ''
    }
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const profilePhotoUrlRef = useRef(null);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentStep]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (profilePhotoUrlRef.current) {
        try {
          URL.revokeObjectURL(profilePhotoUrlRef.current);
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const handleAccountInputChange = (field, value) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    const file = event.target.files?.[0];
    if (file) {
      // Cleanup previous photo URL
      if (profilePhotoUrlRef.current) {
        try {
          URL.revokeObjectURL(profilePhotoUrlRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      const url = URL.createObjectURL(file);
      profilePhotoUrlRef.current = url;
      
      setSellerData(prev => ({
        ...prev,
        profilePhoto: {
          id: Date.now(),
          url: url,
          type: 'uploaded',
          name: file.name,
          file: file
        }
      }));
    }
  };

  const handleCameraCapture = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Cleanup previous photo URL
      if (profilePhotoUrlRef.current) {
        try {
          URL.revokeObjectURL(profilePhotoUrlRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      const url = URL.createObjectURL(file);
      profilePhotoUrlRef.current = url;
      
      setSellerData(prev => ({
        ...prev,
        profilePhoto: {
          id: Date.now(),
          url: url,
          type: 'camera',
          name: file.name,
          file: file
        }
      }));
    }
  };

  const removeProfilePhoto = () => {
    if (profilePhotoUrlRef.current) {
      try {
        URL.revokeObjectURL(profilePhotoUrlRef.current);
      } catch (e) {
        // Ignore cleanup errors
      }
      profilePhotoUrlRef.current = null;
    }
    
    setSellerData(prev => ({
      ...prev,
      profilePhoto: null
    }));
  };

  const handleRegister = async () => {
    setRegistrationError('');
    setIsRegistering(true);

    // Validate account data
    if (!accountData.username || !accountData.email || !accountData.password) {
      setRegistrationError('Please fill in all required account fields');
      setIsRegistering(false);
      return;
    }

    if (accountData.password !== accountData.confirmPassword) {
      setRegistrationError('Passwords do not match');
      setIsRegistering(false);
      return;
    }

    // Validate seller data
    if (!sellerData.name || !sellerData.title) {
      setRegistrationError('Please fill in your name and professional title');
      setIsRegistering(false);
      return;
    }

    try {
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save registration data to localStorage
      const registrationData = {
        username: accountData.username,
        email: accountData.email,
        sellerData: sellerData,
        registeredAt: new Date().toISOString()
      };

      localStorage.setItem('sellerRegistrationData', JSON.stringify(registrationData));

      setRegistrationSuccess(true);
      setCurrentStep(4); // Move to success step

    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const steps = [
    { id: 1, name: 'Account', description: 'Create your account' },
    { id: 2, name: 'Profile', description: 'Professional information' },
    { id: 3, name: 'Details', description: 'Photo & contact info' },
    { id: 4, name: 'Complete', description: 'Registration complete' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Enter your account credentials to get started</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={accountData.username}
                  onChange={(e) => handleAccountInputChange('username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => handleAccountInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={accountData.password}
                  onChange={(e) => handleAccountInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={accountData.confirmPassword}
                  onChange={(e) => handleAccountInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {registrationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="text-red-600 mr-2" size={16} />
                  <p className="text-sm text-red-600">{registrationError}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Information</h2>
              <p className="text-gray-600">Tell us about yourself and your expertise</p>
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Photo & Contact</h2>
              <p className="text-gray-600">Add your profile photo and contact information</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Profile Photo (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Add a professional profile photo to help people recognize you.
              </p>
              
              {!sellerData.profilePhoto ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <User className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 mb-4">No profile photo uploaded</p>
                  
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => cameraInputRef.current?.click()}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Camera size={16} />
                      Take Photo
                    </Button>
                    
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={sellerData.profilePhoto.url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {sellerData.profilePhoto.type === 'camera' ? 'Camera' : 'Uploaded'}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Profile photo added</p>
                    <p className="text-sm text-gray-600">{sellerData.profilePhoto.name}</p>
                    
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => cameraInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                      >
                        <Camera size={14} className="mr-1" />
                        Retake
                      </Button>
                      
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                      >
                        <Upload size={14} className="mr-1" />
                        Replace
                      </Button>
                      
                      <Button
                        onClick={removeProfilePhoto}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleCameraCapture}
                className="hidden"
              />
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

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="text-green-600" size={32} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
              <p className="text-gray-600">
                Welcome to the marketplace! Your account has been created successfully.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Your Profile Summary:</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Username:</strong> {accountData.username}</div>
                <div><strong>Name:</strong> {sellerData.name}</div>
                <div><strong>Title:</strong> {sellerData.title}</div>
                <div><strong>Email:</strong> {accountData.email}</div>
                <div><strong>Contact Email:</strong> {sellerData.contact.email || 'Not provided'}</div>
                <div><strong>Phone:</strong> {sellerData.contact.phone || 'Not provided'}</div>
                <div><strong>Location:</strong> {sellerData.contact.location || 'Not provided'}</div>
                <div><strong>Website:</strong> {sellerData.contact.website || 'Not provided'}</div>
                <div><strong>Business:</strong> {sellerData.businessInfo.businessName || 'Not provided'}</div>
                <div><strong>Profile Photo:</strong> {sellerData.profilePhoto ? 'Added' : 'Not provided'}</div>
                <div><strong>Specialties:</strong> {sellerData.specialties.length} added</div>
                <div><strong>Achievements:</strong> {sellerData.achievements.length} added</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return accountData.username && accountData.email && accountData.password && accountData.confirmPassword && 
               accountData.password === accountData.confirmPassword;
      case 2:
        return sellerData.name && sellerData.title;
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Create Account</h1>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step.id
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : currentStep > step.id
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
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
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep === 3 ? (
                <Button
                  onClick={handleRegister}
                  disabled={!canProceedToNextStep() || isRegistering}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRegistering ? 'Creating Account...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceedToNextStep()}
                >
                  Next
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}