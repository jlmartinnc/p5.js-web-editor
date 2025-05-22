/**
 * Utility functions for language detection and handling
 */

function detectLanguageFromUserAgent(userAgent) {
  const langRegexes = [
    /\b([a-z]{2}(-[A-Z]{2})?);/i, // matches patterns like "en;" or "en-US;"
    /\[([a-z]{2}(-[A-Z]{2})?)\]/i // matches patterns like "[en]" or "[en-US]"
  ];

  const match = langRegexes.reduce((result, regex) => {
    if (result) return result;
    const matches = userAgent.match(regex);
    return matches && matches[1] ? matches[1] : null;
  }, null);

  return match;
}

function getPreferredLanguage(supportedLanguages = [], defaultLanguage = 'en') {
  if (typeof navigator === 'undefined') {
    return defaultLanguage;
  }

  const normalizeLanguage = (langCode) => langCode.toLowerCase().trim();

  const normalizedSupported = supportedLanguages.map(normalizeLanguage);

  if (navigator.languages && navigator.languages.length) {
    const matchedLang = navigator.languages.find((browserLang) => {
      const normalizedBrowserLang = normalizeLanguage(browserLang);

      const hasExactMatch =
        normalizedSupported.findIndex(
          (lang) => lang === normalizedBrowserLang
        ) !== -1;

      if (hasExactMatch) {
        return true;
      }

      const languageOnly = normalizedBrowserLang.split('-')[0];
      const hasLanguageOnlyMatch =
        normalizedSupported.findIndex(
          (lang) => lang === languageOnly || lang.startsWith(`${languageOnly}-`)
        ) !== -1;

      return hasLanguageOnlyMatch;
    });

    if (matchedLang) {
      const normalizedMatchedLang = normalizeLanguage(matchedLang);
      const exactMatchIndex = normalizedSupported.findIndex(
        (lang) => lang === normalizedMatchedLang
      );

      if (exactMatchIndex !== -1) {
        return supportedLanguages[exactMatchIndex];
      }

      const languageOnly = normalizedMatchedLang.split('-')[0];
      const languageOnlyMatchIndex = normalizedSupported.findIndex(
        (lang) => lang === languageOnly || lang.startsWith(`${languageOnly}-`)
      );

      if (languageOnlyMatchIndex !== -1) {
        return supportedLanguages[languageOnlyMatchIndex];
      }
    }
  }

  if (navigator.language) {
    const normalizedNavLang = normalizeLanguage(navigator.language);
    const exactMatchIndex = normalizedSupported.findIndex(
      (lang) => lang === normalizedNavLang
    );

    if (exactMatchIndex !== -1) {
      return supportedLanguages[exactMatchIndex];
    }

    const languageOnly = normalizedNavLang.split('-')[0];
    const languageOnlyMatchIndex = normalizedSupported.findIndex(
      (lang) => lang === languageOnly || lang.startsWith(`${languageOnly}-`)
    );

    if (languageOnlyMatchIndex !== -1) {
      return supportedLanguages[languageOnlyMatchIndex];
    }
  }

  if (navigator.userAgent) {
    const userAgentLang = detectLanguageFromUserAgent(navigator.userAgent);
    if (
      userAgentLang &&
      normalizedSupported.includes(normalizeLanguage(userAgentLang))
    ) {
      const index = normalizedSupported.indexOf(
        normalizeLanguage(userAgentLang)
      );
      return supportedLanguages[index];
    }
  }
  return defaultLanguage;
}

export default getPreferredLanguage;
