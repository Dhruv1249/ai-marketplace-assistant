"use client";
import React from "react";
import styled from "styled-components";

const ReadMoreButton = () => {
  return (
    <StyledWrapper>
      <button className="readmore-btn">
        <span className="book-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="rgb(86, 69, 117)"
            viewBox="0 0 126 75"
            className="book"
          >
            <rect
              strokeWidth={3}
              stroke="#fff"
              rx="7.5"
              height={70}
              width={121}
              y="2.5"
              x="2.5"
            />
            <line strokeWidth={3} stroke="#fff" y2={75} x2="63.5" x1="63.5" />
            <path
              strokeLinecap="round"
              strokeWidth={4}
              stroke="#fff"
              d="M25 20H50"
            />
            <path
              strokeLinecap="round"
              strokeWidth={4}
              stroke="#fff"
              d="M101 20H76"
            />
            <path
              strokeLinecap="round"
              strokeWidth={4}
              stroke="#fff"
              d="M16 30L50 30"
            />
            <path
              strokeLinecap="round"
              strokeWidth={4}
              stroke="#fff"
              d="M110 30L76 30"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 65 75"
            className="book-page"
          >
            <path
              strokeLinecap="round"
              strokeWidth={4}
              stroke="#fff"
              d="M40 20H15"
            />
            <path
              strokeLinecap="round"
              strokeWidth={4}
              stroke="#fff"
              d="M49 30L15 30"
            />
            <path
              strokeWidth={3}
              stroke="#fff"
              d="M2.5 2.5H55C59.1421 2.5 62.5 5.85786 62.5 10V65C62.5 69.1421 59.1421 72.5 55 72.5H2.5V2.5Z"
            />
          </svg>
        </span>
        <span className="text"> Read More </span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .readmore-btn {
    height: 48px; 
    min-width: 210px; 
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: rgb(186, 125, 255);
    border: none;
    border-radius: 0.375rem; 
    padding: 0 24px; 
    transition: all 0.4s;
    font-weight: 600;
    font-size: 1.125rem; 
  }

  .book-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    width: 45px;
    height: 100%;
    margin-right: 8px; /* space before text */
  }

  .book-wrapper .book-page {
    width: 50%;
    height: auto;
    position: absolute;
  }

  .readmore-btn:hover .book-page {
    animation: paging 0.4s linear infinite;
    transform-origin: left;
  }

  .readmore-btn:hover {
    background-color: rgb(159, 74, 255);
  }

  @keyframes paging {
    0% {
      transform: rotateY(0deg) skewY(0deg);
    }
    50% {
      transform: rotateY(90deg) skewY(-20deg);
    }
    100% {
      transform: rotateY(180deg) skewY(0deg);
    }
  }

  .text {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.125rem; 
    color: #fff;
  }
`;

export default ReadMoreButton;
