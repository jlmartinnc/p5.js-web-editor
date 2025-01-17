// https://blog.logrocket.com/building-accessible-menubar-component-react

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useMemo
} from 'react';
import TriangleIcon from '../../images/down-filled-triangle.svg';
import {
  MenuOpenContext,
  MenubarContext,
  SubmenuContext,
  ParentMenuContext
} from './contexts';
import useKeyDownHandlers from '../../common/useKeyDownHandlers';

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
  const [submenuItems, setSubmenuItems] = useState([]);
  const [submenuActiveIndex, setSubmenuActiveIndex] = useState(-1);
  const isActive = menuItems[activeIndex] === id;
  const buttonRef = useRef(null);

  const triggerRole = customTriggerRole || 'menuitem';
  const listRole = customListRole || 'menu';
  const hasPopup = listRole === 'listbox' ? 'listbox' : 'menu';

  const keyHandlers = useMemo(() => {
    // we only want to create the handlers if the menu is open,
    // otherwise return empty handlers
    if (!isOpen) {
      return {};
    }

    return {
      ArrowUp: (e) => {
        e.preventDefault();
        e.stopPropagation();

        setSubmenuActiveIndex((prev) => {
          const newIndex =
            (prev - 1 + submenuItems.length) % submenuItems.length;
          return newIndex;
        });
      },
      ArrowDown: (e) => {
        e.preventDefault();
        e.stopPropagation();

        setSubmenuActiveIndex((prev) => {
          const newIndex = (prev + 1) % submenuItems.length;
          return newIndex;
        });
      },
      Enter: (e) => {
        e.preventDefault();
        // if submenu is open, activate the focused item
        // if submenu is closed, open it and focus the first item
      },
      ' ': (e) => {
        // same as Enter
        e.preventDefault();
      },
      Escape: (e) => {
        // close all submenus
      },
      Tab: (e) => {
        // close
      }
    };

    // support direct access keys
  }, [isOpen, submenuItems.length, submenuActiveIndex]);

  useKeyDownHandlers(keyHandlers);

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

  // reset submenu active index when submenu is closed
  useEffect(() => {
    if (!isOpen) {
      setSubmenuActiveIndex(-1);
    }
  }, isOpen);

  const registerSubmenuItem = useCallback((submenuId) => {
    setSubmenuItems((prev) => [...prev, submenuId]);

    return () => {
      setSubmenuItems((prev) =>
        prev.filter((currentId) => currentId !== submenuId)
      );
    };
  }, []);

  const subMenuContext = useMemo(
    () => ({
      submenuItems,
      submenuActiveIndex,
      setSubmenuActiveIndex,
      registerSubmenuItem
    }),
    [submenuItems, submenuActiveIndex, registerSubmenuItem]
  );

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
      <SubmenuContext.Provider value={subMenuContext}>
        <MenubarList id={id} role={listRole}>
          {children}
        </MenubarList>
      </SubmenuContext.Provider>
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
