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
    const { menuItems, registerTopLevelItem, toggleMenuOpen } = useContext(
      MenubarContext
    );
    const { first, last } = useContext(SubmenuContext);

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          if (!isOpen) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenuOpen(id);
            first();
          }
          break;
        case 'ArrowUp':
          if (!isOpen) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenuOpen(id);
            last();
          }
          break;
        case 'Enter':
        case ' ':
          if (!isOpen) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenuOpen(id);
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
        ref={ref}
        {...handlers}
        {...props}
        role={role}
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
  const { toggleMenuOpen } = useContext(MenubarContext);
  const submenuItems = useRef(new Set()).current;
  const [submenuActiveIndex, setSubmenuActiveIndex] = useState(0);
  const [isFirstChild, setIsFirstChild] = useState(false);

  const buttonRef = useRef(null);
  const listItemRef = useRef(null);

  const triggerRole = customTriggerRole || 'menuitem';
  const listRole = customListRole || 'menu';
  const hasPopup = listRole === 'listbox' ? 'listbox' : 'menu';

  const first = useCallback(() => {
    if (submenuItems.size > 0) {
      setSubmenuActiveIndex(0);
    }
  }, [submenuItems]);

  const last = useCallback(() => {
    if (submenuItems.size > 0) {
      setSubmenuActiveIndex(submenuItems.size - 1);
    }
  }, [submenuItems]);

  const keyHandlers = useMemo(
    () => ({
      ArrowUp: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();

        // setSubmenuActiveIndex(
        //   (prev) => (prev - 1 + submenuItems.size) % submenuItems.size
        // );
        const newIndex =
          submenuActiveIndex <= 0
            ? submenuItems.size - 1
            : submenuActiveIndex - 1;
        setSubmenuActiveIndex(newIndex);
      },
      ArrowDown: (e) => {
        if (!isOpen) return;
        e.stopPropagation();
        e.preventDefault();

        setSubmenuActiveIndex((prev) => (prev + 1) % submenuItems.size);
        const newIndex =
          submenuActiveIndex === submenuItems.size - 1
            ? 0
            : submenuActiveIndex + 1;
        setSubmenuActiveIndex(newIndex);
      },
      Enter: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();

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
        // if submenu is open, activate the focused item
        // if submenu is closed, open it and focus the first item
      },
      ' ': (e) => {
        // same as Enter
        if (!isOpen) return;
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();

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
      },
      Escape: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();
        toggleMenuOpen(id);

        //
        if (buttonRef.current) {
          buttonRef.current.focus();
        }
      },
      Tab: (e) => {
        // close
        if (!isOpen) return;
        e.preventDefault();
        toggleMenuOpen(id);
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
        e.stopPropagation();
        e.preventDefault();
        handler(e);
      }
    },
    [isOpen, keyHandlers]
  );

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

  // reset submenu active index when submenu is closed
  useEffect(() => {
    if (!isOpen) {
      setSubmenuActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const el = listItemRef.current;
    if (el) {
      el.addEventListener('keydown', handleKeyDown);
    }
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const submenuContext = useMemo(
    () => ({
      submenuItems,
      registerSubmenuItem,
      isFirstChild,
      first,
      last,
      submenuActiveIndex
    }),
    [
      submenuItems,
      registerSubmenuItem,
      isFirstChild,
      submenuActiveIndex,
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
