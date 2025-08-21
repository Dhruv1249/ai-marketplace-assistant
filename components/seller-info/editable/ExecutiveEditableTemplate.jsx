"use client";

import React, { useState } from "react";
import EditableElement from "../../templates/shared/EditableElement";
import TextEditor from "../../templates/shared/TextEditor";
import { Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram, Facebook, Calendar, Users, Building } from 'lucide-react';

export default function ExecutiveEditableTemplate({
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
        return sellerData?.name || "Executive Name";
      case "seller-title":
        return sellerData?.title || "Chief Executive Officer";
      case "seller-bio":
        return sellerData?.bio || "Executive bio and leadership philosophy...";
      case "seller-story":
        return sellerData?.story || "Leadership journey will appear here...";
      case "seller-experience":
        return sellerData?.experience || "Executive experience will appear here...";
      case "business-name":
        return sellerData?.businessInfo?.businessName || "Business Name";
      case "business-description":
        return sellerData?.businessInfo?.description || "Business description...";
      default:
        if (elementId?.startsWith("specialty-")) {
          const index = parseInt(elementId.split("-")[1]);
          return sellerData?.specialties?.[index] || `Competency ${index + 1}`;
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
    <div className="max-w-6xl mx-auto bg-gray-900 text-white min-h-screen" onClick={handleContainerClick}>
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
                    className="w-36 h-36 rounded object-cover border-4 border-yellow-400 shadow-2xl"
                  />
                  {sellerData.photos.length > 1 && (
                    <div className="flex gap-2 mt-3 justify-center">
                      {sellerData.photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhotoIndex(index)}
                          className={`w-8 h-8 rounded border-2 overflow-hidden ${
                            selectedPhotoIndex === index ? 'border-yellow-400' : 'border-gray-500'
                          }`}
                        >
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-36 h-36 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-400 shadow-2xl">
                  <span className="text-gray-900 text-5xl font-bold">
                    {sellerData.name ? sellerData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* Executive Info */}
            <div className="flex-1 text-center md:text-left">
              <EditableElement
                elementId="seller-name"
                type="text"
                isEditing={isEditing}
                onEdit={handleEdit}
                onMove={handleMove}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                currentText={elementTexts?.["seller-name"] || sellerData?.name || "Executive Name"}
                currentStyle={elementStyles?.["seller-name"] || {}}
                className="mb-3"
              >
                <h1 className="text-4xl md:text-5xl font-bold">
                  {sellerData?.name || 'Executive Name'}
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
                currentText={elementTexts?.["seller-title"] || sellerData?.title || "Chief Executive Officer"}
                currentStyle={elementStyles?.["seller-title"] || {}}
                className="mb-4"
              >
                <p className="text-2xl text-yellow-400 font-medium">
                  {sellerData?.title || 'Chief Executive Officer'}
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
                currentText={elementTexts?.["seller-bio"] || sellerData?.bio || "Executive bio and leadership philosophy..."}
                currentStyle={elementStyles?.["seller-bio"] || {}}
              >
                <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                  {sellerData?.bio || 'Executive bio and leadership philosophy...'}
                </p>
              </EditableElement>
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
                <h2 className="text-3xl font-bold mb-6 text-yellow-400">Leadership Journey</h2>
                <EditableElement
                  elementId="seller-story"
                  type="text"
                  isEditing={isEditing}
                  onEdit={handleEdit}
                  onMove={handleMove}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  currentText={elementTexts?.["seller-story"] || sellerData?.story || "Leadership journey will appear here..."}
                  currentStyle={elementStyles?.["seller-story"] || {}}
                >
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {sellerData.story}
                  </p>
                </EditableElement>
              </div>
            )}

            {/* Experience */}
            {sellerData.experience && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-yellow-400">Executive Experience</h2>
                <EditableElement
                  elementId="seller-experience"
                  type="text"
                  isEditing={isEditing}
                  onEdit={handleEdit}
                  onMove={handleMove}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  currentText={elementTexts?.["seller-experience"] || sellerData?.experience || "Executive experience will appear here..."}
                  currentStyle={elementStyles?.["seller-experience"] || {}}
                >
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {sellerData.experience}
                  </p>
                </EditableElement>
              </div>
            )}

            {/* Business Leadership */}
            {(sellerData.businessInfo?.businessName || sellerData.businessInfo?.description) && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-yellow-400">Organization Leadership</h2>
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
                    className="mb-4"
                  >
                    <h3 className="text-2xl font-semibold text-white">
                      {sellerData.businessInfo.businessName}
                    </h3>
                  </EditableElement>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {sellerData.businessInfo?.founded && (
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-yellow-400 font-semibold">Founded</div>
                      <div className="text-white">{sellerData.businessInfo.founded}</div>
                    </div>
                  )}
                  {sellerData.businessInfo?.employees && (
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-yellow-400 font-semibold">Team Size</div>
                      <div className="text-white">{sellerData.businessInfo.employees}</div>
                    </div>
                  )}
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-yellow-400 font-semibold">Role</div>
                    <div className="text-white">Executive Leader</div>
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
                    <p className="text-gray-300 leading-relaxed">
                      {sellerData.businessInfo.description}
                    </p>
                  </EditableElement>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Core Competencies */}
            {sellerData.specialties && sellerData.specialties.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Core Competencies</h3>
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
                      <div className="text-gray-300 py-2 border-b border-gray-700 last:border-b-0">
                        {specialty}
                      </div>
                    </EditableElement>
                  ))}
                </div>
              </div>
            )}

            {/* Key Achievements */}
            {sellerData.achievements && sellerData.achievements.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Key Achievements</h3>
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
                      <div className="text-gray-300 text-sm leading-relaxed">
                        • {achievement}
                      </div>
                    </EditableElement>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Executive Contact</h3>
              <div className="space-y-3">
                {sellerData.contact?.email && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={16} className="text-yellow-400" />
                    <span className="text-sm">{sellerData.contact.email}</span>
                  </div>
                )}
                {sellerData.contact?.social?.linkedin && (
                  <a
                    href={sellerData.contact.social.linkedin}
                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
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