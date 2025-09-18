import React from 'react';
import styled from 'styled-components';

const Button = ({ onClick, disabled, className = '', children = 'Try It Now', ...rest }) => {
  return (
    <StyledWrapper>
      <button
        className={`button${className ? ' ' + className : ''}`}
        onClick={onClick}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    position: relative;
    z-index: 1;
    overflow: hidden;
    border: none;
    border-radius: 5px;
    padding: 0.75rem 1.25rem;
    font-size: 16px;
    font-family: sans-serif;
    background-color: blue;
    color: white;
    transition: all .7s ease-in-out;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .button:hover {
    color: black;
  }

  .button::before {
    position: absolute;
    display: inline-block;
    top: 0;
    left: 0;
    z-index: -1;
    border-radius: 5px;
    width: 0;
    height: 100%;
    content: "";
    background-color: white;
    transition: all 700ms ease-in-out;
  }

  .button:hover::before {
    left: unset;
    right: 0;
    width: 100%;
    transform: rotate(180deg);
  }
`;

export default Button;
