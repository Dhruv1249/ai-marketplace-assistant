"use client";

import React, { useState } from "react";
import EditableElement from "../../templates/shared/EditableElement";
import TextEditor from "../../templates/shared/TextEditor";
import { Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram, Facebook, Calendar, Users, Building } from 'lucide-react';

export default function ProfessionalEditableTemplate({
  sellerData,
  isEditing = false,
  onContentChange,
}) {
  const [editingElement, setEditingElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [elementStyles, setElementStyles] = useState({});
  const [elementTexts, setElementTexts] = useState({});
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const hasPhotos = sellerData.photos && sellerData.photos.length > 0;

  const handleContainerClick = (e) => {
    if (isEditing && e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const handleEdit = (elementId) => {
    setEditingElement(elementId);
    setTextEditorOpen(true);
  };

  const handleMove = (elementId, position) => {
    // If you want to persist positions externally, you can do it here.
    // console.log("Move:", elementId, position);
  };

  const handleResize = (elementId, size) => {
    // If you want to persist sizes externally, you can do it here.
    // console.log("Resize:", elementId, size);
  };

  const handleTextSave = (newText, newStyle) => {
    setElementStyles((prev) => ({
      ...prev,
      [editingElement]: newStyle,
    }));

    setElementTexts((prev) => ({
      ...prev,
      [editingElement]: newText,
    }));

    onContentChange?.(editingElement, newText, newStyle);

    setEditingElement(null);
  };

  const getCurrentText = (elementId) => {
    if (elementTexts[elementId]) return elementTexts[elementId];

    switch (elementId) {
      case "seller-name":
        return sellerData?.name || "Your Name";
      case "seller-title":
        return sellerData?.title || "Your Professional Title";
      case "seller-bio":
        return sellerData?.bio || "Your professional bio will appear here...";
      case "seller-story":
        return sellerData?.story || "Your story will appear here...";
      case "seller-experience":
        return sellerData?.experience || "Your experience will appear here...";
      case "business-name":
        return sellerData?.businessInfo?.businessName || "Business Name";
      case "business-description":
        return sellerData?.businessInfo?.description || "Business description...";
      default:
        if (elementId?.startsWith("specialty-")) {
          const index = parseInt(elementId.split("-")[1]);
          return sellerData?.specialties?.[index] || `Specialty ${index + 1}`;
        }
        if (elementId?.startsWith("achievement-")) {
          const index = parseInt(elementId.split("-")[1]);
          return sellerData?.achievements?.[index] || `Achievement ${index + 1}`;
        }
        return "Edit this text";
    }
  };

  const getCurrentStyle = (elementId) => elementStyles[elementId] || {};

  return (
    <div className="max-w-6xl mx-auto bg-white" onClick={handleContainerClick}>
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
              <EditableElement
                elementId="seller-name"
                type="text"
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.["seller-name"] || sellerData?.name || "Your Name"}
                currentStyle={elementStyles?.["seller-name"] || {}}
                className="mb-2"
              >
                <h1 className="text-3xl font-bold text-gray-900">
                  {sellerData?.name || 'Your Name'}
                </h1>
              </EditableElement>

              <EditableElement
                elementId="seller-title"
                type="text"
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.["seller-title"] || sellerData?.title || "Your Professional Title"}
                currentStyle={elementStyles?.["seller-title"] || {}}
                className="mb-4"
              >
                <p className="text-xl text-blue-600 font-medium">
                  {sellerData?.title || 'Your Professional Title'}
                </p>
              </EditableElement>

              <EditableElement
                elementId="seller-bio"
                type="text"
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.["seller-bio"] || sellerData?.bio || "Your professional bio will appear here..."}
                currentStyle={elementStyles?.["seller-bio"] || {}}
                className="mb-6"
              >
                <p className="text-gray-700 leading-relaxed">
                  {sellerData?.bio || 'Your professional bio will appear here...'}
                </p>
              </EditableElement>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sellerData.contact?.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <span>{sellerData.contact.email}</span>
                  </div>
                )}
                {sellerData.contact?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span>{sellerData.contact.phone}</span>
                  </div>
                )}
                {sellerData.contact?.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{sellerData.contact.location}</span>
                  </div>
                )}
                {sellerData.contact?.website && (
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
                <EditableElement
                  elementId="seller-story"
                  type="text"
                  isEditing={isEditing}
                  onEdit={handleEdit}
                  onMove={handleMove}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  currentText={elementTexts?.["seller-story"] || sellerData?.story || "Your story will appear here..."}
                  currentStyle={elementStyles?.["seller-story"] || {}}
                >
                  <p className="text-gray-700 leading-relaxed">
                    {sellerData.story}
                  </p>
                </EditableElement>
              </div>
            )}

            {/* Experience Section */}
            {sellerData.experience && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience & Background</h2>
                <EditableElement
                  elementId="seller-experience"
                  type="text"
                  isEditing={isEditing}
                  onEdit={handleEdit}
                  onMove={handleMove}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  currentText={elementTexts?.["seller-experience"] || sellerData?.experience || "Your experience will appear here..."}
                  currentStyle={elementStyles?.["seller-experience"] || {}}
                >
                  <p className="text-gray-700 leading-relaxed">
                    {sellerData.experience}
                  </p>
                </EditableElement>
              </div>
            )}

            {/* Business Info */}
            {(sellerData.businessInfo?.businessName || sellerData.businessInfo?.description) && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Information</h2>
                {sellerData.businessInfo?.businessName && (
                  <EditableElement
                    elementId="business-name"
                    type="text"
                    isEditing={isEditing}
                    onEdit={handleEdit}
                    onMove={handleMove}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    currentText={elementTexts?.["business-name"] || sellerData?.businessInfo?.businessName || "Business Name"}
                    currentStyle={elementStyles?.["business-name"] || {}}
                    className="mb-2"
                  >
                    <h3 className="text-xl font-semibold text-gray-800">
                      {sellerData.businessInfo.businessName}
                    </h3>
                  </EditableElement>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {sellerData.businessInfo?.founded && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Founded {sellerData.businessInfo.founded}</span>
                    </div>
                  )}
                  {sellerData.businessInfo?.employees && (
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

                {sellerData.businessInfo?.description && (
                  <EditableElement
                    elementId="business-description"
                    type="text"
                    isEditing={isEditing}
                    onEdit={handleEdit}
                    onMove={handleMove}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                    currentText={elementTexts?.["business-description"] || sellerData?.businessInfo?.description || "Business description..."}
                    currentStyle={elementStyles?.["business-description"] || {}}
                  >
                    <p className="text-gray-700 leading-relaxed">
                      {sellerData.businessInfo.description}
                    </p>
                  </EditableElement>
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
                    <EditableElement
                      key={index}
                      elementId={`specialty-${index}`}
                      type="text"
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onMove={handleMove}
                      selectedElement={selectedElement}
                      setSelectedElement={setSelectedElement}
                      currentText={elementTexts?.[`specialty-${index}`] || specialty}
                      currentStyle={elementStyles?.[`specialty-${index}`] || {}}
                    >
                      <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm">
                        {specialty}
                      </div>
                    </EditableElement>
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
                    <EditableElement
                      key={index}
                      elementId={`achievement-${index}`}
                      type="text"
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onMove={handleMove}
                      selectedElement={selectedElement}
                      setSelectedElement={setSelectedElement}
                      currentText={elementTexts?.[`achievement-${index}`] || achievement}
                      currentStyle={elementStyles?.[`achievement-${index}`] || {}}
                    >
                      <div className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm">
                        {achievement}
                      </div>
                    </EditableElement>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect</h3>
              <div className="space-y-2">
                {sellerData.contact?.social?.linkedin && (
                  <a
                    href={sellerData.contact.social.linkedin}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin size={16} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {sellerData.contact?.social?.twitter && (
                  <a
                    href={sellerData.contact.social.twitter}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Twitter size={16} />
                    <span>Twitter</span>
                  </a>
                )}
                {sellerData.contact?.social?.instagram && (
                  <a
                    href={sellerData.contact.social.instagram}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Instagram size={16} />
                    <span>Instagram</span>
                  </a>
                )}
                {sellerData.contact?.social?.facebook && (
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

      <TextEditor
        isOpen={textEditorOpen}
        onClose={() => setTextEditorOpen(false)}
        onSave={handleTextSave}
        initialText={getCurrentText(editingElement)}
        initialStyle={getCurrentStyle(editingElement)}
      />
    </div>
  );
}