import React from 'react';
import styled from 'styled-components';

// EditAvatar button using the provided ripple design
// Preserves existing behavior via props so it can replace inline buttons without changing functionality.
const EditAvatar = ({
  onClick,
  disabled = false,
  tabIndex = 0,
  loading = false,
  label = 'Edit Avatar',
  className = '',
}) => {
  return (
    <StyledWrapper>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        tabIndex={tabIndex}
        className={`my-button ${className}`}
      >
        {loading ? 'Updating...' : (label || 'Edit')}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .my-button {
    background-color: blueviolet;
    border: none;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    border-radius: 5px;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
    position: relative;
    overflow: hidden;
    transition: background 0.2s ease, opacity 0.2s ease, transform 0.1s ease;
    cursor: pointer;
  }

  .my-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .my-button:after {
    content: "";
    background-color: rgba(255, 255, 255, 0.2);
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  .my-button:hover:after {
    animation: ripple_401 1s ease-out;
  }

  @keyframes ripple_401 {
    0% {
      width: 5px;
      height: 5px;
      opacity: 1;
    }

    100% {
      width: 200px;
      height: 200px;
      opacity: 0;
    }
  }
`;

export default EditAvatar;
