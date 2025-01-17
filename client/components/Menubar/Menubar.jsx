import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import useModalClose from '../../common/useModalClose';
import { MenuOpenContext, MenubarContext } from './contexts';
import useKeyDownHandlers from '../../common/useKeyDownHandlers';

function Menubar({ children, className }) {
  const [menuOpen, setMenuOpen] = useState('none');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuItems, setMenuItems] = useState([]);
  const [submenuActiveIndex, setSubmenuActiveIndex] = useState(-1);
  const [submenuItems, setSubmenuItems] = useState([]);
  const timerRef = useRef(null);
  const nodeRef = useRef(null);

  const registerItem = useCallback((id) => {
    setMenuItems((prev) => [...prev, id]);
    return () => {
      setMenuItems((prev) => prev.filter((item) => item !== id));
    };
  }, []);

  const registerSubmenuItem = useCallback((id) => {
    setSubmenuItems((prev) => [...prev, id]);
    return () => {
      setSubmenuItems((prev) => prev.filter((item) => item !== id));
    };
  }, []);

  const toggleMenuOpen = useCallback(
    (menu) => {
      setMenuOpen((prevState) => (prevState === menu ? 'none' : menu));
    },
    [setMenuOpen]
  );

  const keyHandlers = useMemo(
    () => ({
      ArrowUp: (e) => {
        e.preventDefault();
        // if submenu is closed, open it and focus the last item
        if (menuOpen === 'none') {
          toggleMenuOpen(menuItems[activeIndex]);
        }
      },
      ArrowDown: (e) => {
        e.preventDefault();
        // if submenu is closed, open it and focus the first item
        if (menuOpen === 'none') {
          toggleMenuOpen(menuItems[activeIndex]);
        }
      },
      ArrowLeft: (e) => {
        e.preventDefault();
        // focus the previous item, wrapping around if we reach the beginning
        const newIndex =
          (activeIndex - 1 + menuItems.length) % menuItems.length;
        setActiveIndex(newIndex);

        // if submenu is open, close it
        if (menuOpen !== 'none') {
          toggleMenuOpen(menuItems[activeIndex]);
        }
      },
      ArrowRight: (e) => {
        e.preventDefault();
        const newIndex = (activeIndex + 1) % menuItems.length;
        setActiveIndex(newIndex);

        // close the current submenu if it's happen
        if (menuOpen !== 'none') {
          toggleMenuOpen(menuItems[activeIndex]);
        }
      },
      Enter: (e) => {
        e.preventDefault();
        // if submenu is open, activate the focused item
        // if submenu is closed, open it and focus the first item
        toggleMenuOpen(menuItems[activeIndex]);
      },
      ' ': (e) => {
        // same as Enter
        e.preventDefault();
        // if submenu is open, activate the focused item
        // if submenu is closed, open it and focus the first item
        toggleMenuOpen(menuItems[activeIndex]);
      },
      Escape: (e) => {
        // close all submenus
        setMenuOpen('none');
      },
      Tab: (e) => {
        // close
      }
      // support direct access keys
    }),
    [menuItems, menuOpen, activeIndex, toggleMenuOpen]
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

  const handleBlur = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setMenuOpen('none');
      setActiveIndex(-1);
    }, 10);
  }, [timerRef, setMenuOpen]);

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
      activeIndex,
      setActiveIndex,
      registerItem,
      menuItems,
      submenuActiveIndex,
      setSubmenuActiveIndex,
      registerSubmenuItem,
      submenuItems
    }),
    [
      menuOpen,
      toggleMenuOpen,
      clearHideTimeout,
      handleBlur,
      activeIndex,
      registerItem,
      menuItems,
      submenuActiveIndex,
      registerSubmenuItem,
      submenuItems
    ]
  );

  return (
    <MenubarContext.Provider value={contextValue}>
      <div className={className} ref={nodeRef}>
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
