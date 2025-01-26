// https://blog.logrocket.com/building-accessible-menubar-component-react

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo
} from 'react';
import {
  MenuOpenContext,
  MenubarContext,
  SubmenuContext,
  ParentMenuContext
} from './contexts';
import TriangleIcon from '../../images/down-filled-triangle.svg';

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
  ({ id, role, title, hasPopup, ...props }, ref) => {
    const { isOpen, handlers } = useMenuProps(id);
    const {
      setActiveIndex,
      menuItems,
      registerTopLevelItem,
      hasFocus,
      toggleMenuOpen
    } = useContext(MenubarContext);
    const { first, last } = useContext(SubmenuContext);

    const handleMouseEnter = () => {
      if (hasFocus) {
        const items = Array.from(menuItems);
        const index = items.findIndex((item) => item === ref.current);

        if (index !== -1) {
          setActiveIndex(index);
        }
      }
    };

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          if (!isOpen) {
            e.preventDefault();
            e.stopPropagation();
            first();
          }
          break;
        case 'ArrowUp':
          if (!isOpen) {
            e.preventDefault();
            e.stopPropagation();
            last();
          }
          break;
        case 'Enter':
        case ' ':
          if (!isOpen) {
            e.preventDefault();
            e.stopPropagation();
            first();
          }
          break;
        default:
          break;
      }
    };

    useEffect(() => {
      const unregister = registerTopLevelItem(ref, id);
      return unregister;
    }, [menuItems, registerTopLevelItem]);

    return (
      <button
        {...props}
        {...handlers}
        ref={ref}
        role={role}
        onMouseEnter={handleMouseEnter}
        onKeyDown={handleKeyDown}
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
  role: PropTypes.string,
  title: PropTypes.node.isRequired,
  hasPopup: PropTypes.oneOf(['menu', 'listbox', 'true'])
};

MenubarTrigger.defaultProps = {
  role: 'menuitem',
  hasPopup: 'menu'
};

/* -------------------------------------------------------------------------------------------------
 * MenubarList
 * -----------------------------------------------------------------------------------------------*/

function MenubarList({ children, id, role, ...props }) {
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
  children,
  id,
  title,
  triggerRole: customTriggerRole,
  listRole: customListRole,
  ...props
}) {
  const { isOpen, handlers } = useMenuProps(id);
  const [submenuActiveIndex, setSubmenuActiveIndex] = useState(0);
  const [isFirstChild, setIsFirstChild] = useState(false);
  const { menuOpen, setMenuOpen, toggleMenuOpen } = useContext(MenubarContext);
  const submenuItems = useRef(new Set()).current;

  const buttonRef = useRef(null);
  const listItemRef = useRef(null);

  const triggerRole = customTriggerRole || 'menuitem';
  const listRole = customListRole || 'menu';
  const hasPopup = listRole === 'listbox' ? 'listbox' : 'menu';

  const prev = useCallback(() => {
    const newIndex =
      submenuActiveIndex < 0
        ? submenuItems.size - 1
        : (submenuActiveIndex - 1 + submenuItems.size) % submenuItems.size;
    setSubmenuActiveIndex(newIndex);
  }, [submenuActiveIndex, submenuItems]);

  const next = useCallback(() => {
    const newIndex = (submenuActiveIndex + 1) % submenuItems.size;
    setSubmenuActiveIndex(newIndex);
  }, [submenuActiveIndex, submenuItems]);

  const first = useCallback(() => {
    toggleMenuOpen(id);

    if (submenuItems.size > 0) {
      setSubmenuActiveIndex(0);
    }
  }, [submenuItems]);

  const last = useCallback(() => {
    toggleMenuOpen(id);
    if (submenuItems.size > 0) {
      setSubmenuActiveIndex(submenuItems.size - 1);
    }
  }, [submenuItems]);

  const activate = useCallback(() => {
    const items = Array.from(submenuItems);
    const activeItem = items[submenuActiveIndex];

    if (activeItem) {
      const activeItemNode = activeItem.firstChild;
      activeItemNode.click();

      toggleMenuOpen(id);

      // check if buttonRef is available and focus it
      // we check because the button might be unmounted when activating a link or button
      if (buttonRef.current) {
        buttonRef.current.focus();
      }
    }
  }, [submenuActiveIndex, submenuItems, buttonRef]);

  const close = useCallback(() => {
    setMenuOpen('none');

    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [buttonRef]);

  const registerSubmenuItem = useCallback(
    (ref) => {
      const submenuItemNode = ref.current;

      if (submenuItemNode) {
        if (submenuItems.size === 0) {
          setIsFirstChild(true);
        }

        submenuItems.add(submenuItemNode);
      }

      return () => {
        submenuItems.delete(submenuItemNode);
      };
    },
    [submenuItems]
  );

  const keyHandlers = useMemo(
    () => ({
      ArrowUp: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();
        prev();
      },
      ArrowDown: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();
        next();
      },
      Enter: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();
        activate();
      },
      ' ': (e) => {
        // same as Enter
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();
        activate();
      },
      Escape: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();
        close();
      },
      Tab: (e) => {
        // close
        if (!isOpen) return;
        e.preventDefault();
        setMenuOpen('none');
      }
      // support direct access keys
    }),
    [isOpen, submenuItems, submenuActiveIndex]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;

      const handler = keyHandlers[e.key];

      if (handler) {
        handler(e);
      }
    },
    [isOpen, keyHandlers]
  );

  // reset submenu active index when submenu is closed
  useEffect(() => {
    if (!isOpen) {
      setSubmenuActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const el = listItemRef.current;
    if (!el) return () => {};

    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, keyHandlers]);

  useEffect(() => {
    if (isOpen && submenuItems.size > 0) {
      const items = Array.from(submenuItems);
      const activeItem = items[submenuActiveIndex];

      if (activeItem) {
        const activeNode = activeItem.querySelector(
          '[role="menuitem"], [role="option"]'
        );
        if (activeNode) {
          activeNode.focus();
        }
      }
    }
  }, [isOpen, submenuItems, submenuActiveIndex]);

  const submenuContext = useMemo(
    () => ({
      submenuItems,
      submenuActiveIndex,
      setSubmenuActiveIndex,
      registerSubmenuItem,
      isFirstChild,
      first,
      last
    }),
    [
      submenuItems,
      submenuActiveIndex,
      setSubmenuActiveIndex,
      registerSubmenuItem,
      isFirstChild,
      first,
      last
    ]
  );

  return (
    <SubmenuContext.Provider value={submenuContext}>
      <li
        className={classNames('nav__item', isOpen && 'nav__item--open')}
        ref={listItemRef}
      >
        <MenubarTrigger
          ref={buttonRef}
          id={id}
          title={title}
          role={triggerRole}
          hasPopup={hasPopup}
          {...handlers}
          {...props}
          tabIndex={-1}
        />
        <MenubarList id={id} role={listRole}>
          {children}
        </MenubarList>
      </li>
    </SubmenuContext.Provider>
  );
}

MenubarSubmenu.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  title: PropTypes.node.isRequired,
  triggerRole: PropTypes.string,
  listRole: PropTypes.string
};

MenubarSubmenu.defaultProps = {
  children: null,
  triggerRole: 'menuitem',
  listRole: 'menu'
};

export default MenubarSubmenu;
