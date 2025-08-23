export function generateInitialJSON(layoutType, content, images, featureExplanations) {
  return {
    type: layoutType,
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          title: content?.title || '',
          description: content?.description || '',
          image: images?.[0] || null
        }
      },
      {
        id: 'features',
        type: 'features',
        content: {
          features: content?.features || [],
          explanations: featureExplanations || {}
        }
      },
      {
        id: 'gallery',
        type: 'gallery',
        content: {
          images: images || []
        }
      }
    ]
  };
}
