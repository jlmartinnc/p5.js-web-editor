import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AsteriskIcon from '../../../images/p5-asterisk.svg';
import Nav from '../components/Header/Nav';
import packageData from '../../../../package.json';

function About(props) {
  const { t } = useTranslation();
  const p5version = useSelector((state) => {
    const index = state.files.find((file) => file.name === 'index.html');
    return index?.content.match(/\/p5\.js\/([\d.]+)\//)?.[1];
  });
  return (
    <div className="about__wrapper">
      <Helmet>
        <title> {t('About.TitleHelmet')} </title>
      </Helmet>

      <Nav layout="dashboard" />
      <div className="about__content">
        <div className="about__content-section">
          <h3 className="about__content-column-title">{t('Header')}</h3>
          <div className="about__content-row">
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                {t('About.Home')}
              </a>
            </p>
          </div>
        </div>
        <div className="about__content-section">
          <h3 className="about__content-column-title">{t('About.NewP5')}</h3>
          <div className="about__content-row">
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                {t('About.Home')}
              </a>
            </p>
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/examples/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                {t('About.Examples')}
              </a>
            </p>
            <p className="about__content-column-list">
              <Link to="/code-of-conduct">
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                {t('About.CodeOfConduct')}
              </Link>
            </p>
          </div>
        </div>
        <div className="about__content-section">
          <h3 className="about__content-column-title">
            {t('About.Resources')}
          </h3>
          <div className="about__content-row">
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/libraries/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                {t('About.Libraries')}
              </a>
            </p>
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/reference/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                {t('About.Reference')}
              </a>
            </p>
          </div>
        </div>
        <div className="about__content-section">
          <h3 className="about__content-column-title">{t('Get Involved')}</h3>
          <div className="about__content-row">
            <p className="about__content-column-list">
              <a
                href="https://p5js.org/donate/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                Donate
              </a>
            </p>
            <p className="about__footer-list">
              <a
                href="https://github.com/processing/p5.js-web-editor"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('About.Contribute')}
              </a>
            </p>
            <p className="about__footer-list">
              <a
                href="https://github.com/processing/p5.js-web-editor/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('About.Report')}
              </a>
            </p>
            <p className="about__content-column-list">
              <a
                href="https://discourse.processing.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                {t('About.Forum')}
              </a>
            </p>
            <p className="about__content-column-list">
              <a
                href="https://discord.com/invite/SHQ8dH25r9"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AsteriskIcon
                  className="about__content-column-asterisk"
                  aria-hidden="true"
                  focusable="false"
                />
                {t('About.Discord')}
              </a>
            </p>
          </div>
        </div>
        <div className="about__content-section">
          <h3 className="about__content-column-title">{t('Contact')}</h3>
        </div>
        <div className="about__footer">
          <div className="about__footer-list-container">
            <p className="about__footer-list">
              <Link to="/privacy-policy">{t('About.PrivacyPolicy')}</Link>
            </p>
            <p className="about__footer-list">
              <Link to="/terms-of-use">{t('About.TermsOfUse')}</Link>
            </p>
            <p className="about__footer-list">
              <Link to="/code-of-conduct">{t('About.CodeOfConduct')}</Link>
            </p>
          </div>
          <div className="about__footer-list-container">
            <p className="about__footer-list">
              {t('About.WebEditor')}: <span>v{packageData?.version}</span>
            </p>
            <p className="about__footer-list">
              p5.js: <span>v{p5version}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
