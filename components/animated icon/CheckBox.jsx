import React from 'react';
import styled from 'styled-components';

const Checkbox = ({ checked, onChange, label }) => {
  return (
    <StyledWrapper>
      <label className="custom-checkbox">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange} 
        />
        <span className="checkmark" />
        {label && <span className="label-text">{label}</span>}
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .custom-checkbox {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    font-size: 16px;
    color: #333;
    transition: color 0.3s;
  }

  .custom-checkbox input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .custom-checkbox .checkmark {
    width: 15px;
    height: 15px;
    border: 2px solid #333;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    transition: background-color 0.3s, border-color 0.3s, transform 0.3s;
    transform-style: preserve-3d;
  }

  .custom-checkbox .checkmark::before {
    content: "\\2713";
    font-size: 16px;
    color: transparent;
    transition: color 0.3s, transform 0.3s;
  }

  .custom-checkbox input[type="checkbox"]:checked + .checkmark {
    background-color: #333;
    border-color: #333;
    transform: scale(1.1) rotateZ(360deg) rotateY(360deg);
  }

  .custom-checkbox input[type="checkbox"]:checked + .checkmark::before {
    color: #fff;
  }

  .custom-checkbox:hover {
    color: #666;
  }

  .custom-checkbox:hover .checkmark {
    border-color: #666;
    background-color: #f0f0f0;
    transform: scale(1.05);
  }

  .custom-checkbox input[type="checkbox"]:focus + .checkmark {
    box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.2);
    outline: none;
  }

  .custom-checkbox .label-text {
    font-size: 14px;
    color: #333;
  }
`;

export default Checkbox;
