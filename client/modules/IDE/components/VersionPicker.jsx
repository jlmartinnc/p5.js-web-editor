import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useP5Version, p5Versions } from '../hooks/useP5Version';
import MenuItem from '../../../components/Dropdown/MenuItem';
import DropdownMenu from '../../../components/Dropdown/DropdownMenu';
import { updateFileContent } from '../actions/files';

const VersionPicker = () => {
  const { indexID, versionInfo } = useP5Version();
  const dispatch = useDispatch();
  const dispatchReplaceVersion = useCallback(
    (version) => {
      if (!indexID || !versionInfo) return;
      dispatch(updateFileContent(indexID, versionInfo.replaceVersion(version)));
    },
    [indexID, versionInfo]
  );

  if (!versionInfo) {
    return <p>Custom</p>;
  }

  return (
    <DropdownMenu anchor={<span>Version</span>} align="left">
      {p5Versions.map((version) => (
        <MenuItem key={version} onClick={() => dispatchReplaceVersion(version)}>
          {version}
        </MenuItem>
      ))}
    </DropdownMenu>
  );
};

VersionPicker.popTypes = {};

export default VersionPicker;
