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
      isFirstChild
    } = useContext(MenubarContext);

    // const isActive = menuItems[activeIndex] === id; // is this item active in its own submenu?
    const isActive = useMemo(() => {
      const items = Array.from(menuItems);
      const activeNode = items[activeIndex];
      // console.log(`${items[activeIndex]?.id}, ${id}`);
      console.log(`${activeNode}, ${ref.current}`);
      return items[activeIndex]?.id === id;
    }, [menuItems, activeIndex, id]);

    useEffect(() => {
      const unregister = registerTopLevelItem(ref);
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

  const { oldActiveIndex, oldMenuItems, oldRegisterItem } = useContext(
    MenubarContext
  );
  const [oldSubmenuItems, setOldSubmenuItems] = useState([]);
  const [oldSubmenuActiveIndex, setOldSubmenuActiveIndex] = useState(-1);
  const buttonRef = useRef(null);

  const isActive = oldMenuItems[oldActiveIndex] === id;
  const triggerRole = customTriggerRole || 'menuitem';
  const listRole = customListRole || 'menu';
  const hasPopup = listRole === 'listbox' ? 'listbox' : 'menu';

  const keyHandlers = useMemo(
    () => ({
      // we only want to create the handlers if the menu is open,
      // otherwise early return{
      ArrowUp: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();

        setOldSubmenuActiveIndex(
          (prev) => (prev - 1 + oldSubmenuItems.length) % oldSubmenuItems.length
        );
      },
      ArrowDown: (e) => {
        if (!isOpen) return;
        e.preventDefault();
        e.stopPropagation();

        setOldSubmenuActiveIndex((prev) => (prev + 1) % oldSubmenuItems.length);
      },
      Enter: (e) => {
        if (!isOpen) return;
        e.preventDefault();
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

  useKeyDownHandlers(keyHandlers);

  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isActive]);

  // register this menu item
  useEffect(() => {
    const unregister = oldRegisterItem(id);
    return unregister;
  }, [id, oldRegisterItem]);

  const registerSubmenuItem = useCallback(
    (ref) => {
      const submenuItemNode = ref.current;

      if (submenuItemNode) {
        if (submenuItems.size === 0) {
          setIsFirstChild(true);
        }

        submenuItems.add(submenuItemNode);
        console.log(
          `Submenu Register: ${submenuItemNode.textContent} to ${id}`
        );
      }

      return () => {
        submenuItems.delete(submenuItemNode);
      };
    },
    [submenuItems]
  );

  // reset submenu active index when submenu is closed
  useEffect(() => {
    if (!isOpen) {
      setOldSubmenuActiveIndex(-1);
    }
  }, [isOpen]);

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
      oldSubmenuItems,
      oldSubmenuActiveIndex,
      oldRegisterSubmenuItem
    ]
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
      <SubmenuContext.Provider value={submenuContext}>
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
