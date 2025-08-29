// Array processing utilities for JSON renderer

// Generate seller info specialties array
export const generateSpecialtiesArray = (items, templateType) => {
  if (!items || !Array.isArray(items)) return [];
  
  let className = 'bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm';
  
  if (templateType.includes('creative')) {
    className = 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-3 rounded-xl';
  } else if (templateType.includes('executive')) {
    className = 'text-gray-300 py-2 border-b border-gray-700 last:border-b-0';
  } else if (templateType.includes('personal')) {
    className = 'bg-blue-50 text-blue-800 px-4 py-3 rounded-lg';
  }
  
  return items.filter(item => item && item.trim()).map((item, index) => ({
    id: `specialty-${index}`,
    type: 'div',
    props: { className },
    children: [item],
    editable: { contentEditable: true }
  }));
};

// Generate seller info achievements array
export const generateAchievementsArray = (items, templateType) => {
  if (!items || !Array.isArray(items)) return [];
  
  let className = 'bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm';
  
  if (templateType.includes('creative')) {
    className = 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-3 rounded-xl';
  } else if (templateType.includes('executive')) {
    className = 'text-gray-300 text-sm leading-relaxed';
  } else if (templateType.includes('personal')) {
    className = 'bg-green-50 text-green-800 px-4 py-3 rounded-lg';
  }
  
  return items.filter(item => item && item.trim()).map((item, index) => ({
    id: `achievement-${index}`,
    type: 'div',
    props: { className },
    children: templateType.includes('executive') ? [`• ${item}`] : [item],
    editable: { contentEditable: true }
  }));
};

// Generate feature components for product pages
export const generateFeatureComponents = (features, featureExplanations) => {
  if (!features || !Array.isArray(features)) return [];
  
  return features.map((feature, index) => ({
    id: `feature-${index}`,
    type: 'div',
    props: { 
      className: 'border-l-4 border-blue-400 pl-4 mb-4 hover:border-blue-500 transition-colors duration-300'
    },
    children: [
      {
        id: `feature-${index}-title`,
        type: 'h4',
        props: { className: 'font-medium mb-1 text-gray-900' },
        children: [feature],
        editable: { contentEditable: true }
      },
      ...(featureExplanations?.[feature] ? [{
        id: `feature-${index}-explanation`,
        type: 'p',
        props: { className: 'text-sm leading-relaxed text-gray-600' },
        children: [featureExplanations[feature]],
        editable: { contentEditable: true }
      }] : [])
    ]
  }));
};

// Generate specification components
export const generateSpecComponents = (specifications, parentContext = null) => {
  if (!specifications || typeof specifications !== 'object') return [];
  
  const entries = Object.entries(specifications);
  
  // Check if we're inside a table structure
  const isTableContext = parentContext?.type === 'tbody' || parentContext?.type === 'table';
  
  if (isTableContext) {
    // Generate proper table rows
    return entries.map(([key, value], index) => ({
      id: `spec-${index}`,
      type: 'tr',
      props: { 
        className: 'hover:bg-gray-50 transition-colors duration-200'
      },
      children: [
        {
          id: `spec-${index}-key`,
          type: 'td',
          props: { 
            className: 'px-6 py-4 font-medium text-gray-900'
          },
          children: [key],
          editable: { contentEditable: true }
        },
        {
          id: `spec-${index}-value`,
          type: 'td',
          props: { 
            className: 'px-6 py-4 text-gray-600'
          },
          children: [value],
          editable: { contentEditable: true }
        }
      ]
    }));
  } else {
    // Generate div-based layout
    return entries.map(([key, value], index) => ({
      id: `spec-${index}`,
      type: 'div',
      props: { 
        className: 'flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200'
      },
      children: [
        {
          id: `spec-${index}-key`,
          type: 'div',
          props: { 
            className: 'font-medium text-gray-900'
          },
          children: [key],
          editable: { contentEditable: true }
        },
        {
          id: `spec-${index}-value`,
          type: 'div',
          props: { 
            className: 'text-gray-600'
          },
          children: [value],
          editable: { contentEditable: true }
        }
      ]
    }));
  }
};