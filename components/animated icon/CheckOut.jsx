'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import CommingSoon from '@/components/animated icon/CommingSoon.jsx';

const Button = ({ canCheckout = true }) => {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [redirected, setRedirected] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  const onAnimEnd = (e) => {
    if (e?.animationName === 'truck') {
      setComingSoonOpen(true);
    }
  };

  useEffect(() => {
    if (started && !comingSoonOpen) {
      const t = setTimeout(() => setComingSoonOpen(true), 6000); // Fallback in case animationend doesn't fire
      return () => clearTimeout(t);
    }
  }, [started, comingSoonOpen]);

  const handleChange = (e) => {
    if (e.target.checked) {
      setStarted(true);
    }
  };

  // Lock body scroll when Coming Soon modal is open
  useEffect(() => {
    if (!comingSoonOpen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [comingSoonOpen]);

  return (
    <>
      {comingSoonOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setComingSoonOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="transform scale-110 md:scale-125">
            <CommingSoon />
          </div>
        </div>
      )}
      <StyledWrapper>
      <label className="order-wrapper">
        <input type="checkbox" id="order-toggle" hidden onChange={handleChange} disabled={!canCheckout} />
        <span className="order" aria-disabled={!canCheckout} title={!canCheckout ? 'Fill all required fields to proceed' : undefined}>
          <span className="default">Click To Finish Checkout</span>
          <span className="success">Order Delivered
            <svg viewBox="0 0 12 10">
              <polyline points="1.5 6 4.5 9 10.5 1" />
            </svg>
          </span>
          <div className="box" />
          <div className="truck" onAnimationEnd={onAnimEnd}>
            <div className="back" />
            <div className="front">
              <div className="window" />
            </div>
            <div className="light top" />
            <div className="light bottom" />
          </div>
          <div className="lines" />
        </span>
      </label>
    </StyledWrapper>
    </>
  );
}

const StyledWrapper = styled.div`
  .order {
    appearance: none;
    border: 0;
    background: #1a1919e8;
    position: relative;
    height: 63px;
    width: 240px;
    padding: 0;
    outline: none;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    font-family: "Poppins", sans-serif;
    transition: transform 0.3s ease;
    display: inline-block;
    box-shadow:
      rgb(83, 83, 83) 3px 3px 6px 0px inset,
      rgb(0, 0, 0) -3px -3px 6px 1px inset;
  }

  .order:hover {
    transform: translateY(-2px) scale(1.02);
    background: #2a2929;
    box-shadow:
      0 6px 15px rgba(0, 0, 0, 0.4),
      inset 1px 1px 3px rgba(255, 255, 255, 0.05),
      inset -1px -1px 3px rgba(0, 0, 0, 0.4);
  }
  .order span {
    --o: 1;
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    top: 19px;
    line-height: 24px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    opacity: var(--o);
    transition: opacity 0.3s ease;
  }

  .order span.default {
    transition-delay: 0.3s;
  }

  .order span.success {
    --offset: 16px;
    --o: 0;
  }

  .order span.success svg {
    width: 12px;
    height: 10px;
    display: inline-block;
    vertical-align: top;
    fill: none;
    margin: 7px 0 0 4px;
    stroke: #16bf78;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 16px;
    stroke-dashoffset: var(--offset);
    transition: stroke-dashoffset 0.3s ease;
  }

  .order .lines {
    opacity: 0;
    position: absolute;
    height: 6px;
    background: #ffffff;
    border-radius: 2px;
    width: 10px;
    top: 30px;
    left: 100%;
    box-shadow:
      15px 0 0 #fff,
      30px 0 0 #fff,
      45px 0 0 #fff,
      60px 0 0 #fff,
      75px 0 0 #fff,
      90px 0 0 #fff,
      105px 0 0 #fff,
      120px 0 0 #fff,
      135px 0 0 #fff,
      150px 0 0 #fff,
      165px 0 0 #fff,
      180px 0 0 #fff,
      195px 0 0 #fff,
      210px 0 0 #fff,
      225px 0 0 #fff,
      240px 0 0 #fff,
      255px 0 0 #fff,
      270px 0 0 #fff,
      285px 0 0 #fff,
      300px 0 0 #fff,
      315px 0 0 #fff,
      330px 0 0 #fff;
  }

  .order .back,
  .order .box {
    border-radius: 2px;
    background: linear-gradient(#ffffff, #cdd9ed);
    position: absolute;
  }

  .order .truck {
    width: 60px;
    height: 41px;
    left: 100%;
    top: 11px;
    position: absolute;
    z-index: 1;
    transform: translateX(24px);
  }

  .order .truck:before,
  .order .truck:after {
    --r: -90deg;
    content: "";
    height: 2px;
    width: 20px;
    right: 58px;
    position: absolute;
    display: block;
    background: #ffffff;
    border-radius: 1px;
    transform-origin: 100% 50%;
    transform: rotate(var(--r));
  }

  .order .truck:before {
    top: 4px;
  }
  .order .truck:after {
    --r: 90deg;
    bottom: 4px;
  }

  .order .truck .back {
    left: 0;
    top: 0;
    width: 100px;
    height: 41px;
    z-index: 1;
  }

  .order .truck .front {
    overflow: hidden;
    position: absolute;
    border-radius: 2px 9px 9px 2px;
    width: 26px;
    height: 41px;
    left: 100px;
  }

  .order .truck .front:before {
    height: 13px;
    width: 2px;
    left: 0;
    top: 14px;
    background: linear-gradient(#6c7486, #3f4656);
    content: "";
    position: absolute;
  }

  .order .truck .front:after {
    border-radius: 2px 9px 9px 2px;
    background: #f19203;
    width: 24px;
    height: 41px;
    right: 0;
    content: "";
    position: absolute;
  }

  .order .truck .front .window {
    overflow: hidden;
    border-radius: 2px 8px 8px 2px;
    background: #ffd699;
    transform: perspective(4px) rotateY(3deg);
    width: 22px;
    height: 41px;
    position: absolute;
    left: 2px;
    top: 0;
    z-index: 1;
    transform-origin: 0 50%;
  }

  .order .truck .front .window:before {
    content: "";
    top: 0;
    bottom: 0;
    width: 14px;
    right: 0;
    position: absolute;
    background: #1c212e;
  }

  .order .truck .front .window:after {
    content: "";
    width: 14px;
    top: 7px;
    height: 4px;
    right: 0;
    position: absolute;
    background: rgba(255, 255, 255, 0.14);
    transform: skewY(14deg);
    box-shadow: 0 7px 0 rgba(255, 255, 255, 0.14);
  }

  .order .truck .light {
    width: 3px;
    height: 8px;
    left: 122px;
    position: absolute;
    border-radius: 2px;
    background: #ffffff;
  }

  .order .truck .light.top {
    top: 4px;
  }
  .order .truck .light.bottom {
    bottom: 4px;
  }

  .order .truck .light:before {
    content: "";
    height: 4px;
    width: 7px;
    opacity: 0;
    position: absolute;
    transform: perspective(2px) rotateY(-15deg) scaleX(0.94);
    left: 3px;
    top: 50%;
    margin-top: -2px;
    background: linear-gradient(
      90deg,
      #ffffff,
      rgba(255, 255, 255, 0.7),
      rgba(240, 220, 95, 0)
    );
  }

  /* Checked state animation triggers */
  #order-toggle:checked + .order {
    pointer-events: none;
  }
  #order-toggle:checked + .order .default {
    --o: 0;
    transition-delay: 0s;
  }
  #order-toggle:checked + .order .success {
    --offset: 0;
    --o: 1;
    transition-delay: 3.5s;
  }
  #order-toggle:checked + .order .success svg {
    transition-delay: 3.8s;
  }
  #order-toggle:checked + .order .truck {
    animation: truck 5s ease forwards;
  }
  #order-toggle:checked + .order .truck:before {
    animation: door1 1.2s ease forwards 0.3s;
  }
  #order-toggle:checked + .order .truck:after {
    animation: door2 1.2s ease forwards 0.6s;
  }
  #order-toggle:checked + .order .truck .light:before {
    animation:
      light 5s ease forwards,
      headlight-pulse 1.5s ease-in-out infinite;
  }

  #order-toggle:checked + .order .lines {
    animation: lines 5s ease forwards;
  }

  /* Animations */
  @keyframes truck {
    10%,
    30% {
      transform: translateX(-164px);
    }
    40% {
      transform: translateX(-104px);
    }
    60% {
      transform: translateX(-224px);
    }
    75%,
    100% {
      transform: translateX(24px);
    }
  }
  @keyframes lines {
    0%,
    30% {
      opacity: 0;
      transform: scaleY(0.7) translateX(0);
    }
    35%,
    65% {
      opacity: 1;
    }
    70% {
      opacity: 0;
    }
    100% {
      transform: scaleY(0.7) translateX(-400px);
    }
  }
  @keyframes light {
    0%,
    30% {
      opacity: 0;
      transform: perspective(2px) rotateY(-15deg) scaleX(0.88);
    }
    40%,
    100% {
      opacity: 1;
      transform: perspective(2px) rotateY(-15deg) scaleX(0.94);
    }
  }

  /* New: Headlight Pulse */
  @keyframes headlight-pulse {
    0%,
    100% {
      opacity: 0;
      box-shadow: none;
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 10px 3px rgba(255, 255, 200, 0.7);
    }
  }

  .order[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .order[aria-disabled='true']:hover {
    transform: none;
  }
`;

export default Button;
