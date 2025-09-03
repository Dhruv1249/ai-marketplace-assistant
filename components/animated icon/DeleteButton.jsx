import React from 'react';
import styled from 'styled-components';

const DeleteButton = ({ onClick }) => {
  return (
    <StyledWrapper>
      <button 
        aria-label="Delete item" 
        className="delete-button"
        onClick={onClick}
      >
        <svg className="trash-svg" viewBox="0 -10 64 74" xmlns="http://www.w3.org/2000/svg">
          <g id="trash-can">
            <rect x={16} y={24} width={32} height={30} rx={3} ry={3} fill="#e74c3c" />
            <g transformfromorigin="12 18" id="lid-group">
              <rect x={12} y={12} width={40} height={6} rx={2} ry={2} fill="#c0392b" />
              <rect x={26} y={8} width={12} height={4} rx={2} ry={2} fill="#c0392b" />
            </g>
          </g>
        </svg>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .delete-button {
    position: relative;
    padding: 0.5em;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1em;
    transition: transform 0.2s ease;
  }

  .trash-svg {
  width: 30px;   /* smaller */
  height: 30px;  /* smaller */
  fill: none;
}

  #lid-group {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .delete-button:hover #lid-group {
    transform: rotate(-28deg) translateY(2px);
  }

  .delete-button:active #lid-group {
    transform: rotate(-10deg) scale(0.98);
  }

  .delete-button:hover .trash-svg {
    transform: scale(1.08) rotate(3deg);
  }

  .delete-button:active .trash-svg {
    transform: scale(0.96) rotate(-1deg);
  }
`;

export default DeleteButton;
