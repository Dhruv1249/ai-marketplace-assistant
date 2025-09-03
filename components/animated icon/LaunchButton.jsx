import React from "react";
import styled from "styled-components";
import { Loader2 } from "lucide-react";

const LaunchButton = ({ children, disabled, ...props }) => {
  return (
    <StyledWrapper>
      <button className="button" disabled={disabled} {...props}>
        {disabled ? (
          <Loader2 className="animate-spin mr-1" size={14} />
        ) : (
          children
        )}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* inspired from gumroad website */
  .button {
    --bg: #000;
    --hover-bg: #ff90e8;
    --hover-text: #000;
    color: #fff;
    cursor: pointer;
    border: 1px solid var(--bg);
    border-radius: 4px;
    padding: 0.3em 1.1em;
    font-size: 0.85rem;
    font-weight: 500;
    background: var(--bg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    transition: 0.2s;
  }

  .button:hover:not(:disabled) {
    color: var(--hover-text);
    transform: translate(-0.25rem, -0.25rem);
    background: var(--hover-bg);
    box-shadow: 0.25rem 0.25rem var(--bg);
  }

  .button:active:not(:disabled) {
    transform: translate(0);
    box-shadow: none;
  }

  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default LaunchButton;
