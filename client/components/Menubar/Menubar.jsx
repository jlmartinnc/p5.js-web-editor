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
import useKeyDownHandlers from '../../common/useKeyDownHandlers';
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
  const nodeRef = useRef(null);

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
        // focus the previous item, wrapping around if we reach the beginning
        const newIndex = (activeIndex - 1 + menuItems.size) % menuItems.size;
        setActiveIndex(newIndex);

        if (menuOpen !== 'none') {
          const newMenuId = getMenuId(newIndex);
          toggleMenuOpen(newMenuId);
        }
      },
      ArrowRight: (e) => {
        e.preventDefault();

        const newIndex = (activeIndex + 1) % menuItems.size;
        setActiveIndex(newIndex);

        if (menuOpen !== 'none') {
          const newMenuId = getMenuId(newIndex);
          toggleMenuOpen(newMenuId);
        }
      },
      Enter: (e) => {
        e.preventDefault();
      },
      ' ': (e) => {
        // same as Enter
        e.preventDefault();
        // if submenu is open, activate the focused item
        // if submenu is closed, open it and focus the first item
      },
      Escape: (e) => {
        // close all submenus
        e.preventDefault();
        if (menuOpen !== 'none') {
          const items = Array.from(menuItems);
          const activeNode = items[activeIndex];
          setMenuOpen('none');
          activeNode.focus();
        }
      },
      Tab: (e) => {
        // close
      }
      // support direct access keys
    }),
    [menuItems, activeIndex, menuOpen, toggleMenuOpen]
  );

  useKeyDownHandlers(keyHandlers);

  const handleClose = useCallback(() => {
    setMenuOpen('none');
  }, [setMenuOpen]);

  const clearHideTimeout = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [timerRef]);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setMenuOpen('none');
      setHasFocus(false);
    }, 10);
  }, [timerRef, setMenuOpen]);

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
      <div className={className} ref={nodeRef} onFocus={handleFocus}>
        <MenuOpenContext.Provider value={menuOpen}>
          {children}
        </MenuOpenContext.Provider>
      </div>
    </MenubarContext.Provider>
  );
}

Menubar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

Menubar.defaultProps = {
  children: null,
  className: 'nav'
};

export default Menubar;
