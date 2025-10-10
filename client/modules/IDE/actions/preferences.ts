import i18next from 'i18next';
import { UpdatePreferencesRequestBody } from '../../../../common/types';
import { apiClient } from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import type { PreferencesState } from '../reducers/preferences';
import type { RootState } from '../../../reducers';

// Value Definitions:
export type SetPreferencesTabValue = PreferencesState['tabIndex'];
export type SetFontSizeValue = PreferencesState['fontSize'];
export type SetLineNumbersValue = PreferencesState['lineNumbers'];
export type SetAutocloseBracketsQuotesValue = PreferencesState['autocloseBracketsQuotes'];
export type SetAutocompleteHinterValue = PreferencesState['autocompleteHinter'];
export type SetAutosaveValue = PreferencesState['autosave'];
export type SetLinewrapValue = PreferencesState['linewrap'];
export type SetLintWarningValue = PreferencesState['lintWarning'];
export type SetTextOutputValue = PreferencesState['textOutput'];
export type SetGridOutputValue = PreferencesState['gridOutput'];
export type SetThemeValue = PreferencesState['theme'];
export type SetAutorefreshValue = PreferencesState['autorefresh'];
export type SetLanguageValue = PreferencesState['language'];
export type SetAllAccessibleOutputValue =
  | SetTextOutputValue
  | SetGridOutputValue;

// Action Definitions:
export type OpenPreferencesAction = {
  type: typeof ActionTypes.OPEN_PREFERENCES;
};
export type SetPreferencesAction = {
  type: typeof ActionTypes.SET_PREFERENCES;
  preferences: PreferencesState;
};
export type SetErrorAction = {
  type: typeof ActionTypes.ERROR;
  error: unknown;
};

export type SetPreferencesTabAction = {
  type: typeof ActionTypes.SET_PREFERENCES_TAB;
  value: SetPreferencesTabValue;
};
export type SetFontSizeAction = {
  type: typeof ActionTypes.SET_FONT_SIZE;
  value: SetFontSizeValue;
};
export type SetLineNumbersAction = {
  type: typeof ActionTypes.SET_LINE_NUMBERS;
  value: SetLineNumbersValue;
};
export type SetAutocloseBracketsQuotesAction = {
  type: typeof ActionTypes.SET_AUTOCLOSE_BRACKETS_QUOTES;
  value: SetAutocloseBracketsQuotesValue;
};
export type SetAutocompleteHinterAction = {
  type: typeof ActionTypes.SET_AUTOCOMPLETE_HINTER;
  value: SetAutocompleteHinterValue;
};
export type SetAutosaveAction = {
  type: typeof ActionTypes.SET_AUTOSAVE;
  value: SetAutosaveValue;
};
export type SetLinewrapAction = {
  type: typeof ActionTypes.SET_LINEWRAP;
  value: SetLinewrapValue;
};
export type SetLintWarningAction = {
  type: typeof ActionTypes.SET_LINT_WARNING;
  value: SetLintWarningValue;
};
export type SetTextOutputAction = {
  type: typeof ActionTypes.SET_TEXT_OUTPUT;
  value: SetTextOutputValue;
};
export type SetGridOutputAction = {
  type: typeof ActionTypes.SET_GRID_OUTPUT;
  value: SetGridOutputValue;
};
export type SetThemeAction = {
  type: typeof ActionTypes.SET_THEME;
  value: SetThemeValue;
};
export type SetAutorefreshAction = {
  type: typeof ActionTypes.SET_AUTOREFRESH;
  value: SetAutorefreshValue;
};
export type SetLanguageAction = {
  type: typeof ActionTypes.SET_LANGUAGE;
  language: SetLanguageValue;
};

export type PreferencesAction =
  | OpenPreferencesAction
  | SetPreferencesAction
  | SetErrorAction
  | SetPreferencesTabAction
  | SetFontSizeAction
  | SetLineNumbersAction
  | SetAutocloseBracketsQuotesAction
  | SetAutocompleteHinterAction
  | SetAutosaveAction
  | SetLinewrapAction
  | SetLintWarningAction
  | SetTextOutputAction
  | SetGridOutputAction
  | SetThemeAction
  | SetAutorefreshAction
  | SetLanguageAction;

export type UpdatePreferencesDispatch = (
  action: PreferencesAction | PreferencesThunk
) => void;

export type PreferencesThunk = (
  dispatch: UpdatePreferencesDispatch,
  getState: GetRootState
) => void;

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

export function setPreferencesTab(value: SetPreferencesTabValue) {
  return {
    type: ActionTypes.SET_PREFERENCES_TAB,
    value
  };
}

export function setFontSize(value: SetFontSizeValue) {
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

export function setLineNumbers(value: SetLineNumbersValue) {
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

export function setAutocloseBracketsQuotes(
  value: SetAutocloseBracketsQuotesValue
) {
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

export function setAutocompleteHinter(value: SetAutocompleteHinterValue) {
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

export function setAutosave(value: SetAutosaveValue) {
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

export function setLinewrap(value: SetLinewrapValue) {
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

export function setLintWarning(value: SetLintWarningValue) {
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

export function setTextOutput(value: SetTextOutputValue) {
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

export function setGridOutput(value: SetGridOutputValue) {
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

export function setTheme(value: SetThemeValue) {
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

export function setAutorefresh(value: SetAutorefreshValue) {
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

export function setAllAccessibleOutput(value: SetAllAccessibleOutputValue) {
  return (dispatch: UpdatePreferencesDispatch, getState: GetRootState) => {
    dispatch(setTextOutput(value));
    dispatch(setGridOutput(value));
  };
}

export function setLanguage(
  value: SetLanguageValue,
  { persistPreference = true } = {}
) {
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
