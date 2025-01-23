import { set } from 'lodash';
import { createContext } from 'react';

export const ParentMenuContext = createContext('none');

export const MenuOpenContext = createContext('none');

export const MenubarContext = createContext({
  createMenuHandlers: () => ({}),
  createMenuItemHandlers: () => ({}),
  toggleMenuOpen: () => {},
  oldActiveIndex: -1,
  setOldActiveIndex: () => {},
  oldMenuItems: []
});

export const SubmenuContext = createContext({});
