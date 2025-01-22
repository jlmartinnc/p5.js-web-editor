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
  const prevIndex = usePrevious(activeIndex);
  const [isFirstChild, setIsFirstChild] = useState(false);

  // old state variables
  const [oldActiveIndex, setOldActiveIndex] = useState(-1);
  const [oldMenuItems, setOldMenuItems] = useState([]);
  const [oldSubmenuActiveIndex, setOldSubmenuActiveIndex] = useState(-1);
  const [oldSubmenuItems, setOldSubmenuItems] = useState([]);
  const timerRef = useRef(null);
  const nodeRef = useRef(null);

  const oldRegisterItem = useCallback((id) => {
    setOldMenuItems((prev) => [...prev, id]);
    return () => {
      setOldMenuItems((prev) => prev.filter((item) => item !== id));
    };
  }, []);

  const oldRegisterSubmenuItem = useCallback((id) => {
    setOldSubmenuItems((prev) => [...prev, id]);
    return () => {
      setOldSubmenuItems((prev) => prev.filter((item) => item !== id));
    };
  }, []);

  const registerTopLevelItem = useCallback(
    (ref) => {
      const menuItemNode = ref.current;

      if (menuItemNode) {
        menuItems.add(menuItemNode);
      }

      return () => {
        menuItems.delete(menuItemNode);
      };
    },
    [menuItems]
  );

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
          toggleMenuOpen(oldMenuItems[oldActiveIndex]);
        }
      },
      ArrowDown: (e) => {
        e.preventDefault();
        // if submenu is closed, open it and focus the first item
        if (menuOpen === 'none') {
          toggleMenuOpen(oldMenuItems[oldActiveIndex]);
        }
      },
      ArrowLeft: (e) => {
        e.preventDefault();
        // focus the previous item, wrapping around if we reach the beginning
        // const newIndex =
        //   (oldActiveIndex - 1 + oldMenuItems.length) % oldMenuItems.length;
        // setOldActiveIndex(newIndex);

        const newIndex = (activeIndex - 1 + menuItems.size) % menuItems.size;
        setActiveIndex(newIndex);

        // if submenu is open, close it
        if (menuOpen !== 'none') {
          toggleMenuOpen(oldMenuItems[oldActiveIndex]);
        }
      },
      ArrowRight: (e) => {
        e.preventDefault();
        // const newIndex = (oldActiveIndex + 1) % oldMenuItems.length;
        // setOldActiveIndex(newIndex);

        const newIndex = (activeIndex + 1) % menuItems.size;
        console.log(activeIndex, newIndex, menuItems.size);
        setActiveIndex(newIndex);

        // close the current submenu if it's happen
        if (menuOpen !== 'none') {
          toggleMenuOpen(oldMenuItems[oldActiveIndex]);
        }
      },
      Enter: (e) => {
        e.preventDefault();
        // if submenu is open, activate the focused item
        // if submenu is closed, open it and focus the first item
        toggleMenuOpen(oldMenuItems[oldActiveIndex]);
      },
      ' ': (e) => {
        // same as Enter
        e.preventDefault();
        // if submenu is open, activate the focused item
        // if submenu is closed, open it and focus the first item
        toggleMenuOpen(oldMenuItems[oldActiveIndex]);
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
    [
      menuItems,
      activeIndex,
      oldMenuItems,
      menuOpen,
      oldActiveIndex,
      toggleMenuOpen
    ]
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
      setOldActiveIndex(-1);
    }, 10);
  }, [timerRef, setMenuOpen]);

  useEffect(() => {
    if (activeIndex !== prevIndex) {
      const items = Array.from(menuItems);
      const activeNode = items[activeIndex];
      const prevNode = items[prevIndex];
      console.log(activeNode, prevNode);

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
      oldActiveIndex,
      setOldActiveIndex,
      oldRegisterItem,
      oldMenuItems,
      oldSubmenuActiveIndex,
      setOldSubmenuActiveIndex,
      oldRegisterSubmenuItem,
      oldSubmenuItems
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
      oldActiveIndex,
      oldRegisterItem,
      oldMenuItems,
      oldSubmenuActiveIndex,
      oldRegisterSubmenuItem,
      oldSubmenuItems
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
