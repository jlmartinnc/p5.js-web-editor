import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import ButtonOrLink from '../../common/ButtonOrLink';
import { MenubarContext, SubmenuContext, ParentMenuContext } from './contexts';

function MenubarItem({
  id,
  hideIf,
  className,
  role: customRole,
  selected,
  ...rest
}) {
  const { createMenuItemHandlers, menuItems } = useContext(MenubarContext);
  const {
    submenuItems,
    submenuActiveIndex,
    registerSubmenuItem,
    isFirstChild
  } = useContext(SubmenuContext);
  const oldSubmenuItemRef = useRef(null);
  const menuItemRef = useRef(null);
  const parent = useContext(ParentMenuContext);

  const {
    oldRegisterSubmenuItem,
    oldSubmenuActiveIndex,
    oldSubmenuItems
  } = useContext(SubmenuContext);

  const handlers = useMemo(() => createMenuItemHandlers(parent), [
    createMenuItemHandlers,
    parent
  ]);

  if (hideIf) {
    return null;
  }

  const role = customRole || 'menuitem';
  const ariaSelected = role === 'option' ? { 'aria-selected': selected } : {};
  const isActive = oldSubmenuItems[oldSubmenuActiveIndex] === id; // is this item active in its own submenu?

  useEffect(() => {
    if (isActive && oldSubmenuItemRef.current) {
      oldSubmenuItemRef.current.focus();
    }
  }, [isActive, oldSubmenuItemRef]);

  // useEffect(() => {
  //   const menuItemNode = menuItemRef.current;
  //   if (menuItemNode) {
  //     if (menuItems.size === 0) {
  //       setIsFirstChild(true);
  //     }
  //     menuItems.add(menuItemNode);
  //   }

  //   return () => {
  //     menuItems.delete(menuItemNode);
  //   };
  // }, [menuItems]);

  useEffect(() => {
    const unregister = oldRegisterSubmenuItem(id);
    return unregister;
  }, [id, oldRegisterSubmenuItem]);

  useEffect(() => {
    const unregister = registerSubmenuItem(menuItemRef);
    return unregister;
  }, [submenuItems, registerSubmenuItem]);

  useEffect(() => {
    if (isActive) {
      console.log('MenubarItem Focus:', {
        id,
        isActive,
        parent,
        oldSubmenuActiveIndex,
        element: oldSubmenuItemRef.current
      });
    }
  }, [isActive, id, parent, oldSubmenuActiveIndex]);

  return (
    <li className={className} ref={menuItemRef}>
      <ButtonOrLink
        ref={oldSubmenuItemRef}
        {...rest}
        {...handlers}
        {...ariaSelected}
        role={role}
        tabIndex={isFirstChild ? 0 : -1}
        id={id}
      />
    </li>
  );
}

MenubarItem.propTypes = {
  ...ButtonOrLink.propTypes,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  value: PropTypes.string,
  /**
   * Provides a way to deal with optional items.
   */
  hideIf: PropTypes.bool,
  className: PropTypes.string,
  role: PropTypes.oneOf(['menuitem', 'option']),
  selected: PropTypes.bool
};

MenubarItem.defaultProps = {
  onClick: null,
  value: null,
  hideIf: false,
  className: 'nav__dropdown-item',
  role: 'menuitem',
  selected: false
};

export default MenubarItem;
