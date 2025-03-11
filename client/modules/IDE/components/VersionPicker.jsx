import React, { useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useP5Version, p5Versions } from '../hooks/useP5Version';
import MenuItem from '../../../components/Dropdown/MenuItem';
import DropdownMenu from '../../../components/Dropdown/DropdownMenu';
import { updateFileContent } from '../actions/files';
import { CmControllerContext } from '../pages/IDEView';

const VersionPicker = React.forwardRef(({ onChangeVersion }, ref) => {
  const { indexID, versionInfo } = useP5Version();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cmRef = useContext(CmControllerContext);
  const dispatchReplaceVersion = useCallback(
    (version) => {
      if (!indexID || !versionInfo) return;
      if (onChangeVersion) {
        onChangeVersion(version);
      }
      const src = versionInfo.replaceVersion(version);
      dispatch(updateFileContent(indexID, src));
      cmRef.current?.updateFileContent(indexID, src);
    },
    [indexID, versionInfo, cmRef, onChangeVersion]
  );

  if (!versionInfo) {
    return (
      <span className="versionPicker">{t('Toolbar.CustomLibraryVersion')}</span>
    );
  }

  return (
    <DropdownMenu
      anchor={
        <span className="versionPicker" ref={ref}>
          {versionInfo.version}
        </span>
      }
      align="left"
    >
      {p5Versions.map((version) => (
        <MenuItem key={version} onClick={() => dispatchReplaceVersion(version)}>
          {version}
        </MenuItem>
      ))}
    </DropdownMenu>
  );
});

VersionPicker.propTypes = {
  onChangeVersion: PropTypes.func
};
VersionPicker.defaultProps = {
  onChangeVersion: undefined
};

export default VersionPicker;
