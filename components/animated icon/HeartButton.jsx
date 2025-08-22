'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Heart } from 'lucide-react';

const HeartIcon = () => {
  const [liked, setLiked] = useState(false);

  return (
    <StyledWrapper>
      <Heart
        className={`icon ${liked ? 'liked' : ''}`}
        size={24}
        onClick={() => setLiked(!liked)}
      />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .icon {
    transition: transform 0.2s linear, color 0.2s linear, fill 0.2s linear;
    cursor: pointer;
  }

  .icon:hover {
    transform: scale(1.2);
  }

  .icon.liked {
    color: #fd1853; /* stroke */
    fill: #fd1853;  /* fill inside */
    animation: pop 0.3s ease;
  }

  @keyframes pop {
    0% {
      transform: scale(1.5);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export default HeartIcon;
