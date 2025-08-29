"use client";

import React from 'react';
import EnhancedJSONModelRenderer from '@/components/editors/EnhancedJSONModelRenderer';

// Template imports
import professionalTemplate from './templates/professional-template.json';
import creativeTemplate from './templates/creative-template.json';
import executiveTemplate from './templates/executive-template.json';
import personalTemplate from './templates/personal-template.json';

const TEMPLATE_MAP = {
  'professional': professionalTemplate,
  'creative': creativeTemplate,
  'executive': executiveTemplate,
  'personal': personalTemplate,
};

export default function SimpleSellerInfoRenderer({ 
  templateType = 'professional', 
  sellerData, 
  isEditing = false,
  onUpdate,
  onComponentSelect,
  selectedComponentId,
  debug = false 
}) {
  const template = TEMPLATE_MAP[templateType] || TEMPLATE_MAP['professional'];
  
  // Transform seller data to content format
  const content = {
    name: sellerData?.name || '',
    title: sellerData?.title || '',
    bio: sellerData?.bio || '',
    story: sellerData?.story || '',
    experience: sellerData?.experience || '',
    specialties: sellerData?.specialties || [],
    achievements: sellerData?.achievements || [],
    photos: sellerData?.photos || [],
    contact: {
      email: sellerData?.contact?.email || '',
      phone: sellerData?.contact?.phone || '',
      location: sellerData?.contact?.location || '',
      website: sellerData?.contact?.website || '',
      social: {
        linkedin: sellerData?.contact?.social?.linkedin || '',
        twitter: sellerData?.contact?.social?.twitter || '',
        instagram: sellerData?.contact?.social?.instagram || '',
        facebook: sellerData?.contact?.social?.facebook || ''
      }
    },
    businessInfo: {
      businessName: sellerData?.businessInfo?.businessName || '',
      founded: sellerData?.businessInfo?.founded || '',
      employees: sellerData?.businessInfo?.employees || '',
      description: sellerData?.businessInfo?.description || ''
    }
  };

  const images = sellerData?.photos?.map(photo => photo.url) || [];

  // Debug logging
  console.log('=== SELLER INFO RENDERER DEBUG ===');
  console.log('Template Type:', templateType);
  console.log('Template:', template);
  console.log('Seller Data:', sellerData);
  console.log('Transformed Content:', content);
  console.log('Images:', images);
  console.log('=====================================');

  return (
    <EnhancedJSONModelRenderer
      model={template}
      content={content}
      images={images}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onComponentSelect={onComponentSelect}
      selectedComponentId={selectedComponentId}
      debug={true}
    />
  );
}