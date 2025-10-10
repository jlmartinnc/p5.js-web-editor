import i18next from 'i18next';
import {
  UserPreferences as Preferences,
  AppThemeOptions,
  UpdatePreferencesRequestBody
} from '../../../../common/types';
import { apiClient } from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { PreferencesState } from '../reducers/preferences';
import { RootState } from '../../../reducers';

export type UpdatePreferencesDispatch = (action: unknown) => void;
export type GetRootState = () => RootState;

function updatePreferences(
  formParams: UpdatePreferencesRequestBody,
  dispatch: UpdatePreferencesDispatch
) {
  apiClient
    .put('/preferences', formParams)
    .then(() => {})
    .catch((error) => {
      dispatch({
        type: ActionTypes.ERROR,
        error: error?.response?.data
      });
    });
}

export function setPreferencesTab(value: PreferencesState['tabIndex']) {
  return {
    type: ActionTypes.SET_PREFERENCES_TAB,
    value
  };
}

export function setFontSize(value: PreferencesState['fontSize']) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    // eslint-disable-line
    dispatch({
      type: ActionTypes.SET_FONT_SIZE,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          fontSize: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setLineNumbers(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_LINE_NUMBERS,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          lineNumbers: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setAutocloseBracketsQuotes(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_AUTOCLOSE_BRACKETS_QUOTES,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          autocloseBracketsQuotes: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setAutocompleteHinter(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_AUTOCOMPLETE_HINTER,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          autocompleteHinter: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setAutosave(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_AUTOSAVE,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          autosave: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setLinewrap(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_LINEWRAP,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          linewrap: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setLintWarning(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_LINT_WARNING,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          lintWarning: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setTextOutput(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_TEXT_OUTPUT,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          textOutput: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setGridOutput(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_GRID_OUTPUT,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          gridOutput: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setTheme(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_THEME,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          theme: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setAutorefresh(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch({
      type: ActionTypes.SET_AUTOREFRESH,
      value
    });
    const state = getState();
    if (state.user.authenticated) {
      const formParams = {
        preferences: {
          autorefresh: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}

export function setAllAccessibleOutput(value) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch(setTextOutput(value));
    dispatch(setGridOutput(value));
  };
}

export function setLanguage(value, { persistPreference = true } = {}) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    i18next.changeLanguage(value);
    dispatch({
      type: ActionTypes.SET_LANGUAGE,
      language: value
    });
    const state = getState();
    if (persistPreference && state.user.authenticated) {
      const formParams = {
        preferences: {
          language: value
        }
      };
      updatePreferences(formParams, dispatch);
    }
  };
}
