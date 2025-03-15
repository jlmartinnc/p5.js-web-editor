import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export default function Admonition({ children }) {
  const { t } = useTranslation();
  return (
    <div className="admonition">
      <h3 className="admonition__title">
        <span role="img" aria-label="Flower" className="admonition__icon">
          🌸
        </span>
        {t('Admonition.Note')}
      </h3>
      {children}
    </div>
  );
}

Admonition.propTypes = {
  children: PropTypes.node
};

Admonition.defaultProps = {
  children: undefined
};
