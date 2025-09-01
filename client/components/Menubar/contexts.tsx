import React, { createContext } from 'react';

export const ParentMenuContext = createContext<string>('none');

export const MenuOpenContext = createContext<string>('none');

interface MenubarContextType {
  createMenuHandlers: (
    id: string
  ) => {
    onMouseOver: (e: React.MouseEvent) => void;
    onClick: (e: React.MouseEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
    onFocus: (e: React.FocusEvent) => void;
  };
  createMenuItemHandlers: (
    id: string
  ) => {
    onMouseUp: (e: React.MouseEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
    onFocus: (e: React.FocusEvent) => void;
  };
  toggleMenuOpen: (id: string) => void;
}

export const MenubarContext = createContext<MenubarContextType>({
  createMenuHandlers: () => ({
    onMouseOver: () => {},
    onClick: () => {},
    onBlur: () => {},
    onFocus: () => {}
  }),
  createMenuItemHandlers: () => ({
    onMouseUp: () => {},
    onBlur: () => {},
    onFocus: () => {}
  }),
  toggleMenuOpen: () => {}
});

export const SubmenuContext = createContext({});
