import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  openPreferences,
  startAccessibleSketch,
  startSketch,
  stopSketch
} from '../../actions/ide';
import {
  setAutorefresh,
  setGridOutput,
  setTextOutput
} from '../../actions/preferences';
import { changeVisibility } from '../../actions/project';
import PlayIcon from '../../../../images/play.svg';
import StopIcon from '../../../../images/stop.svg';
import PreferencesIcon from '../../../../images/preferences.svg';
import ProjectName from './ProjectName';
import VersionIndicator from '../VersionIndicator';

const Toolbar = (props) => {
  const { isPlaying, infiniteLoop, preferencesIsVisible } = useSelector(
    (state) => state.ide
  );
  const project = useSelector((state) => state.project);
  const user = useSelector((state) => state.user);
  const autorefresh = useSelector((state) => state.preferences.autorefresh);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userIsOwner = user?.username === project.owner?.username;
  const [isPrivate, setIsPrivate] = useState(project.visibility === 'Private');
  useEffect(() => {
    setIsPrivate(project.visibility === 'Private');
  }, [project]);

  const showPrivacyToggle = project?.owner && userIsOwner;
  const showOwner = project?.owner && !userIsOwner;

  const toggleVisibility = (e) => {
    try {
      const isChecked = e.target.checked;
      const newVisibility = isChecked ? 'Private' : 'Public';
      setIsPrivate(isChecked);
      dispatch(changeVisibility(project.id, project.name, newVisibility));
    } catch (error) {
      console.log(error);
      setIsPrivate(project.visibility === 'Private');
    }
  };

  const playButtonClass = classNames({
    'toolbar__play-button': true,
    'toolbar__play-button--selected': isPlaying
  });
  const stopButtonClass = classNames({
    'toolbar__stop-button': true,
    'toolbar__stop-button--selected': !isPlaying
  });
  const preferencesButtonClass = classNames({
    'toolbar__preferences-button': true,
    'toolbar__preferences-button--selected': preferencesIsVisible
  });

  return (
    <div className="toolbar">
      <button
        className="toolbar__play-sketch-button"
        onClick={() => {
          props.syncFileContent();
          dispatch(startAccessibleSketch());
          dispatch(setTextOutput(true));
          dispatch(setGridOutput(true));
        }}
        aria-label={t('Toolbar.PlaySketchARIA')}
        disabled={infiniteLoop}
      >
        <PlayIcon focusable="false" aria-hidden="true" />
      </button>
      <button
        className={playButtonClass}
        id="play-sketch"
        onClick={() => {
          props.syncFileContent();
          dispatch(startSketch());
        }}
        aria-label={t('Toolbar.PlayOnlyVisualSketchARIA')}
        title={t('Toolbar.PlaySketchARIA')}
        disabled={infiniteLoop}
      >
        <PlayIcon focusable="false" aria-hidden="true" />
      </button>
      <button
        className={stopButtonClass}
        onClick={() => dispatch(stopSketch())}
        aria-label={t('Toolbar.StopSketchARIA')}
        title={t('Toolbar.StopSketchARIA')}
      >
        <StopIcon focusable="false" aria-hidden="true" />
      </button>
      <div className="toolbar__autorefresh">
        <input
          id="autorefresh"
          className="checkbox__autorefresh"
          type="checkbox"
          checked={autorefresh}
          onChange={(event) => {
            dispatch(setAutorefresh(event.target.checked));
            if (event.target.checked) {
              dispatch(startSketch());
            }
          }}
        />
        <label htmlFor="autorefresh" className="toolbar__autorefresh-label">
          {t('Toolbar.Auto-refresh')}
        </label>
      </div>
      <div className="toolbar__project-name-container">
        <ProjectName />
        {showPrivacyToggle && (
          <main className="toolbar__makeprivate">
            <p>Private</p>
            <input
              type="checkbox"
              className="toolbar__togglevisibility"
              checked={isPrivate}
              onChange={toggleVisibility}
            />
          </main>
        )}
        {showOwner && (
          <p className="toolbar__project-owner">
            {t('Toolbar.By')}{' '}
            <Link to={`/${project.owner.username}/sketches`}>
              {project.owner.username}
            </Link>
          </p>
        )}
        <VersionIndicator />
      </div>
      <div style={{ flex: 1 }} />
      <button
        className={preferencesButtonClass}
        onClick={() => dispatch(openPreferences())}
        aria-label={t('Toolbar.OpenPreferencesARIA')}
        title={t('Toolbar.OpenPreferencesARIA')}
      >
        <PreferencesIcon focusable="false" aria-hidden="true" />
      </button>
    </div>
  );
};

Toolbar.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default Toolbar;
