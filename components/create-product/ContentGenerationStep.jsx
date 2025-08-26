'use client';

import React from 'react';
import StreamingContentGenerator from '@/components/ai/StreamingContentGenerator';

const ContentGenerationStep = ({ onContentGenerated }) => {
  return (
    <StreamingContentGenerator onContentGenerated={onContentGenerated} />
  );
};

export default ContentGenerationStep;