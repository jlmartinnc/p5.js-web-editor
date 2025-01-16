// https://blog.logrocket.com/building-accessible-menubar-component-react

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useContext, useRef, useMemo } from 'react';
import TriangleIcon from '../../images/down-filled-triangle.svg';
import { MenuOpenContext, MenubarContext, ParentMenuContext } from './contexts';

export function useMenuProps(id) {
  const activeMenu = useContext(MenuOpenContext);

  const isOpen = id === activeMenu;

  const { createMenuHandlers } = useContext(MenubarContext);

  const handlers = useMemo(() => createMenuHandlers(id), [
    createMenuHandlers,
    id
  ]);

  return { isOpen, handlers };
}

/* -------------------------------------------------------------------------------------------------
 * MenubarTrigger
 * -----------------------------------------------------------------------------------------------*/
const MenubarTrigger = React.forwardRef(
  ({ id, title, role, hasPopup, ...props }, ref) => {
    const { isOpen, handlers } = useMenuProps(id);

    return (
      <button
        ref={ref}
        {...handlers}
        {...props}
        role={role}
        aria-haspopup={hasPopup}
        aria-expanded={isOpen}
      >
        <span className="nav__item-header">{title}</span>
        <TriangleIcon
          className="nav__item-header-triangle"
          focusable="false"
          aria-hidden="true"
        />
      </button>
    );
  }
);

MenubarTrigger.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  role: PropTypes.string,
  hasPopup: PropTypes.oneOf(['menu', 'listbox', 'true'])
};

MenubarTrigger.defaultProps = {
  role: 'menuitem',
  hasPopup: 'menu'
};

/* -------------------------------------------------------------------------------------------------
 * MenubarList
 * -----------------------------------------------------------------------------------------------*/

function MenubarList({ id, children, role, ...props }) {
  return (
    <ul className="nav__dropdown" role={role} {...props}>
      <ParentMenuContext.Provider value={id}>
        {children}
      </ParentMenuContext.Provider>
    </ul>
  );
}

MenubarList.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  role: PropTypes.oneOf(['menu', 'listbox'])
};

MenubarList.defaultProps = {
  children: null,
  role: 'menu'
};

/* -------------------------------------------------------------------------------------------------
 * MenubarSubmenu
 * -----------------------------------------------------------------------------------------------*/

function MenubarSubmenu({
  id,
  title,
  children,
  triggerRole: customTriggerRole,
  listRole: customListRole,
  ...props
}) {
  const { isOpen, handlers } = useMenuProps(id);
  const { activeIndex, menuItems, registerItem } = useContext(MenubarContext);
  const isActive = menuItems[activeIndex] === id;
  const buttonRef = useRef(null);

  const triggerRole = customTriggerRole || 'menuitem';
  const listRole = customListRole || 'menu';
  const hasPopup = listRole === 'listbox' ? 'listbox' : 'menu';

  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isActive]);

  // register this menu item
  useEffect(() => {
    const unregister = registerItem(id);
    return unregister;
  }, [id, registerItem]);

  return (
    <li className={classNames('nav__item', isOpen && 'nav__item--open')}>
      <MenubarTrigger
        ref={buttonRef}
        id={id}
        title={title}
        role={triggerRole}
        hasPopup={hasPopup}
        tabIndex={isActive ? 0 : -1}
        {...handlers}
        {...props}
      />
      <MenubarList id={id} role={listRole}>
        {children}
      </MenubarList>
    </li>
  );
}

MenubarSubmenu.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  triggerRole: PropTypes.string,
  listRole: PropTypes.string
};

MenubarSubmenu.defaultProps = {
  children: null,
  triggerRole: 'menuitem',
  listRole: 'menu'
};

export default MenubarSubmenu;
