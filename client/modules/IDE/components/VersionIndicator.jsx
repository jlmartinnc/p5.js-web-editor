import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { openPreferences } from '../actions/ide';
import { setPreferencesTab } from '../actions/preferences';
import { prop } from '../../../theme';
import EditIcon from '../../../images/pencil.svg';

import { useP5Version } from '../hooks/useP5Version';

const VersionPickerButton = styled.button`
  color: ${prop('Button.primary.default.foreground')};

  &:hover {
    color: ${prop('Button.primary.hover.background')} !important;
  }

  & svg {
    vertical-align: middle;
    margin-bottom: 2px;
  }

  &:hover path {
    fill: currentColor !important;
  }
`;

const VersionIndicator = () => {
  const { versionInfo } = useP5Version();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openVersionSettings = useCallback(() => {
    dispatch(openPreferences());
    dispatch(setPreferencesTab(2));
  }, []);

  return (
    <VersionPickerButton onClick={openVersionSettings}>
      {t('Toolbar.LibraryVersion')}
      &nbsp;
      {versionInfo?.version || t('Toolbar.CustomLibraryVersion')}
      <EditIcon
        className="editable-input__icon"
        focusable="false"
        aria-hidden="true"
      />
    </VersionPickerButton>
  );
};

VersionIndicator.propTypes = {};

export default VersionIndicator;
