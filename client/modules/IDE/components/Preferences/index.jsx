import React, { useContext, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import PlusIcon from '../../../../images/plus.svg';
import MinusIcon from '../../../../images/minus.svg';
import beepUrl from '../../../../sounds/audioAlert.mp3';
import {
  setTheme,
  setAutosave,
  setTextOutput,
  setGridOutput,
  setFontSize,
  setLineNumbers,
  setLintWarning,
  setAutocloseBracketsQuotes,
  setAutocompleteHinter,
  setLinewrap,
  setPreferencesTab
} from '../../actions/preferences';
import { p5SoundURL, p5URL, useP5Version } from '../../hooks/useP5Version';
import VersionPicker from '../VersionPicker';
import { updateFileContent } from '../../actions/files';
import { CmControllerContext } from '../../pages/IDEView';
import Stars from '../Stars';
import Admonition from '../Admonition';
import TextArea from '../TextArea';

export default function Preferences() {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const {
    tabIndex,
    fontSize,
    autosave,
    wordwrap,
    lineNumbers,
    lintWarning,
    textOutput,
    gridOutput,
    theme,
    autocloseBracketsQuotes,
    autocompleteHinter
  } = useSelector((state) => state.preferences);

  const [state, setState] = useState({ fontSize });
  const { versionInfo, indexID } = useP5Version();
  const cmRef = useContext(CmControllerContext);
  const [showStars, setShowStars] = useState(null);
  const timerRef = useRef(null);
  const pickerRef = useRef(null);
  const onChangeVersion = (version) => {
    const shouldShowStars = version.startsWith('2.');
    const box = pickerRef.current?.getBoundingClientRect();
    if (shouldShowStars) {
      setShowStars({ left: box?.left || 0, top: box?.top || 0 });
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowStars(null), 3000);
    }
  };

  function onFontInputChange(event) {
    const INTEGER_REGEX = /^[0-9\b]+$/;
    if (event.target.value === '' || INTEGER_REGEX.test(event.target.value)) {
      setState({
        fontSize: event.target.value
      });
    }
  }

  function handleFontSize(value) {
    setState({ fontSize: value });
    dispatch(setFontSize(value));
  }

  function onFontInputSubmit(event) {
    event.preventDefault();
    let value = parseInt(state.fontSize, 10);
    if (Number.isNaN(value)) {
      value = 16;
    }
    if (value > 36) {
      value = 36;
    }
    if (value < 8) {
      value = 8;
    }
    handleFontSize(value);
  }

  function decreaseFontSize() {
    const newValue = Number(state.fontSize) - 2;
    handleFontSize(newValue);
  }

  function increaseFontSize() {
    const newValue = Number(state.fontSize) + 2;
    handleFontSize(newValue);
  }

  function changeTab(index) {
    dispatch(setPreferencesTab(index));
  }

  const fontSizeInputRef = useRef(null);

  const updateHTML = (src) => {
    dispatch(updateFileContent(indexID, src));
    cmRef.current?.updateFileContent(indexID, src);
  };

  const markdownComponents = useMemo(() => {
    const ExternalLink = ({ children, ...props }) => (
      <a {...props} target="_blank">
        {children}
      </a>
    );
    ExternalLink.propTypes = {
      children: PropTypes.node
    };
    ExternalLink.defaultProps = {
      children: undefined
    };

    const Paragraph = ({ children, ...props }) => (
      <p className="preference__paragraph" {...props}>
        {children}
      </p>
    );
    Paragraph.propTypes = {
      children: PropTypes.node
    };
    Paragraph.defaultProps = {
      children: undefined
    };

    return {
      a: ExternalLink,
      p: Paragraph
    };
  }, []);

  return (
    <section className="preferences">
      <Helmet>
        <title>p5.js Web Editor | Preferences</title>
      </Helmet>
      <Tabs selectedIndex={tabIndex} onSelect={changeTab}>
        <TabList>
          <div className="tabs__titles">
            <Tab>
              <h4 className="tabs__title">
                {t('Preferences.GeneralSettings')}
              </h4>
            </Tab>
            <Tab>
              <h4 className="tabs__title">{t('Preferences.Accessibility')}</h4>
            </Tab>
            <Tab>
              <h4 className="tabs__title">
                {t('Preferences.LibraryManagement')}
              </h4>
            </Tab>
          </div>
        </TabList>
        <TabPanel>
          <div className="preference">
            <h4 className="preference__title">{t('Preferences.Theme')}</h4>
            <fieldset className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setTheme('light'))}
                aria-label={t('Preferences.LightThemeARIA')}
                name="light theme"
                id="light-theme-on"
                className="preference__radio-button"
                value="light"
                checked={theme === 'light'}
              />
              <label htmlFor="light-theme-on" className="preference__option">
                {t('Preferences.LightTheme')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setTheme('dark'))}
                aria-label={t('Preferences.DarkThemeARIA')}
                name="dark theme"
                id="dark-theme-on"
                className="preference__radio-button"
                value="dark"
                checked={theme === 'dark'}
              />
              <label htmlFor="dark-theme-on" className="preference__option">
                {t('Preferences.DarkTheme')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setTheme('contrast'))}
                aria-label={t('Preferences.HighContrastThemeARIA')}
                name="high contrast theme"
                id="high-contrast-theme-on"
                className="preference__radio-button"
                value="contrast"
                checked={theme === 'contrast'}
              />
              <label
                htmlFor="high-contrast-theme-on"
                className="preference__option"
              >
                {t('Preferences.HighContrastTheme')}
              </label>
            </fieldset>
          </div>
          <div className="preference">
            <h4 className="preference__title">{t('Preferences.TextSize')}</h4>
            <button
              className="preference__minus-button"
              onClick={decreaseFontSize}
              aria-label={t('Preferences.DecreaseFontARIA')}
              title={t('Preferences.DecreaseFontARIA')}
              disabled={fontSize <= 8}
            >
              <MinusIcon focusable="false" aria-hidden="true" />
              <h6 className="preference__label">
                {t('Preferences.DecreaseFont')}
              </h6>
            </button>
            <form
              onSubmit={onFontInputSubmit}
              aria-label={t('Preferences.SetFontSize')}
            >
              <label htmlFor="font-size-value" className="preference--hidden">
                {t('Preferences.FontSize')}
              </label>
              <input
                className="preference__value"
                aria-live="polite"
                aria-atomic="true"
                value={state.fontSize}
                id="font-size-value"
                onChange={onFontInputChange}
                type="text"
                ref={fontSizeInputRef}
                onClick={() => {
                  fontSizeInputRef.current?.select();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowUp') {
                    increaseFontSize();
                  } else if (event.key === 'ArrowDown') {
                    decreaseFontSize();
                  }
                }}
              />
            </form>
            <button
              className="preference__plus-button"
              onClick={increaseFontSize}
              aria-label={t('Preferences.IncreaseFontARIA')}
              title={t('Preferences.IncreaseFontARIA')}
              disabled={fontSize >= 36}
            >
              <PlusIcon focusable="false" aria-hidden="true" />
              <h6 className="preference__label">
                {t('Preferences.IncreaseFont')}
              </h6>
            </button>
          </div>
          <div className="preference">
            <h4 className="preference__title">{t('Preferences.Autosave')}</h4>
            <fieldset className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setAutosave(true))}
                aria-label={t('Preferences.AutosaveOnARIA')}
                name="autosave"
                id="autosave-on"
                className="preference__radio-button"
                value="On"
                checked={autosave}
              />
              <label htmlFor="autosave-on" className="preference__option">
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setAutosave(false))}
                aria-label={t('Preferences.AutosaveOffARIA')}
                name="autosave"
                id="autosave-off"
                className="preference__radio-button"
                value="Off"
                checked={!autosave}
              />
              <label htmlFor="autosave-off" className="preference__option">
                {t('Preferences.Off')}
              </label>
            </fieldset>
          </div>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.AutocloseBracketsQuotes')}
            </h4>
            <fieldset className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setAutocloseBracketsQuotes(true))}
                aria-label={t('Preferences.AutocloseBracketsQuotesOnARIA')}
                name="autoclosebracketsquotes"
                id="autoclosebracketsquotes-on"
                className="preference__radio-button"
                value="On"
                checked={autocloseBracketsQuotes}
              />
              <label
                htmlFor="autoclosebracketsquotes-on"
                className="preference__option"
              >
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setAutocloseBracketsQuotes(false))}
                aria-label={t('Preferences.AutocloseBracketsQuotesOffARIA')}
                name="autoclosebracketsquotes"
                id="autoclosebracketsquotes-off"
                className="preference__radio-button"
                value="Off"
                checked={!autocloseBracketsQuotes}
              />
              <label
                htmlFor="autoclosebracketsquotes-off"
                className="preference__option"
              >
                {t('Preferences.Off')}
              </label>
            </fieldset>
          </div>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.AutocompleteHinter')}
            </h4>
            <fieldset className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setAutocompleteHinter(true))}
                aria-label={t('Preferences.AutocompleteHinterOnARIA')}
                name="autocompletehinter"
                id="autocompletehinter-on"
                className="preference__radio-button"
                value="On"
                checked={autocompleteHinter}
              />
              <label
                htmlFor="autocompletehinter-on"
                className="preference__option"
              >
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setAutocompleteHinter(false))}
                aria-label={t('Preferences.AutocompleteHinterOffARIA')}
                name="autocompletehinter"
                id="autocompletehinter-off"
                className="preference__radio-button"
                value="Off"
                checked={!autocompleteHinter}
              />
              <label
                htmlFor="autocompletehinter-off"
                className="preference__option"
              >
                {t('Preferences.Off')}
              </label>
            </fieldset>
          </div>
          <div className="preference">
            <h4 className="preference__title">{t('Preferences.WordWrap')}</h4>
            <fieldset className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setLinewrap(true))}
                aria-label={t('Preferences.WordWrapOnARIA')}
                name="wordwrap"
                id="wordwrap-on"
                className="preference__radio-button"
                value="On"
                checked={wordwrap}
              />
              <label htmlFor="wordwrap-on" className="preference__option">
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setLinewrap(false))}
                aria-label={t('Preferences.WordWrapOffARIA')}
                name="wordwrap"
                id="wordwrap-off"
                className="preference__radio-button"
                value="Off"
                checked={!wordwrap}
              />
              <label htmlFor="wordwrap-off" className="preference__option">
                {t('Preferences.Off')}
              </label>
            </fieldset>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.LineNumbers')}
            </h4>
            <fieldset className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setLineNumbers(true))}
                aria-label={t('Preferences.LineNumbersOnARIA')}
                name="line numbers"
                id="line-numbers-on"
                className="preference__radio-button"
                value="On"
                checked={lineNumbers}
              />
              <label htmlFor="line-numbers-on" className="preference__option">
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setLineNumbers(false))}
                aria-label={t('Preferences.LineNumbersOffARIA')}
                name="line numbers"
                id="line-numbers-off"
                className="preference__radio-button"
                value="Off"
                checked={!lineNumbers}
              />
              <label htmlFor="line-numbers-off" className="preference__option">
                {t('Preferences.Off')}
              </label>
            </fieldset>
          </div>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.LintWarningSound')}
            </h4>
            <fieldset className="preference__options">
              <input
                type="radio"
                onChange={() => dispatch(setLintWarning(true))}
                aria-label={t('Preferences.LintWarningOnARIA')}
                name="lint warning"
                id="lint-warning-on"
                className="preference__radio-button"
                value="On"
                checked={lintWarning}
              />
              <label htmlFor="lint-warning-on" className="preference__option">
                {t('Preferences.On')}
              </label>
              <input
                type="radio"
                onChange={() => dispatch(setLintWarning(false))}
                aria-label={t('Preferences.LintWarningOffARIA')}
                name="lint warning"
                id="lint-warning-off"
                className="preference__radio-button"
                value="Off"
                checked={!lintWarning}
              />
              <label htmlFor="lint-warning-off" className="preference__option">
                {t('Preferences.Off')}
              </label>
              <button
                className="preference__preview-button"
                onClick={() => new Audio(beepUrl).play()}
                aria-label={t('Preferences.PreviewSoundARIA')}
              >
                {t('Preferences.PreviewSound')}
              </button>
            </fieldset>
          </div>
          <div className="preference">
            <h4 className="preference__title">
              {t('Preferences.AccessibleTextBasedCanvas')}
            </h4>
            <h6 className="preference__subtitle">
              {t('Preferences.UsedScreenReader')}
            </h6>

            <fieldset className="preference__options">
              <input
                type="checkbox"
                onChange={(event) => {
                  dispatch(setTextOutput(event.target.checked));
                }}
                aria-label={t('Preferences.TextOutputARIA')}
                name="text output"
                id="text-output-on"
                value="On"
                checked={textOutput}
              />
              <label
                htmlFor="text-output-on"
                className="preference__option preference__canvas"
              >
                {t('Preferences.PlainText')}
              </label>
              <input
                type="checkbox"
                onChange={(event) => {
                  dispatch(setGridOutput(event.target.checked));
                }}
                aria-label={t('Preferences.TableOutputARIA')}
                name="table output"
                id="table-output-on"
                value="On"
                checked={gridOutput}
              />
              <label
                htmlFor="table-output-on"
                className="preference__option preference__canvas"
              >
                {t('Preferences.TableText')}
              </label>
            </fieldset>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="preference">
            {showStars && <Stars top={showStars.top} left={showStars.left} />}
            {versionInfo && indexID ? (
              <>
                <h4 className="preference__title">
                  {t('Preferences.LibraryVersion')}
                </h4>
                <div>
                  <VersionPicker
                    ref={pickerRef}
                    onChangeVersion={onChangeVersion}
                  />
                  <ReactMarkdown components={markdownComponents}>
                    {t('Preferences.LibraryVersionInfo')}
                  </ReactMarkdown>
                </div>
              </>
            ) : (
              <div>
                <Admonition title={t('Preferences.CustomVersionTitle')}>
                  <p>{t('Preferences.CustomVersionInfo')}</p>
                </Admonition>
                <p className="preference__paragraph">
                  {t('Preferences.CustomVersionReset')}
                </p>
                <TextArea
                  className="preference__textarea"
                  src={
                    `<script src="${p5URL}"></script>\n` +
                    `<script src="${p5SoundURL}"></script>`
                  }
                />
              </div>
            )}
          </div>
          {versionInfo && indexID && (
            <>
              <div className="preference">
                <h4 className="preference__title">
                  {t('Preferences.SoundAddon')}
                </h4>
                <fieldset className="preference__options">
                  <input
                    type="radio"
                    onChange={() => {
                      if (versionInfo.lastP5SoundURL) {
                        // If the sketch previously used a nonstandard p5.sound
                        // URL, restore that URL
                        updateHTML(
                          versionInfo.setP5SoundURL(versionInfo.lastP5SoundURL)
                        );
                        versionInfo.setLastP5SoundURL(undefined);
                      } else {
                        // Otherwise, turn on the default p5.sound URL
                        updateHTML(versionInfo.setP5Sound(true));
                      }
                    }}
                    aria-label={`${t('Preferences.SoundAddon')} ${t(
                      'Preferences.AddonOn'
                    )}`}
                    name="soundaddon"
                    id="soundaddon-on"
                    className="preference__radio-button"
                    value="On"
                    checked={versionInfo.p5Sound}
                  />
                  <label htmlFor="soundaddon-on" className="preference__option">
                    {t('Preferences.On')}
                  </label>
                  <input
                    type="radio"
                    onChange={() => {
                      // If the previous p5.sound.js script tag is not the
                      // default version that one will get via this toggle,
                      // record it so we can give the option to put it back
                      if (versionInfo.p5SoundURL !== p5SoundURL) {
                        versionInfo.setLastP5SoundURL(versionInfo.p5SoundURL);
                      }
                      updateHTML(versionInfo.setP5Sound(false));
                    }}
                    aria-label={`${t('Preferences.SoundAddon')} ${t(
                      'Preferences.AddonOff'
                    )}`}
                    name="soundaddon"
                    id="soundaddon-off"
                    className="preference__radio-button"
                    value="Off"
                    checked={!versionInfo.p5Sound}
                  />
                  <label
                    htmlFor="soundaddon-off"
                    className="preference__option"
                  >
                    {t('Preferences.Off')}
                  </label>
                  {versionInfo.lastP5SoundURL && (
                    <legend className="preference__warning">
                      {t('Preferences.UndoSoundVersion')}
                    </legend>
                  )}
                </fieldset>
              </div>
              <div className="preference">
                <h4 className="preference__title">
                  {t('Preferences.PreloadAddon')}
                </h4>
                <fieldset className="preference__options">
                  <input
                    type="radio"
                    onChange={() =>
                      updateHTML(versionInfo.setP5PreloadAddon(true))
                    }
                    aria-label={`${t('Preferences.PreloadAddon')} ${t(
                      'Preferences.AddonOn'
                    )}`}
                    name="preloadaddon"
                    id="preloadaddon-on"
                    className="preference__radio-button"
                    value="On"
                    checked={versionInfo.p5PreloadAddon}
                  />
                  <label
                    htmlFor="preloadaddon-on"
                    className="preference__option"
                  >
                    {t('Preferences.On')}
                  </label>
                  <input
                    type="radio"
                    onChange={() =>
                      updateHTML(versionInfo.setP5PreloadAddon(false))
                    }
                    aria-label={`${t('Preferences.PreloadAddon')} ${t(
                      'Preferences.AddonOff'
                    )}`}
                    name="preloadaddon"
                    id="preloadaddon-off"
                    className="preference__radio-button"
                    value="Off"
                    checked={!versionInfo.p5PreloadAddon}
                  />
                  <label
                    htmlFor="preloadaddon-off"
                    className="preference__option"
                  >
                    {t('Preferences.Off')}
                  </label>
                </fieldset>
              </div>
              <div className="preference">
                <h4 className="preference__title">
                  {t('Preferences.ShapesAddon')}
                </h4>
                <fieldset className="preference__options">
                  <input
                    type="radio"
                    onChange={() =>
                      updateHTML(versionInfo.setP5ShapesAddon(true))
                    }
                    aria-label={`${t('Preferences.ShapesAddon')} ${t(
                      'Preferences.AddonOn'
                    )}`}
                    name="shapesaddon"
                    id="shapesaddon-on"
                    className="preference__radio-button"
                    value="On"
                    checked={versionInfo.p5ShapesAddon}
                  />
                  <label
                    htmlFor="shapesaddon-on"
                    className="preference__option"
                  >
                    {t('Preferences.On')}
                  </label>
                  <input
                    type="radio"
                    onChange={() =>
                      updateHTML(versionInfo.setP5ShapesAddon(false))
                    }
                    aria-label={`${t('Preferences.ShapesAddon')} ${t(
                      'Preferences.AddonOff'
                    )}`}
                    name="shapesaddon"
                    id="shapesaddon-off"
                    className="preference__radio-button"
                    value="Off"
                    checked={!versionInfo.p5ShapesAddon}
                  />
                  <label
                    htmlFor="shapesaddon-off"
                    className="preference__option"
                  >
                    {t('Preferences.Off')}
                  </label>
                </fieldset>
              </div>
              <div className="preference">
                <h4 className="preference__title">
                  {t('Preferences.DataAddon')}
                </h4>
                <fieldset className="preference__options">
                  <input
                    type="radio"
                    onChange={() =>
                      updateHTML(versionInfo.setP5DataAddon(true))
                    }
                    aria-label={`${t('Preferences.DataAddon')} ${t(
                      'Preferences.AddonOn'
                    )}`}
                    name="dataaddon"
                    id="dataaddon-on"
                    className="preference__radio-button"
                    value="On"
                    checked={versionInfo.p5DataAddon}
                  />
                  <label htmlFor="dataaddon-on" className="preference__option">
                    {t('Preferences.On')}
                  </label>
                  <input
                    type="radio"
                    onChange={() =>
                      updateHTML(versionInfo.setP5DataAddon(false))
                    }
                    aria-label={`${t('Preferences.DataAddon')} ${t(
                      'Preferences.AddonOff'
                    )}`}
                    name="dataaddon"
                    id="dataaddon-off"
                    className="preference__radio-button"
                    value="Off"
                    checked={!versionInfo.p5DataAddon}
                  />
                  <label htmlFor="dataaddon-off" className="preference__option">
                    {t('Preferences.Off')}
                  </label>
                </fieldset>
              </div>
            </>
          )}
        </TabPanel>
      </Tabs>
    </section>
  );
}
