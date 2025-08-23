"use client";

import React from "react";

// Import your base templates
import GalleryFocusedTemplate from "./templates/GalleryFocusedTemplate";
import MinimalShowcaseTemplate from "./templates/MinimalShowcaseTemplate";
import FeatureGridTemplate from "./templates/FeatureGridTemplate";
import ClassicProductTemplate from "./templates/ClassicProductTemplate";

/**
 * FullTemplatePreview component
 * - Renders the selected layout with the provided content and images
 * - Purely for read-only preview mode
 */
const FullTemplatePreview = ({ layoutType, content, images }) => {
  if (!layoutType || !content) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-gray-600 text-center">
        No layout or content selected. Please go back and choose a layout.
      </div>
    );
  }

  switch (layoutType) {
    case "gallery-focused":
      return (
        <GalleryFocusedTemplate
          title={content.title}
          description={content.description}
          features={content.features}
          featureExplanations={content.featureExplanations}
          images={images}
        />
      );

    case "minimal-showcase":
      return (
        <MinimalShowcaseTemplate
          title={content.title}
          description={content.description}
          features={content.features}
          featureExplanations={content.featureExplanations}
          images={images}
        />
      );

    case "feature-grid":
      return (
        <FeatureGridTemplate
          title={content.title}
          description={content.description}
          features={content.features}
          featureExplanations={content.featureExplanations}
          images={images}
        />
      );

    case "classic-product":
      return (
        <ClassicProductTemplate
          title={content.title}
          description={content.description}
          features={content.features}
          featureExplanations={content.featureExplanations}
          images={images}
        />
      );

    default:
      return (
        <div className="p-6 bg-gray-50 rounded-lg text-gray-600 text-center">
          Unknown layout selected.
        </div>
      );
  }
};

export default FullTemplatePreview;
