import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Menubar from './Menubar';
import MenubarSubmenu from './MenubarSubmenu';
import MenubarItem from './MenubarItem';

describe('Menubar', () => {
  const renderMenubar = () => {
    render(
      <Menubar>
        <MenubarSubmenu id="file" title="File">
          <MenubarItem id="file-new" title="New" onClick={jest.fn()}>
            New
          </MenubarItem>
          <MenubarItem id="file-save" title="Save" onClick={jest.fn()}>
            Save
          </MenubarItem>
          <MenubarItem id="file-open" title="Open" onClick={jest.fn()}>
            Open
          </MenubarItem>
        </MenubarSubmenu>
        <MenubarSubmenu id="edit" title="Edit">
          <MenubarItem id="edit-tidy" title="Tidy" onClick={jest.fn()}>
            Tidy
          </MenubarItem>
          <MenubarItem id="edit-find" title="Find" onClick={jest.fn()}>
            Find
          </MenubarItem>
          <MenubarItem id="edit-replace" title="Replace" onClick={jest.fn()}>
            Replace
          </MenubarItem>
        </MenubarSubmenu>
      </Menubar>
    );
  };

  it('can render a menubar with submenus and items', () => {
    renderMenubar();

    const fileMenu = screen.getByRole('menuitem', { name: 'File' });
    const editMenu = screen.getByRole('menuitem', { name: 'Edit' });

    expect(fileMenu).toBeInTheDocument();
    expect(editMenu).toBeInTheDocument();

    const fileNewItem = screen.getByRole('menuitem', { name: 'New' });
    const editTidyItem = screen.getByRole('menuitem', { name: 'Tidy' });

    expect(fileNewItem).not.toBeVisible();
    expect(editTidyItem).not.toBeVisible();
  });

  it('should open a submenu when clicked', () => {
    renderMenubar();

    const fileMenu = screen.getByRole('menuitem', { name: 'File' });
    const editMenu = screen.getByRole('menuitem', { name: 'Edit' });

    fireEvent.click(fileMenu);
    expect(screen.getByRole('menuitem', { name: 'New' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'Save' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'Tidy' })).not.toBeVisible();

    fireEvent.click(document.body);
    expect(screen.getByRole('menuitem', { name: 'New' })).not.toBeVisible();
  });

  it('should support top-level keyboard navigation', () => {
    renderMenubar();

    const fileMenu = screen.getByRole('menuitem', { name: 'File' });
    const editMenu = screen.getByRole('menuitem', { name: 'Edit' });
    fireEvent.focus(fileMenu);

    fireEvent.keyDown(fileMenu, { key: 'ArrowRight' });
    expect(editMenu).toHaveFocus();

    fireEvent.keyDown(editMenu, { key: 'ArrowLeft' });
    expect(fileMenu).toHaveFocus();

    const newMenuItem = screen.getByRole('menuitem', { name: 'New' });

    fireEvent.keyDown(fileMenu, { key: 'ArrowDown' });
    expect(newMenuItem).toBeVisible();
    expect(newMenuItem).toHaveFocus();

    fireEvent.keyDown(newMenuItem, { key: 'Escape' });
    expect(newMenuItem).not.toBeVisible();
  });

  it('should support submenu keyboard navigation', () => {
    renderMenubar();

    const fileMenu = screen.getByRole('menuitem', { name: 'File' });
    const newMenuItem = screen.getByRole('menuitem', { name: 'New' });
    const openMenuItem = screen.getByRole('menuitem', { name: 'Open' });

    const editMenu = screen.getByRole('menuitem', { name: 'Edit' });
    const tidyMenuItem = screen.getByRole('menuitem', { name: 'Tidy' });

    fireEvent.click(fileMenu);
    expect(newMenuItem).toBeVisible();

    fireEvent.keyDown(fileMenu, { key: 'ArrowDown' });
    expect(newMenuItem).toHaveFocus();

    fireEvent.keyDown(newMenuItem, { key: 'ArrowUp' });
    expect(newMenuItem).not.toHaveFocus();
    expect(openMenuItem).toHaveFocus();

    fireEvent.keyDown(openMenuItem, { key: 'ArrowRight' });
    expect(newMenuItem).not.toBeVisible();
    expect(openMenuItem).not.toHaveFocus();
    expect(editMenu).toHaveFocus();
    expect(tidyMenuItem).toBeVisible();

    fireEvent.keyDown(editMenu, { key: 'ArrowLeft' });
    expect(tidyMenuItem).not.toBeVisible();
    expect(editMenu).not.toHaveFocus();
    expect(fileMenu).toHaveFocus();
    expect(newMenuItem).toBeVisible();

    fireEvent.keyDown(newMenuItem, { key: 'Escape' });
    expect(newMenuItem).not.toBeVisible();
  });

  it('should activate a menu item when clicked', () => {
    const handleClick = jest.fn();

    render(
      <Menubar>
        <MenubarSubmenu id="file" title="File">
          <MenubarItem id="file-new" title="New" onClick={handleClick}>
            New
          </MenubarItem>
        </MenubarSubmenu>
      </Menubar>
    );

    const fileMenu = screen.getByRole('menuitem', { name: 'File' });
    const newMenuItem = screen.getByRole('menuitem', { name: 'New' });
    fireEvent.click(fileMenu);
    fireEvent.click(newMenuItem);

    expect(handleClick).toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: 'New' })).not.toBeVisible();
  });

  it('should have proper ARIA attributes', () => {
    renderMenubar();

    const menubar = screen.getByRole('menubar');
    expect(menubar).toHaveAttribute('aria-orientation', 'horizontal');

    const fileMenu = screen.getByRole('menuitem', { name: 'File' });
    expect(fileMenu).toHaveAttribute('aria-haspopup', 'menu');
    expect(fileMenu).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(fileMenu);
    expect(fileMenu).toHaveAttribute('aria-expanded', 'true');
  });
});
