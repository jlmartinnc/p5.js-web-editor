import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { openPreferences } from '../actions/ide';
import { setPreferencesTab } from '../actions/preferences';
import { prop } from '../../../theme';
import EditIcon from '../../../images/preferences.svg';

import { useP5Version } from '../hooks/useP5Version';

const VersionPickerButton = styled.button`
  color: ${prop('Button.primary.default.foreground')};

  &:hover {
    color: ${prop('Button.primary.hover.background')} !important;
  }

  & svg {
    vertical-align: middle;
    margin-bottom: 2px;
    margin-left: 0.5rem;
    width: 1rem;
    height: 1rem;
  }

  &:hover path {
    fill: currentColor !important;
  }
`;

const NotificationDot = styled.div`
  display: inline-block;
  vertical-align: top;
  border-radius: 50%;
  width: 0.7rem;
  height: 0.7rem;
  background-color: ${prop('colors.dodgerblue')};
  margin-left: 0.25rem;
`;

const CLICKED_LIBRARY_VERSION_KEY = 'clickedLibraryVersionIndicator';

const VersionIndicator = () => {
  const { versionInfo } = useP5Version();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showNotificationDot, setShowNotificationDot] = useState(false);

  useEffect(() => {
    const hasHiddenDot = window.localStorage.getItem(
      CLICKED_LIBRARY_VERSION_KEY
    );
    setShowNotificationDot(!hasHiddenDot);
  }, []);

  const openVersionSettings = useCallback(() => {
    dispatch(openPreferences());
    dispatch(setPreferencesTab(2));
    setShowNotificationDot(false);
    window.localStorage.setItem(CLICKED_LIBRARY_VERSION_KEY, true);
  }, []);

  const label = t('Toolbar.LibraryVersion');
  const currentVersion =
    versionInfo?.version || t('Toolbar.CustomLibraryVersion');
  const description = t(
    showNotificationDot
      ? 'Toolbar.NewVersionPickerARIA'
      : 'Toolbar.VersionPickerARIA'
  );
  const ariaLabel = `${label}: ${currentVersion} - ${description}`;

  return (
    <VersionPickerButton onClick={openVersionSettings} ariaLabel={ariaLabel}>
      {label}:&nbsp;
      {currentVersion}
      {showNotificationDot && <NotificationDot />}
      <EditIcon focusable="false" aria-hidden="true" />
    </VersionPickerButton>
  );
};

VersionIndicator.propTypes = {};

export default VersionIndicator;
