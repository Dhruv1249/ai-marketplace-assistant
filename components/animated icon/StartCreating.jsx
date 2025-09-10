import React from 'react';
import styled from 'styled-components';

const StartCreatingButton = React.forwardRef(({ children = 'Start Creating', className = '', ...props }, ref) => {
  return (
    <StyledWrapper>
      <button ref={ref} className={`cssbuttonsIoButton ${className}`} {...props}>
        {children}
        <div className="icon">
          <svg height={24} width={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor" />
          </svg>
        </div>
      </button>
    </StyledWrapper>
  );
});

StartCreatingButton.displayName = 'StartCreatingButton';

const StyledWrapper = styled.div`
  .cssbuttonsIoButton {
    background: black;
    color: white;
    font-family: inherit;
    border: 1px solid white;
    text-align: center;
    font-size: 17px;
    font-weight: 600;
    border-radius: 2rem;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    overflow: hidden;
    position: relative;
    height: 2.8em;
    padding-right: 3.3em;
    padding-left: 1rem;
    cursor: pointer;

    /* Smooth transition for background and text color */
    transition:
      background-color 0.4s ease,
      color 0.4s ease;
  }

  .cssbuttonsIoButton .icon {
    background: white;
    margin-left: 1em;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.2em;
    width: 2.2em;
    border-radius: 2rem;
    right: 0.3em;

    /* Already includes transition for icon */
    transition:
      background-position 0.5s ease-out,
      border 0.2s ease-out,
      color 0.5s ease-out;
    will-change: width, transform;
  }

  .cssbuttonsIoButton:hover {
    background-color: white;
    color: #000000;
    border: 1px solid #000;
  }

  .cssbuttonsIoButton .icon svg {
    width: 1.1em;
    transition: transform 0.3s ease-out;
    will-change: transform;
    color: #000000;
  }

  .cssbuttonsIoButton:hover .icon svg {
    transform: translateX(0.1em) rotate(-25deg);
  }

  .cssbuttonsIoButton:active .icon {
    transform: scale(0.95);
  }
  .title {
    margin: 0 auto;
    font-weight: 400;
  }`;

export default StartCreatingButton;
