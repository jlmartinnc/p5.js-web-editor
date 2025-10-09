import { Error } from './express';

export enum AppThemeOptions {
  LIGHT = 'light',
  DARK = 'dark',
  CONTRAST = 'contrast'
}

export interface UserPreferences {
  fontSize: number;
  lineNumbers: boolean;
  indentationAmount: number;
  isTabIndent: boolean;
  autosave: boolean;
  linewrap: boolean;
  lintWarning: boolean;
  textOutput: boolean;
  gridOutput: boolean;
  theme: AppThemeOptions;
  autorefresh: boolean;
  language: string;
  autocloseBracketsQuotes: boolean;
  autocompleteHinter: boolean;
}

export enum CookieConsentOptions {
  NONE = 'none',
  ESSENTIAL = 'essential',
  ALL = 'all'
}

// HTTP:

export type UpdatePreferencesResponseBody = UserPreferences | Error;
/**
 * user.controller.updatePreferences
 */
export interface UpdatePreferencesRequestBody {
  preferences: UserPreferences;
}

/**
 * user.controller.updateCookieConsent
 */
export interface UpdateCookieConsentRequestBody {
  cookieConsent: CookieConsentOptions;
}
