"use client";

import React, { useState } from "react";
import EditableElement from "../../templates/shared/EditableElement";
import TextEditor from "../../templates/shared/TextEditor";
import { Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';

export default function CreativeEditableTemplate({
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
        return sellerData?.title || "Your Creative Title";
      case "seller-bio":
        return sellerData?.bio || "Your creative bio will appear here...";
      case "seller-story":
        return sellerData?.story || "Your creative journey will appear here...";
      case "seller-experience":
        return sellerData?.experience || "Your experience will appear here...";
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
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 min-h-screen" onClick={handleContainerClick}>
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
            className="mb-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
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
            currentText={elementTexts?.["seller-title"] || sellerData?.title || "Your Creative Title"}
            currentStyle={elementStyles?.["seller-title"] || {}}
            className="mb-6"
          >
            <p className="text-2xl text-purple-600 font-medium">
              {sellerData?.title || 'Your Creative Title'}
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
            currentText={elementTexts?.["seller-bio"] || sellerData?.bio || "Your creative bio will appear here..."}
            currentStyle={elementStyles?.["seller-bio"] || {}}
          >
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {sellerData?.bio || 'Your creative bio will appear here...'}
            </p>
          </EditableElement>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Story */}
          {sellerData.story && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">My Creative Journey</h2>
              <EditableElement
                elementId="seller-story"
                type="text"
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.["seller-story"] || sellerData?.story || "Your creative journey will appear here..."}
                currentStyle={elementStyles?.["seller-story"] || {}}
              >
                <p className="text-gray-700 leading-relaxed text-lg">
                  {sellerData.story}
                </p>
              </EditableElement>
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
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-3 rounded-xl">
                        {specialty}
                      </div>
                    </EditableElement>
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
                      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-3 rounded-xl">
                        {achievement}
                      </div>
                    </EditableElement>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact & Social */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Let's Connect</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {sellerData.contact?.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={20} className="text-purple-600" />
                  <span>{sellerData.contact.email}</span>
                </div>
              )}
              {sellerData.contact?.website && (
                <a href={sellerData.contact.website} className="flex items-center gap-2 text-purple-600 hover:text-purple-800">
                  <Globe size={20} />
                  <span>Portfolio</span>
                </a>
              )}
              {sellerData.contact?.social?.instagram && (
                <a href={sellerData.contact.social.instagram} className="flex items-center gap-2 text-pink-600 hover:text-pink-800">
                  <Instagram size={20} />
                  <span>Instagram</span>
                </a>
              )}
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