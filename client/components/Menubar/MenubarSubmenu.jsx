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
    const {
      menuItems,
      activeIndex,
      registerTopLevelItem,
      toggleMenuOpen
    } = useContext(MenubarContext);
    const { first, last } = useContext(SubmenuContext);
    // const submenuContext = useContext(SubmenuContext);

    // const isActive = menuItems[activeIndex] === id; // is this item active in its own submenu?
    const isActive = useMemo(() => {
      const items = Array.from(menuItems);
      const activeNode = items[activeIndex];
      return items[activeIndex]?.id === id;
    }, [menuItems, activeIndex, id]);

    // useKeyDownHandlers(keyHandlers);

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          if (!isOpen) {
            console.log(
              `1. MenubarTrigger ArrowDown handler: focus 1st submenu item`
            );
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

    // useEffect(() => {
    //   // oldSubmenuItemRef.current.focus();
    //   const items = Array.from(menuItems);
    //   // console.log(
    //   //   `${items[activeIndex]}: ${isActive}, index: ${activeIndex}, ref: ${ref.current}, id: ${id}`
    //   // );

    //   if (isActive && ref.current) {
    //     ref.current.focus();
    //   }
    // }, [ref, isActive, activeIndex]);

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
  const submenuItems = useRef(new Set()).current;
  const [submenuActiveIndex, setSubmenuActiveIndex] = useState(0);
  const [isFirstChild, setIsFirstChild] = useState(false);

  const [oldSubmenuItems, setOldSubmenuItems] = useState([]);
  const [oldSubmenuActiveIndex, setOldSubmenuActiveIndex] = useState(-1);
  const buttonRef = useRef(null);
  const listItemRef = useRef(null);

  const triggerRole = customTriggerRole || 'menuitem';
  const listRole = customListRole || 'menu';
  const hasPopup = listRole === 'listbox' ? 'listbox' : 'menu';

  const first = useCallback(() => {
    console.log('3. MenubarSubmenu first handler');
    setSubmenuActiveIndex(0);

    const items = Array.from(submenuItems);
    const firstNode = items[0].querySelector(
      '[role="menuitem"], [role="option"]'
    );
    if (firstNode) {
      firstNode.focus();
    }
  }, [submenuItems]);

  const last = useCallback(() => {
    setSubmenuActiveIndex(submenuItems.size - 1);
  }, [submenuItems.size]);

  const keyHandlers = useMemo(
    () => ({
      // console.log('Creating keyHandlers in MenubarSubmenu, isOpen:', isOpen);

      // we only want to create the handlers if the menu is open,
      // otherwise early return{
      ArrowUp: (e) => {
        if (!isOpen) return;
        console.log('MenubarSubmenu ArrowDown handler ArrowUp reached');
        e.preventDefault();
        e.stopPropagation();

        setOldSubmenuActiveIndex(
          (prev) => (prev - 1 + oldSubmenuItems.length) % oldSubmenuItems.length
        );
      },
      ArrowDown: (e) => {
        if (!isOpen) return;
        console.log('1. MenubarSubmenu ArrowDown handler start');
        e.stopPropagation();
        console.log('2. After stopPropagation');
        e.preventDefault();
        console.log(`3. MenubarSubmenu ${id} handling ArrowDown`);

        setOldSubmenuActiveIndex((prev) => (prev + 1) % oldSubmenuItems.length);
        console.log(`before setting submenuActiveIndex: ${submenuActiveIndex}`);
        setSubmenuActiveIndex((prev) => (prev + 1) % submenuItems.size);
        console.log(`after setting submenuActiveIndex: ${submenuActiveIndex}`);
      },
      Enter: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        console.log('Enter');
        // if submenu is open, activate the focused item
        // if submenu is closed, open it and focus the first item
      },
      ' ': (e) => {
        // same as Enter
        if (!isOpen) return;
        e.preventDefault();
      },
      Escape: (e) => {
        // close all submenus
      },
      Tab: (e) => {
        // close
      }
      // support direct access keys
    }),
    [isOpen, oldSubmenuItems.length, oldSubmenuActiveIndex]
  );
  // useKeyDownHandlers(keyHandlers);

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
        // console.log(
        //   `Submenu Register: ${submenuItemNode.textContent} to ${id}`
        // );
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
      setOldSubmenuActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const el = listItemRef.current;
    if (el) {
      el.addEventListener('keydown', handleKeyDown);
    }
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const oldRegisterSubmenuItem = useCallback((submenuId) => {
    setOldSubmenuItems((prev) => [...prev, submenuId]);

    return () => {
      setOldSubmenuItems((prev) =>
        prev.filter((currentId) => currentId !== submenuId)
      );
    };
  }, []);

  const submenuContext = useMemo(
    () => ({
      submenuItems,
      registerSubmenuItem,
      isFirstChild,
      first,
      last,
      submenuActiveIndex,
      oldSubmenuItems,
      oldSubmenuActiveIndex,
      setOldSubmenuActiveIndex,
      oldRegisterSubmenuItem
    }),
    [
      submenuItems,
      registerSubmenuItem,
      isFirstChild,
      submenuActiveIndex,
      first,
      last,
      oldSubmenuItems,
      oldSubmenuActiveIndex,
      oldRegisterSubmenuItem
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
