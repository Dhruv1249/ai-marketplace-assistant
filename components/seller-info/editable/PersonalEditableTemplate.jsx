"use client";

import React, { useState } from "react";
import EditableElement from "../../templates/shared/EditableElement";
import TextEditor from "../../templates/shared/TextEditor";
import { Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';

export default function PersonalEditableTemplate({
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
        return sellerData?.title || "What You Do";
      case "seller-bio":
        return sellerData?.bio || "A warm, personal introduction about yourself...";
      case "seller-story":
        return sellerData?.story || "Your personal story will appear here...";
      case "seller-experience":
        return sellerData?.experience || "What you do will appear here...";
      default:
        if (elementId?.startsWith("specialty-")) {
          const index = parseInt(elementId.split("-")[1]);
          return sellerData?.specialties?.[index] || `Skill ${index + 1}`;
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
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen" onClick={handleContainerClick}>
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

        <EditableElement
          elementId="seller-name"
          type="text"
          isEditing={isEditing}
          onEdit={handleEdit}
          onMove={handleMove}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          currentText={elementTexts?.["seller-name"] || `Hi, I'm ${sellerData?.name || 'Your Name'}`}
          currentStyle={elementStyles?.["seller-name"] || {}}
          className="mb-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Hi, I'm {sellerData?.name || 'Your Name'}
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
          currentText={elementTexts?.["seller-title"] || sellerData?.title || "What You Do"}
          currentStyle={elementStyles?.["seller-title"] || {}}
          className="mb-6"
        >
          <p className="text-2xl text-blue-600 font-medium">
            {sellerData?.title || 'What You Do'}
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
          currentText={elementTexts?.["seller-bio"] || sellerData?.bio || "A warm, personal introduction about yourself..."}
          currentStyle={elementStyles?.["seller-bio"] || {}}
        >
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {sellerData?.bio || 'A warm, personal introduction about yourself...'}
          </p>
        </EditableElement>
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
              <EditableElement
                elementId="seller-story"
                type="text"
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.["seller-story"] || sellerData?.story || "Your personal story will appear here..."}
                currentStyle={elementStyles?.["seller-story"] || {}}
              >
                <p className="text-gray-700 leading-relaxed text-lg">
                  {sellerData.story}
                </p>
              </EditableElement>
            </div>
          )}

          {/* What I Do */}
          {sellerData.experience && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                What I Do
              </h2>
              <EditableElement
                elementId="seller-experience"
                type="text"
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.["seller-experience"] || sellerData?.experience || "What you do will appear here..."}
                currentStyle={elementStyles?.["seller-experience"] || {}}
              >
                <p className="text-gray-700 leading-relaxed text-lg">
                  {sellerData.experience}
                </p>
              </EditableElement>
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
                      <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg">
                        {specialty}
                      </div>
                    </EditableElement>
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
                      <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg">
                        {achievement}
                      </div>
                    </EditableElement>
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
              {sellerData.contact?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={20} />
                  <span>{sellerData.contact.email}</span>
                </div>
              )}
              {sellerData.contact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={20} />
                  <span>{sellerData.contact.phone}</span>
                </div>
              )}
              {sellerData.contact?.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{sellerData.contact.location}</span>
                </div>
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