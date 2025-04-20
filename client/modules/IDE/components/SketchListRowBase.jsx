import PropTypes from 'prop-types';
import slugify from 'slugify';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ProjectActions from '../actions/project';
import * as IdeActions from '../actions/ide';
import TableDropdown from '../../../components/Dropdown/TableDropdown';
import MenuItem from '../../../components/Dropdown/MenuItem';
import dates from '../../../utils/formatDate';
import getConfig from '../../../utils/getConfig';

const ROOT_URL = getConfig('API_URL');

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

const SketchListRowBase = ({
  sketch,
  username,
  user,
  changeProjectName,
  cloneProject,
  deleteProject,
  showShareModal,
  changeVisibility,
  t,
  mobile,
  onAddToCollection
}) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(sketch.name);
  const renameInput = useRef(null);

  useEffect(() => {
    if (renameOpen && renameInput.current) {
      renameInput.current.focus();
    }
  }, [renameOpen]);

  const openRename = useCallback(() => {
    setRenameOpen(true);
    setRenameValue(sketch.name);
  }, [sketch.name]);

  const closeRename = () => setRenameOpen(false);

  const updateName = useCallback(() => {
    if (renameValue.trim().length > 0) {
      changeProjectName(sketch.id, renameValue.trim());
    }
  }, [renameValue, sketch.id, changeProjectName]);

  const handleRenameChange = (e) => setRenameValue(e.target.value);

  const handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateName();
      closeRename();
    }
  };

  const handleRenameBlur = () => {
    updateName();
    closeRename();
  };

  const handleSketchDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = `${ROOT_URL}/projects/${sketch.id}/zip`;
    downloadLink.download = `${sketch.name}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSketchDuplicate = () => cloneProject(sketch);

  // const handleSketchShare = () => {
  //   showShareModal(sketch.id, sketch.name, username);
  // };

  const handleSketchDelete = () => {
    if (window.confirm(t('Common.DeleteConfirmation', { name: sketch.name }))) {
      deleteProject(sketch.id);
    }
  };

  const handleToggleVisibilityChange = (e) => {
    const isChecked = e.target.checked;
    const newVisibility = isChecked ? 'Private' : 'Public';
    changeVisibility(sketch.id, sketch.name, newVisibility);
  };

  const renderToggleVisibility = () => (
    <div>
      <input
        checked={sketch.visibility === 'Private'}
        type="checkbox"
        className="visibility__toggle-checkbox"
        id={`toggle-${sketch.id}`}
        onChange={handleToggleVisibilityChange}
      />
      <label
        htmlFor={`toggle-${sketch.id}`}
        className="visibility__toggle-label"
      >
        <svg
          width="8"
          height="11"
          viewBox="0 0 8 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="lock"
        >
          <path
            d="M8 5.68627V10.0784C8 10.5882 7.54067 11 7.00478 11H0.995215C0.440191 11 0 10.5686 0 10.0784V5.68627C0 5.17647 0.440191 4.7451 0.995215 4.7451C1.09035 4.7451 1.16746 4.66798 1.16746 4.57285V2.90196C1.16746 1.29412 2.43062 0 3.98086 0C5.55024 0 6.8134 1.29412 6.8134 2.90196V4.55371C6.8134 4.65941 6.89908 4.7451 7.00478 4.7451C7.54067 4.7451 8 5.15686 8 5.68627ZM2.33716 3.11732C2.34653 4.01904 3.08017 4.7451 3.98194 4.7451C4.89037 4.7451 5.62679 4.00867 5.62679 3.10024V2.90196C5.62679 1.96078 4.89952 1.21569 3.98086 1.21569C3.10048 1.21569 2.33493 1.96078 2.33493 2.90196L2.33716 3.11732Z"
            fill="white"
            fillOpacity="0.4"
          />
        </svg>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="earth"
        >
          <path
            d="M10 5C10 5.42308 9.96154 5.80769 9.86539 6.15385C9.32692 8.34615 7.34615 10 5 10C2.57692 10 0.538462 8.25 0.0961538 5.96154C0.0384615 5.65385 0 5.34615 0 5V4.98077C0 4.84615 7.26432e-08 4.73077 0.0192308 4.63461C0.125111 3.25818 0.781552 2.01128 1.78053 1.1614C1.91355 1.04823 2.15362 1.13705 2.32692 1.11538C2.67308 1.03846 2.90385 0.788462 3.07692 0.846154C3.26923 0.903846 3.42308 1.11538 3.19231 1.26923C2.94231 1.40385 2.88462 1.63462 3.01923 1.75C3.15385 1.86538 3.34615 1.63462 3.61538 1.63462C3.88462 1.63462 4.21154 1.96154 4.19231 2.21154C4.15385 2.55769 4.15385 3 4.30769 3.28846C4.46154 3.57692 4.80769 4.01923 5.23077 4.13462C5.61539 4.23077 6.26923 4.32692 6.34615 4.34615C6.63419 4.45588 6.57131 4.6983 6.33349 4.89437C6.21892 4.98883 6.11852 5.09107 6.09615 5.17308C5.86539 5.88462 6.84615 6.11538 6.67308 6.59615C6.55769 6.94231 6.17308 7.28846 6.03846 7.63462C5.95671 7.84484 5.9246 8.14727 5.98523 8.37391C6.02693 8.52981 6.28488 8.43597 6.40385 8.32692C6.63462 8.13462 7.11539 7.44231 7.44231 7.21154C7.78846 6.98077 8.57692 6.78846 8.82692 6.01923C8.96154 5.59615 8.94231 5.21154 8.36539 4.88462C7.78846 4.55769 8.17308 4.15385 7.67308 4.15385C7.17308 4.15385 7.15385 4.34615 6.78846 4.21154C5.53846 3.71154 5.90385 3.23077 6.21154 3.21154C6.34615 3.19231 6.48077 3.25 6.65385 3.32692C6.82692 3.42308 6.88462 3.32692 6.84615 3.05769C6.80769 2.78846 6.86539 2.42308 7 1.98077C7.21154 1.26923 6.80769 0.634615 6.19231 0.557692C5.61539 0.442308 5.57692 0.653846 5.19231 1.07692C4.90385 1.40385 4.34615 1.13462 3.88462 0.807692C3.61454 0.611276 3.90971 0.105968 4.2399 0.0560849C4.48198 0.019514 4.72894 0 4.98077 0C7.69649 0 9.91771 2.18723 9.97993 4.91613C9.9806 4.94511 10 4.97101 10 5Z"
            fill="#929292"
          />
        </svg>
      </label>
    </div>
  );

  const userIsOwner = user.username === username;

  let url = `/${username}/sketches/${sketch.id}`;
  if (username === 'p5') {
    url = `/${username}/sketches/${slugify(sketch.name, '_')}`;
  }

  const name = (
    <>
      <Link to={url}>{renameOpen ? '' : sketch.name}</Link>
      {renameOpen && (
        <input
          value={renameValue}
          onChange={handleRenameChange}
          onKeyDown={handleRenameEnter}
          onBlur={handleRenameBlur}
          onClick={(e) => e.stopPropagation()}
          ref={renameInput}
          maxLength={128}
        />
      )}
    </>
  );

  return (
    <tr className="sketches-table__row">
      <th scope="row">{name}</th>
      <td>{formatDateCell(sketch.createdAt, mobile)}</td>
      <td>{formatDateCell(sketch.updatedAt, mobile)}</td>
      <td hidden={!userIsOwner}>{renderToggleVisibility()}</td>
      <td className="sketch-list__dropdown-column">
        <TableDropdown aria-label={t('SketchList.ToggleLabelARIA')}>
          <MenuItem hideIf={!userIsOwner} onClick={openRename}>
            {t('SketchList.DropdownRename')}
          </MenuItem>
          <MenuItem onClick={handleSketchDownload}>
            {t('SketchList.DropdownDownload')}
          </MenuItem>
          <MenuItem
            hideIf={!user.authenticated}
            onClick={handleSketchDuplicate}
          >
            {t('SketchList.DropdownDuplicate')}
          </MenuItem>
          <MenuItem hideIf={!user.authenticated} onClick={onAddToCollection}>
            {t('SketchList.DropdownAddToCollection')}
          </MenuItem>
          {/* <MenuItem onClick={handleSketchShare}>
            {t('SketchList.DropdownShare')}
          </MenuItem> */}
          <MenuItem hideIf={!userIsOwner} onClick={handleSketchDelete}>
            {t('SketchList.DropdownDelete')}
          </MenuItem>
        </TableDropdown>
      </td>
    </tr>
  );
};

SketchListRowBase.propTypes = {
  sketch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    visibility: PropTypes.string
  }).isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteProject: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  changeVisibility: PropTypes.func.isRequired,
  onAddToCollection: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

SketchListRowBase.defaultProps = {
  mobile: false
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign({}, ProjectActions, IdeActions),
    dispatch
  );
}

export default connect(
  null,
  mapDispatchToPropsSketchListRow
)(SketchListRowBase);
