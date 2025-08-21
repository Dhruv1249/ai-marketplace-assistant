"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram, Facebook, Calendar, Users, Building } from 'lucide-react';

// Professional Template
function ProfessionalTemplate({ sellerData }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const hasPhotos = sellerData.photos && sellerData.photos.length > 0;

  return (
    <div className="max-w-6xl mx-auto bg-white">
      {/* Header Section */}
      <div className="bg-gray-50 border-b">
        <div className="px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {hasPhotos ? (
                <div className="relative">
                  <img
                    src={sellerData.photos[selectedPhotoIndex].url}
                    alt={sellerData.name}
                    className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
                  />
                  {sellerData.photos.length > 1 && (
                    <div className="flex gap-2 mt-3 justify-center">
                      {sellerData.photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhotoIndex(index)}
                          className={`w-8 h-8 rounded border-2 overflow-hidden ${
                            selectedPhotoIndex === index ? 'border-blue-500' : 'border-gray-300'
                          }`}
                        >
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-gray-400 text-4xl font-bold">
                    {sellerData.name ? sellerData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {sellerData.name || 'Your Name'}
              </h1>
              <p className="text-xl text-blue-600 font-medium mb-4">
                {sellerData.title || 'Your Professional Title'}
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                {sellerData.bio || 'Your professional bio will appear here...'}
              </p>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sellerData.contact.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <span>{sellerData.contact.email}</span>
                  </div>
                )}
                {sellerData.contact.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span>{sellerData.contact.phone}</span>
                  </div>
                )}
                {sellerData.contact.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{sellerData.contact.location}</span>
                  </div>
                )}
                {sellerData.contact.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe size={16} />
                    <a href={sellerData.contact.website} className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Story Section */}
            {sellerData.story && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Story</h2>
                <p className="text-gray-700 leading-relaxed">
                  {sellerData.story}
                </p>
              </div>
            )}

            {/* Experience Section */}
            {sellerData.experience && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience & Background</h2>
                <p className="text-gray-700 leading-relaxed">
                  {sellerData.experience}
                </p>
              </div>
            )}

            {/* Business Info */}
            {(sellerData.businessInfo.businessName || sellerData.businessInfo.description) && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Information</h2>
                {sellerData.businessInfo.businessName && (
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {sellerData.businessInfo.businessName}
                  </h3>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {sellerData.businessInfo.founded && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Founded {sellerData.businessInfo.founded}</span>
                    </div>
                  )}
                  {sellerData.businessInfo.employees && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={16} />
                      <span>{sellerData.businessInfo.employees} employees</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building size={16} />
                    <span>Service Provider</span>
                  </div>
                </div>

                {sellerData.businessInfo.description && (
                  <p className="text-gray-700 leading-relaxed">
                    {sellerData.businessInfo.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Specialties */}
            {sellerData.specialties && sellerData.specialties.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                <div className="space-y-2">
                  {sellerData.specialties.filter(s => s.trim()).map((specialty, index) => (
                    <div key={index} className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm">
                      {specialty}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {sellerData.achievements && sellerData.achievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements</h3>
                <div className="space-y-2">
                  {sellerData.achievements.filter(a => a.trim()).map((achievement, index) => (
                    <div key={index} className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm">
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect</h3>
              <div className="space-y-2">
                {sellerData.contact.social.linkedin && (
                  <a
                    href={sellerData.contact.social.linkedin}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin size={16} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {sellerData.contact.social.twitter && (
                  <a
                    href={sellerData.contact.social.twitter}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Twitter size={16} />
                    <span>Twitter</span>
                  </a>
                )}
                {sellerData.contact.social.instagram && (
                  <a
                    href={sellerData.contact.social.instagram}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Instagram size={16} />
                    <span>Instagram</span>
                  </a>
                )}
                {sellerData.contact.social.facebook && (
                  <a
                    href={sellerData.contact.social.facebook}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Facebook size={16} />
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Creative Template
function CreativeTemplate({ sellerData }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const hasPhotos = sellerData.photos && sellerData.photos.length > 0;

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative px-8 py-16 text-center">
          {/* Profile Photo */}
          {hasPhotos ? (
            <div className="relative inline-block mb-6">
              <img
                src={sellerData.photos[selectedPhotoIndex].url}
                alt={sellerData.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl"
              />
              {sellerData.photos.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center">
                  {sellerData.photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`w-10 h-10 rounded-full border-2 overflow-hidden ${
                        selectedPhotoIndex === index ? 'border-purple-500' : 'border-white'
                      }`}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-white shadow-2xl mx-auto mb-6">
              <span className="text-white text-6xl font-bold">
                {sellerData.name ? sellerData.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {sellerData.name || 'Your Name'}
          </h1>
          <p className="text-2xl text-purple-600 font-medium mb-6">
            {sellerData.title || 'Your Creative Title'}
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {sellerData.bio || 'Your creative bio will appear here...'}
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Story */}
          {sellerData.story && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">My Creative Journey</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {sellerData.story}
              </p>
            </div>
          )}

          {/* Skills & Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Specialties */}
            {sellerData.specialties && sellerData.specialties.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Creative Skills</h3>
                <div className="space-y-3">
                  {sellerData.specialties.filter(s => s.trim()).map((specialty, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-3 rounded-xl">
                      {specialty}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {sellerData.achievements && sellerData.achievements.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h3>
                <div className="space-y-3">
                  {sellerData.achievements.filter(a => a.trim()).map((achievement, index) => (
                    <div key={index} className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-3 rounded-xl">
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact & Social */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Let's Connect</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {sellerData.contact.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={20} className="text-purple-600" />
                  <span>{sellerData.contact.email}</span>
                </div>
              )}
              {sellerData.contact.website && (
                <a href={sellerData.contact.website} className="flex items-center gap-2 text-purple-600 hover:text-purple-800">
                  <Globe size={20} />
                  <span>Portfolio</span>
                </a>
              )}
              {sellerData.contact.social.instagram && (
                <a href={sellerData.contact.social.instagram} className="flex items-center gap-2 text-pink-600 hover:text-pink-800">
                  <Instagram size={20} />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Executive Template
function ExecutiveTemplate({ sellerData }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const hasPhotos = sellerData.photos && sellerData.photos.length > 0;

  return (
    <div className="max-w-6xl mx-auto bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {hasPhotos ? (
                <div className="relative">
                  <img
                    src={sellerData.photos[selectedPhotoIndex].url}
                    alt={sellerData.name}
                    className="w-36 h-36 rounded object-cover border-4 border-gold-400 shadow-2xl"
                  />
                  {sellerData.photos.length > 1 && (
                    <div className="flex gap-2 mt-3 justify-center">
                      {sellerData.photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhotoIndex(index)}
                          className={`w-8 h-8 rounded border-2 overflow-hidden ${
                            selectedPhotoIndex === index ? 'border-gold-400' : 'border-gray-500'
                          }`}
                        >
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-36 h-36 rounded bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center border-4 border-gold-400 shadow-2xl">
                  <span className="text-gray-900 text-5xl font-bold">
                    {sellerData.name ? sellerData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* Executive Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {sellerData.name || 'Executive Name'}
              </h1>
              <p className="text-2xl text-gold-400 font-medium mb-4">
                {sellerData.title || 'Chief Executive Officer'}
              </p>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                {sellerData.bio || 'Executive bio and leadership philosophy...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Leadership Story */}
            {sellerData.story && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gold-400">Leadership Journey</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {sellerData.story}
                </p>
              </div>
            )}

            {/* Experience */}
            {sellerData.experience && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gold-400">Executive Experience</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {sellerData.experience}
                </p>
              </div>
            )}

            {/* Business Leadership */}
            {(sellerData.businessInfo.businessName || sellerData.businessInfo.description) && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gold-400">Organization Leadership</h2>
                {sellerData.businessInfo.businessName && (
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {sellerData.businessInfo.businessName}
                  </h3>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {sellerData.businessInfo.founded && (
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-gold-400 font-semibold">Founded</div>
                      <div className="text-white">{sellerData.businessInfo.founded}</div>
                    </div>
                  )}
                  {sellerData.businessInfo.employees && (
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-gold-400 font-semibold">Team Size</div>
                      <div className="text-white">{sellerData.businessInfo.employees}</div>
                    </div>
                  )}
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-gold-400 font-semibold">Role</div>
                    <div className="text-white">Executive Leader</div>
                  </div>
                </div>

                {sellerData.businessInfo.description && (
                  <p className="text-gray-300 leading-relaxed">
                    {sellerData.businessInfo.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Core Competencies */}
            {sellerData.specialties && sellerData.specialties.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gold-400 mb-4">Core Competencies</h3>
                <div className="space-y-2">
                  {sellerData.specialties.filter(s => s.trim()).map((specialty, index) => (
                    <div key={index} className="text-gray-300 py-2 border-b border-gray-700 last:border-b-0">
                      {specialty}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Achievements */}
            {sellerData.achievements && sellerData.achievements.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gold-400 mb-4">Key Achievements</h3>
                <div className="space-y-3">
                  {sellerData.achievements.filter(a => a.trim()).map((achievement, index) => (
                    <div key={index} className="text-gray-300 text-sm leading-relaxed">
                      • {achievement}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gold-400 mb-4">Executive Contact</h3>
              <div className="space-y-3">
                {sellerData.contact.email && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={16} className="text-gold-400" />
                    <span className="text-sm">{sellerData.contact.email}</span>
                  </div>
                )}
                {sellerData.contact.social.linkedin && (
                  <a
                    href={sellerData.contact.social.linkedin}
                    className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <Linkedin size={16} />
                    <span className="text-sm">LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Personal Template
function PersonalTemplate({ sellerData }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const hasPhotos = sellerData.photos && sellerData.photos.length > 0;

  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <div className="text-center px-8 py-16">
        {/* Profile Photo */}
        {hasPhotos ? (
          <div className="relative inline-block mb-8">
            <img
              src={sellerData.photos[selectedPhotoIndex].url}
              alt={sellerData.name}
              className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
            />
            {sellerData.photos.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {sellerData.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`w-12 h-12 rounded-full border-2 overflow-hidden ${
                      selectedPhotoIndex === index ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center border-4 border-white shadow-xl mx-auto mb-8">
            <span className="text-white text-7xl font-bold">
              {sellerData.name ? sellerData.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Hi, I'm {sellerData.name || 'Your Name'}
        </h1>
        <p className="text-2xl text-blue-600 font-medium mb-6">
          {sellerData.title || 'What You Do'}
        </p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          {sellerData.bio || 'A warm, personal introduction about yourself...'}
        </p>
      </div>

      {/* Content Cards */}
      <div className="px-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Personal Story */}
          {sellerData.story && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                My Story
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {sellerData.story}
              </p>
            </div>
          )}

          {/* What I Do */}
          {sellerData.experience && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                What I Do
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {sellerData.experience}
              </p>
            </div>
          )}

          {/* Skills & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* What I'm Good At */}
            {sellerData.specialties && sellerData.specialties.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
                  What I'm Good At
                </h3>
                <div className="space-y-3">
                  {sellerData.specialties.filter(s => s.trim()).map((specialty, index) => (
                    <div key={index} className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg">
                      {specialty}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Things I'm Proud Of */}
            {sellerData.achievements && sellerData.achievements.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  Things I'm Proud Of
                </h3>
                <div className="space-y-3">
                  {sellerData.achievements.filter(a => a.trim()).map((achievement, index) => (
                    <div key={index} className="bg-green-50 text-green-800 px-4 py-3 rounded-lg">
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Let's Connect */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-6">Let's Connect!</h2>
            <p className="text-lg mb-6 opacity-90">
              I'd love to hear from you and discuss how we can work together.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {sellerData.contact.email && (
                <div className="flex items-center gap-2">
                  <Mail size={20} />
                  <span>{sellerData.contact.email}</span>
                </div>
              )}
              {sellerData.contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={20} />
                  <span>{sellerData.contact.phone}</span>
                </div>
              )}
              {sellerData.contact.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{sellerData.contact.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATE_RENDERERS = {
  'professional': ProfessionalTemplate,
  'creative': CreativeTemplate,
  'executive': ExecutiveTemplate,
  'personal': PersonalTemplate,
};

export default function SellerInfoTemplatePreview({ templateType = 'professional', sellerData }) {
  const Renderer = TEMPLATE_RENDERERS[templateType] || ProfessionalTemplate;
  return <Renderer sellerData={sellerData} />;
}