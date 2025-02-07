import React from 'react';
import { useP5Version } from '../hooks/useP5Version';

const VersionPicker = () => {
  const versionInfo = useP5Version();

  return <p>{versionInfo?.version || 'custom'}</p>;
};

VersionPicker.popTypes = {};

export default VersionPicker;
