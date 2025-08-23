"use client";


import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <button className="button">Try Our Platform</button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    padding: 12px 25px;
    background: #fff;
    border: 1px solid #121212;
    color: #121212;
    font-weight: 700;
    cursor: pointer;
    border-radius: 50px;
    position: relative;
    z-index: 2;
    overflow: hidden;
    transition: all 0.5s ease;
  }
  .button::after {
    content: "";
    width: 100%;
    height: 100%;
    background: #121212;
    position: absolute;
    bottom: -100%;
    left: 0;
    border-radius: 50%;
    z-index: -1;
    transition: all 0.5s ease;
  }
  .button:hover {
    color: #fff;
  }
  .button:hover::after {
    bottom: 0;
    border-radius: 0;
  }`;

export default Button;
