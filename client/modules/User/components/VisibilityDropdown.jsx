import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import LockIcon from '../../../images/lock.svg';
import EarthIcon from '../../../images/earth.svg';
import DownArrowIcon from '../../../images/down-filled-triangle.svg';
import CheckmarkIcon from '../../../images/checkmark.svg';

const VisibilityDropdown = ({ sketch, onVisibilityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const visibilityOptions = [
    {
      value: 'Public',
      label: 'Public',
      icon: <EarthIcon className="visibility-icon" />, 
      description: 'Anyone can see this sketch'
    },
    {
      value: 'Private',
      label: 'Private',
      icon: <LockIcon className="visibility-icon" />, 
      description: 'Only you can see this sketch'
    }
  ];

  const currentVisibility =
    visibilityOptions.find((option) => option.value === sketch.visibility) ||
    visibilityOptions[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVisibilitySelect = (newVisibility) => {
    if (newVisibility !== sketch.visibility) {
      onVisibilityChange(sketch.id, sketch.name, newVisibility);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (event, visibility) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleVisibilitySelect(visibility);
    }
  };

  return (
    <div className="visibility-dropdown" ref={dropdownRef}>
      <button
        className="visibility-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Change visibility. Currently ${currentVisibility.label}`}
      >
        {currentVisibility.icon}
        <span className="visibility-label">{currentVisibility.label}</span>
        <DownArrowIcon focusable="false" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="visibility-dropdown__menu">
          {visibilityOptions.map((option) => (
            <div
              key={option.value}
              className={`visibility-dropdown__option ${
                option.value === sketch.visibility ? 'selected' : ''
              }`}
              onClick={() => handleVisibilitySelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              role="button"
              tabIndex={0}
            >
              <div className="visibility-option__main">
                {option.icon}
                <span className="visibility-option__label">{option.label}</span>
                {option.value === sketch.visibility && (
                  <CheckmarkIcon focusable="false" aria-hidden="true" />
                )}
              </div>
              <div className="visibility-option__description">
                {option.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

VisibilityDropdown.propTypes = {
  sketch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    visibility: PropTypes.string.isRequired
  }).isRequired,
  onVisibilityChange: PropTypes.func.isRequired
};

export default VisibilityDropdown;
