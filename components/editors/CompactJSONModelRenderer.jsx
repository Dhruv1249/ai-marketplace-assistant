'use client';

import React from 'react';
import EnhancedJSONModelRenderer from './EnhancedJSONModelRenderer';

const CompactJSONModelRenderer = (props) => {
  return (
    <div 
      style={{
        transform: 'scale(0.5)',
        transformOrigin: 'top left',
        width: '200%',
        height: '300px',
        overflow: 'hidden'
      }}
    >
      <EnhancedJSONModelRenderer {...props} />
    </div>
  );
};

export default CompactJSONModelRenderer;