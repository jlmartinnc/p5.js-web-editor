/* eslint-disable */
import announceToScreenReader from '../utils/ScreenReaderHelper';
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
    document.removeEventListener('mousedown', onClickOutside);
  }

  function onClickOutside(e) {
    if (!dialog.contains(e.target)) {
      cleanup();
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = input.value.trim();
      if (value) {
        cleanup();
        onSubmit(value);
        announceToScreenReader(
          `Renaming done from word ${oldName} to ${value}`
        );
        cleanup();
      }
    } else if (e.key === 'Escape') {
      cleanup();
    }
  });

  document.addEventListener('mousedown', onClickOutside);
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
    document.removeEventListener('mousedown', onClickOutside);
    document.removeEventListener('keydown', onKeyDown);
  }

  function onClickOutside(e) {
    if (!dialog.contains(e.target)) {
      cleanup();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }

  document.addEventListener('mousedown', onClickOutside);
  document.addEventListener('keydown', onKeyDown);
}
