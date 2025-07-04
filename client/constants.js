// TODO Organize this file by reducer type, to break this apart into
// multiple files
export const UPDATE_FILE_CONTENT = 'UPDATE_FILE_CONTENT';
export const TOGGLE_SKETCH = 'TOGGLE_SKETCH';
export const START_SKETCH = 'START_SKETCH';
export const STOP_SKETCH = 'STOP_SKETCH';

export const START_ACCESSIBLE_OUTPUT = 'START_ACCESSIBLE_OUTPUT';
export const STOP_ACCESSIBLE_OUTPUT = 'STOP_ACCESSIBLE_OUTPUT';

export const OPEN_PREFERENCES = 'OPEN_PREFERENCES';
export const CLOSE_PREFERENCES = 'CLOSE_PREFERENCES';
export const SET_PREFERENCES_TAB = 'SET_PREFERENCES_TAB';
export const SET_FONT_SIZE = 'SET_FONT_SIZE';
export const SET_LINE_NUMBERS = 'SET_LINE_NUMBERS';

export const AUTH_USER = 'AUTH_USER';
export const UNAUTH_USER = 'UNAUTH_USER';
export const AUTH_ERROR = 'AUTH_ERROR';

export const SETTINGS_UPDATED = 'SETTINGS_UPDATED';

export const API_KEY_CREATED = 'API_KEY_CREATED';
export const API_KEY_REMOVED = 'API_KEY_REMOVED';

export const SET_PROJECT_NAME = 'SET_PROJECT_NAME';
export const RENAME_PROJECT = 'RENAME_PROJECT';

export const PROJECT_SAVE_SUCCESS = 'PROJECT_SAVE_SUCCESS';
export const PROJECT_SAVE_FAIL = 'PROJECT_SAVE_FAIL';
export const NEW_PROJECT = 'NEW_PROJECT';
export const RESET_PROJECT = 'RESET_PROJECT';

export const SET_PROJECT = 'SET_PROJECT';
export const SET_PROJECTS = 'SET_PROJECTS';

export const SET_COLLECTIONS = 'SET_COLLECTIONS';
export const CREATE_COLLECTION = 'CREATED_COLLECTION';
export const DELETE_COLLECTION = 'DELETE_COLLECTION';

export const ADD_TO_COLLECTION = 'ADD_TO_COLLECTION';
export const REMOVE_FROM_COLLECTION = 'REMOVE_FROM_COLLECTION';
export const EDIT_COLLECTION = 'EDIT_COLLECTION';

export const DELETE_PROJECT = 'DELETE_PROJECT';

export const SET_SELECTED_FILE = 'SET_SELECTED_FILE';
export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';
export const CREATE_FILE = 'CREATE_FILE';
export const SET_BLOB_URL = 'SET_BLOB_URL';

export const EXPAND_SIDEBAR = 'EXPAND_SIDEBAR';
export const COLLAPSE_SIDEBAR = 'COLLAPSE_SIDEBAR';

export const EXPAND_CONSOLE = 'EXPAND_CONSOLE';
export const COLLAPSE_CONSOLE = 'COLLAPSE_CONSOLE';

export const TOGGLE_FORCE_DESKTOP = 'TOGGLE_FORCE_DESKTOP';

export const UPDATE_FILE_NAME = 'UPDATE_FILE_NAME';
export const DELETE_FILE = 'DELETE_FILE';

export const SET_AUTOSAVE = 'SET_AUTOSAVE';
export const SET_LINEWRAP = 'SET_LINEWRAP';
export const SET_LINT_WARNING = 'SET_LINT_WARNING';
export const SET_PREFERENCES = 'SET_PREFERENCES';
export const SET_TEXT_OUTPUT = 'SET_TEXT_OUTPUT';
export const SET_GRID_OUTPUT = 'SET_GRID_OUTPUT';
export const SET_SOUND_OUTPUT = 'SET_SOUND_OUTPUT';
export const SET_AUTOCLOSE_BRACKETS_QUOTES = 'SET_AUTOCLOSE_BRACKETS_QUOTES';
export const SET_AUTOCOMPLETE_HINTER = 'SET_AUTOCOMPLETE_HINTER';

export const OPEN_PROJECT_OPTIONS = 'OPEN_PROJECT_OPTIONS';
export const CLOSE_PROJECT_OPTIONS = 'CLOSE_PROJECT_OPTIONS';
export const SHOW_NEW_FOLDER_MODAL = 'SHOW_NEW_FOLDER_MODAL';
export const CLOSE_NEW_FOLDER_MODAL = 'CLOSE_NEW_FOLDER_MODAL';
export const SHOW_FOLDER_CHILDREN = 'SHOW_FOLDER_CHILDREN';
export const HIDE_FOLDER_CHILDREN = 'HIDE_FOLDER_CHILDREN';
export const OPEN_UPLOAD_FILE_MODAL = 'OPEN_UPLOAD_FILE_MODAL';
export const CLOSE_UPLOAD_FILE_MODAL = 'CLOSE_UPLOAD_FILE_MODAL';

export const SHOW_SHARE_MODAL = 'SHOW_SHARE_MODAL';
export const CLOSE_SHARE_MODAL = 'CLOSE_SHARE_MODAL';
export const SHOW_EDITOR_OPTIONS = 'SHOW_EDITOR_OPTIONS';
export const CLOSE_EDITOR_OPTIONS = 'CLOSE_EDITOR_OPTIONS';
export const SHOW_KEYBOARD_SHORTCUT_MODAL = 'SHOW_KEYBOARD_SHORTCUT_MODAL';
export const CLOSE_KEYBOARD_SHORTCUT_MODAL = 'CLOSE_KEYBOARD_SHORTCUT_MODAL';
export const SHOW_TOAST = 'SHOW_TOAST';
export const HIDE_TOAST = 'HIDE_TOAST';
export const SET_TOAST_TEXT = 'SET_TOAST_TEXT';
export const SET_THEME = 'SET_THEME';
export const SET_LANGUAGE = 'SET_LANGUAGE';

export const SET_UNSAVED_CHANGES = 'SET_UNSAVED_CHANGES';
export const SET_AUTOREFRESH = 'SET_AUTOREFRESH';
export const START_SKETCH_REFRESH = 'START_SKETCH_REFRESH';
export const END_SKETCH_REFRESH = 'END_SKETCH_REFRESH';

export const DETECT_INFINITE_LOOPS = 'DETECT_INFINITE_LOOPS';
export const RESET_INFINITE_LOOPS = 'RESET_INFINITE_LOOPS';

export const RESET_PASSWORD_INITIATE = 'RESET_PASSWORD_INITIATE';
export const RESET_PASSWORD_RESET = 'RESET_PASSWORD_RESET';
export const INVALID_RESET_PASSWORD_TOKEN = 'INVALID_RESET_PASSWORD_TOKEN';

export const EMAIL_VERIFICATION_INITIATE = 'EMAIL_VERIFICATION_INITIATE';
export const EMAIL_VERIFICATION_VERIFY = 'EMAIL_VERIFICATION_VERIFY';
export const EMAIL_VERIFICATION_VERIFIED = 'EMAIL_VERIFICATION_VERIFIED';
export const EMAIL_VERIFICATION_INVALID = 'EMAIL_VERIFICATION_INVALID';

// eventually, handle errors more specifically and better
export const ERROR = 'ERROR';

export const JUST_OPENED_PROJECT = 'JUST_OPENED_PROJECT';
export const RESET_JUST_OPENED_PROJECT = 'RESET_JUST_OPENED_PROJECT';

export const SET_PROJECT_SAVED_TIME = 'SET_PROJECT_SAVED_TIME';
export const RESET_PROJECT_SAVED_TIME = 'RESET_PROJECT_SAVED_TIME';
export const SET_PREVIOUS_PATH = 'SET_PREVIOUS_PATH';
export const SHOW_ERROR_MODAL = 'SHOW_ERROR_MODAL';
export const HIDE_ERROR_MODAL = 'HIDE_ERROR_MODAL';

export const PERSIST_STATE = 'PERSIST_STATE';
export const CLEAR_PERSISTED_STATE = 'CLEAR_PERSISTED_STATE';

export const HIDE_RUNTIME_ERROR_WARNING = 'HIDE_RUNTIME_ERROR_WARNING';
export const SHOW_RUNTIME_ERROR_WARNING = 'SHOW_RUNTIME_ERROR_WARNING';

export const TOGGLE_DIRECTION = 'TOGGLE_DIRECTION';
export const SET_SORTING = 'SET_SORTING';
export const SET_SORT_PARAMS = 'SET_SORT_PARAMS';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const CLOSE_SKETCHLIST_MODAL = 'CLOSE_SKETCHLIST_MODAL';

export const START_SAVING_PROJECT = 'START_SAVING_PROJECT';
export const END_SAVING_PROJECT = 'END_SAVING_PROJECT';

export const SET_COOKIE_CONSENT = 'SET_COOKIE_CONSENT';

export const CONSOLE_EVENT = 'CONSOLE_EVENT';
export const CLEAR_CONSOLE = 'CLEAR_CONSOLE';
