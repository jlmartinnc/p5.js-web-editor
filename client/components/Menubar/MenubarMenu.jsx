import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
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

function MenubarTrigger({ id, title, ...props }) {
  const { isOpen, handlers } = useMenuProps(id);

  return (
    <button
      {...handlers}
      {...props}
      role="menuitem"
      aria-haspopup="menu"
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

MenubarTrigger.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired
};

/* -------------------------------------------------------------------------------------------------
 * MenubarList
 * -----------------------------------------------------------------------------------------------*/

function MenubarList({ id, children }) {
  return (
    <ul className="nav__dropdown" role="menu">
      <ParentMenuContext.Provider value={id}>
        {children}
      </ParentMenuContext.Provider>
    </ul>
  );
}

MenubarList.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node
};

MenubarList.defaultProps = {
  children: null
};

/* -------------------------------------------------------------------------------------------------
 * MenubarMenu
 * -----------------------------------------------------------------------------------------------*/

function MenubarMenu({ id, title, children }) {
  const { isOpen } = useMenuProps(id);

  return (
    <li className={classNames('nav__item', isOpen && 'nav__item--open')}>
      <MenubarTrigger id={id} title={title} />
      <MenubarList id={id}>{children}</MenubarList>
    </li>
  );
}

MenubarMenu.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node
};

MenubarMenu.defaultProps = {
  children: null
};

export default MenubarMenu;
