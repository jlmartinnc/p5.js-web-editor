import PropTypes from 'prop-types';
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect
} from 'react';
import useModalClose from '../../common/useModalClose';
import { MenuOpenContext, MenubarContext } from './contexts';
import usePrevious from '../../common/usePrevious';

function Menubar({ children, className }) {
  const [menuOpen, setMenuOpen] = useState('none');

  const menuItems = useRef(new Set()).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);
  const prevIndex = usePrevious(activeIndex);
  const [isFirstChild, setIsFirstChild] = useState(false);
  const menuItemToId = useRef(new Map()).current;

  const timerRef = useRef(null);

  const registerTopLevelItem = useCallback(
    (ref, submenuId) => {
      const menuItemNode = ref.current;

      if (menuItemNode) {
        menuItems.add(menuItemNode);
        menuItemToId.set(menuItemNode, submenuId);
      }

      return () => {
        menuItems.delete(menuItemNode);
        menuItemToId.delete(menuItemNode);
      };
    },
    [menuItems, menuItemToId]
  );

  const getMenuId = useCallback(
    (index) => {
      const items = Array.from(menuItems);
      const itemNode = items[index];
      return menuItemToId.get(itemNode);
    },
    [menuItems, menuItemToId, activeIndex]
  );

  const toggleMenuOpen = useCallback((id) => {
    setMenuOpen((prevState) => (prevState === id ? 'none' : id));
  });

  const keyHandlers = useMemo(
    () => ({
      ArrowLeft: (e) => {
        e.preventDefault();
        e.stopPropagation();
        // focus the previous item, wrapping around if we reach the beginning
        const newIndex = (activeIndex - 1 + menuItems.size) % menuItems.size;
        setActiveIndex(newIndex);

        if (menuOpen !== 'none') {
          const newMenuId = getMenuId(newIndex);
          // toggleMenuOpen(newMenuId);
          setMenuOpen(newMenuId);
        }
      },
      ArrowRight: (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = (activeIndex + 1) % menuItems.size;
        setActiveIndex(newIndex);

        if (menuOpen !== 'none') {
          const newMenuId = getMenuId(newIndex);
          // toggleMenuOpen(newMenuId);
          setMenuOpen(newMenuId);
        }
      },
      Escape: (e) => {
        // close all submenus
        e.preventDefault();
        e.stopPropagation();
        if (menuOpen !== 'none') {
          const items = Array.from(menuItems);
          const activeNode = items[activeIndex];
          setMenuOpen('none');
          activeNode.focus();
        }
      },
      Tab: (e) => {
        e.stopPropagation();
        // close
      }
      // support direct access keys
    }),
    [menuItems, activeIndex, menuOpen, toggleMenuOpen]
  );

  const clearHideTimeout = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [timerRef]);

  const handleClose = useCallback(() => {
    clearHideTimeout();
    setMenuOpen('none');
  }, [setMenuOpen]);

  const nodeRef = useModalClose(handleClose);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    const isInMenu = nodeRef.current?.contains(document.activeElement);

    if (!isInMenu) {
      timerRef.current = setTimeout(() => {
        setMenuOpen('none');
        setHasFocus(false);
      }, 10);
    }
  }, [nodeRef]);

  useEffect(() => {
    if (activeIndex !== prevIndex) {
      const items = Array.from(menuItems);
      const activeNode = items[activeIndex];
      const prevNode = items[prevIndex];

      prevNode?.setAttribute('tabindex', '-1');
      activeNode?.setAttribute('tabindex', '0');
      activeNode.focus();
    }
  }, [activeIndex, prevIndex, menuItems]);

  const contextValue = useMemo(
    () => ({
      createMenuHandlers: (menu) => ({
        onMouseOver: () => {
          setMenuOpen((prevState) => (prevState === 'none' ? 'none' : menu));
        },
        onClick: () => {
          toggleMenuOpen(menu);
          const items = Array.from(menuItems);
          const index = items.findIndex(
            (item) => menuItemToId.get(item) === menu
          );
          const item = items[index];
          if (index !== -1) {
            setActiveIndex(index);
            item.focus();
          }
        },
        onBlur: handleBlur,
        onFocus: clearHideTimeout
      }),
      createMenuItemHandlers: (menu) => ({
        onMouseUp: (e) => {
          if (e.button === 2) {
            return;
          }
          setMenuOpen('none');
        },
        onBlur: handleBlur,
        onFocus: () => {
          clearHideTimeout();
          setMenuOpen(menu);
        }
      }),
      toggleMenuOpen,
      menuItems,
      activeIndex,
      setActiveIndex,
      registerTopLevelItem,
      isFirstChild,
      hasFocus,
      setHasFocus
    }),
    [
      menuOpen,
      toggleMenuOpen,
      clearHideTimeout,
      handleBlur,
      menuItems,
      activeIndex,
      setActiveIndex,
      registerTopLevelItem,
      isFirstChild,
      hasFocus
    ]
  );

  return (
    <MenubarContext.Provider value={contextValue}>
      <ul
        className={className}
        ref={nodeRef}
        role="menubar"
        aria-orientation="horizontal"
        onFocus={handleFocus}
        onKeyDown={(e) => {
          const handler = keyHandlers[e.key];
          if (handler) {
            handler(e);
          }
        }}
      >
        <MenuOpenContext.Provider value={menuOpen}>
          {children}
        </MenuOpenContext.Provider>
      </ul>
    </MenubarContext.Provider>
  );
}

Menubar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

Menubar.defaultProps = {
  children: null,
  className: 'nav__menubar'
};

export default Menubar;
