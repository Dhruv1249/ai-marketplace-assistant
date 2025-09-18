import React from 'react';
import styled from 'styled-components';

const Button = ({ onClick, disabled, className = '', children = 'Publish', ...rest }) => {
  return (
    <StyledWrapper>
      <button
        className={className}
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
  /* Slightly move the button upward */
  margin-top: -19px;
  display: inline-block;

  button {
    --color: #560bad;
    font-family: inherit;
    display: inline-block;
    width: 8em;
    height: 2.6em;
    line-height: 2.5em;
    margin: 20px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    border: 2px solid var(--color);
    transition: color 0.5s;
    z-index: 1;
    font-size: 17px;
    border-radius: 6px;
    font-weight: 500;
    color: var(--color);
    background: transparent;
  }

  button::before {
    content: "";
    position: absolute;
    z-index: -1;
    background: var(--color);
    height: 150px;
    width: 200px;
    border-radius: 50%;
    top: 100%;
    left: 100%;
    transition: all 0.7s;
  }

  button:hover {
    color: #fff;
  }

  button:hover::before {
    top: -30px;
    left: -30px;
  }

  button:active::before {
    background: #3a0ca3;
    transition: background 0s;
  }
`;

export default Button;
