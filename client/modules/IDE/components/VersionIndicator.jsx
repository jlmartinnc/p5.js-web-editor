import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { openPreferences } from '../actions/ide';
import { setPreferencesTab } from '../actions/preferences';

import { useP5Version } from '../hooks/useP5Version';

const VersionIndicator = () => {
  const { versionInfo } = useP5Version();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openVersionSettings = useCallback(() => {
    dispatch(openPreferences());
    dispatch(setPreferencesTab(2));
  }, []);

  return (
    <button onClick={openVersionSettings}>
      {t('Toolbar.LibraryVersion')}
      &nbsp;
      {versionInfo?.version || t('Toolbar.CustomLibraryVersion')}
    </button>
  );
};

VersionIndicator.propTypes = {};

export default VersionIndicator;
