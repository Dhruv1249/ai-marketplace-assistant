import React from 'react';
import styled from 'styled-components';

const GenerateButton = ({ onClick, disabled, className, children, type = 'button', ...props }) => {
  return (
    <StyledWrapper>
      <button type={type} onClick={onClick} disabled={disabled} className={className} {...props}>
        <span className="circle1" />
        <span className="circle2" />
        <span className="circle3" />
        <span className="circle4" />
        <span className="circle5" />
        <span className="text">{children}</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: bold;
    color: white;
    background-color: #171717;
    padding: 0.75em 1.3em;
    border: none;
    border-radius: .6rem;
    position: relative;
    cursor: pointer;
    overflow: hidden;
  }

  button span:not(:nth-child(6)) {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 30px;
    width: 30px;
    background-color: #0c66ed;
    border-radius: 50%;
    transition: 1.6s ease;
    z-index: 1;
  }

  button span:nth-child(6) {
    position: relative;
    z-index: 2;
  }

  button span:nth-child(1) {
    transform: translate(-3.3em, -4em);
  }

  button span:nth-child(2) {
    transform: translate(-6em, 1.3em);
  }

  button span:nth-child(3) {
    transform: translate(-.2em, 1.8em);
  }

  button span:nth-child(4) {
    transform: translate(3.5em, 1.4em);
  }

  button span:nth-child(5) {
    transform: translate(2.5em, -3.8em);
  }

  button:hover span:not(:nth-child(6)) {
    transform: translate(-50%, -50%) scale(14);
    transition: 2.5s ease;
  }`;

export default GenerateButton;
