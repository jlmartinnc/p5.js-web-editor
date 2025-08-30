/* eslint-disable */
import announceToScreenReader from './ScreenReaderHelper';
const allFuncs = require('./p5-reference-functions.json');
const allFunsList = new Set(allFuncs.functions.list);

export default function showRenameDialog(tokenType, coords, oldName, onSubmit) {
  if (
    (allFunsList.has(oldName) && tokenType !== 'p5-variable') ||
    !isValidIdentifierSelection(oldName, tokenType)
  ) {
    showTemporaryDialog(coords, 'You cannot rename this element');
    announceToScreenReader(`The word ${oldName} cannot be renamed`, true);
    return;
  }

  openRenameInputDialog(coords, oldName, onSubmit);
}

function openRenameInputDialog(coords, oldName, onSubmit) {
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', `Rename ${oldName}`);

  dialog.style.position = 'absolute';
  dialog.style.left = `${coords.left}px`;
  dialog.style.top = `${coords.bottom + 5}px`;
  dialog.style.zIndex = '10000';
  dialog.style.background = '#fff';
  dialog.style.border = '1px solid #ccc';
  dialog.style.padding = '5px 10px';
  dialog.style.borderRadius = '4px';
  dialog.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

  const input = document.createElement('input');
  input.setAttribute('aria-label', 'Enter new name');
  input.type = 'text';
  input.value = oldName;
  input.style.width = '200px';
  input.style.fontSize = '14px';

  dialog.appendChild(input);
  document.body.appendChild(dialog);
  input.focus();

  announceToScreenReader(`Renaming dialog box opened with word ${oldName}`);

  function cleanup() {
    dialog.remove();
  }

  const cleanupClick = addClickOutsideHandler(dialog, cleanup);
  const cleanupKeys = addKeyHandler(['Escape'], cleanup);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = input.value.trim();
      if (value) {
        cleanup();
        cleanupClick();
        cleanupKeys();
        onSubmit(value);
        announceToScreenReader(
          `Renaming done from word ${oldName} to ${value}`
        );
      }
    }
  });
}

function isValidIdentifierSelection(selection, tokenType) {
  if (!selection || selection.trim() === '') return false;
  if (
    tokenType === 'comment' ||
    tokenType === 'atom' ||
    tokenType === 'string' ||
    tokenType === 'keyword'
  )
    return false;

  if (/\s/.test(selection)) return false;
  return /^[$A-Z_a-z][$\w]*$/.test(selection);
}

function showTemporaryDialog(coords, message) {
  const dialog = document.createElement('div');
  dialog.textContent = message;

  dialog.style.position = 'absolute';
  dialog.style.left = `${coords.left}px`;
  dialog.style.top = `${coords.bottom + 5}px`;
  dialog.style.zIndex = '10000';
  dialog.style.background = '#fff';
  dialog.style.border = '1px solid #ccc';
  dialog.style.padding = '5px 10px';
  dialog.style.borderRadius = '4px';
  dialog.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  dialog.style.fontSize = '14px';
  dialog.style.color = '#333';

  document.body.appendChild(dialog);

  const timeout = setTimeout(cleanup, 2000);

  function cleanup() {
    dialog.remove();
    clearTimeout(timeout);
    cleanupClick();
    cleanupKeys();
  }

  const cleanupClick = addClickOutsideHandler(dialog, cleanup);
  const cleanupKeys = addKeyHandler(['Escape'], cleanup);
}

function addClickOutsideHandler(element, onOutsideClick) {
  function handler(e) {
    if (!element.contains(e.target)) {
      onOutsideClick();
      remove();
    }
  }
  function remove() {
    document.removeEventListener('mousedown', handler);
  }
  document.addEventListener('mousedown', handler);
  return remove;
}

function addKeyHandler(keys, onKeyPress) {
  function handler(e) {
    if (keys.includes(e.key)) {
      onKeyPress(e.key);
      remove();
    }
  }
  function remove() {
    document.removeEventListener('keydown', handler);
  }
  document.addEventListener('keydown', handler);
  return remove;
}
