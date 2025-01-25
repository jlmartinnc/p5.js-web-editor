import PropTypes from 'prop-types';
import React, { useEffect, useContext, useRef, useMemo } from 'react';
import { MenubarContext, SubmenuContext, ParentMenuContext } from './contexts';
import ButtonOrLink from '../../common/ButtonOrLink';

function MenubarItem({
  className,
  id,
  role: customRole,
  hideIf,
  selected,
  ...rest
}) {
  // moved to top bc of rules of hooks error, may remove if not needed
  if (hideIf) {
    return null;
  }

  const { createMenuItemHandlers, hasFocus } = useContext(MenubarContext);
  const {
    setSubmenuActiveIndex,
    submenuItems,
    registerSubmenuItem,
    isFirstChild
  } = useContext(SubmenuContext);
  const parent = useContext(ParentMenuContext);
  const menuItemRef = useRef(null);

  const handlers = useMemo(() => createMenuItemHandlers(parent), [
    createMenuItemHandlers,
    parent
  ]);

  const role = customRole || 'menuitem';
  const ariaSelected = role === 'option' ? { 'aria-selected': selected } : {};

  const handleMouseEnter = () => {
    if (hasFocus) {
      const items = Array.from(submenuItems);
      const index = items.findIndex((item) => item === menuItemRef.current);
      if (index !== -1) {
        setSubmenuActiveIndex(index);
      }
    }
  };

  useEffect(() => {
    const unregister = registerSubmenuItem(menuItemRef);
    return unregister;
  }, [submenuItems, registerSubmenuItem]);

  return (
    <li className={className} ref={menuItemRef} onMouseEnter={handleMouseEnter}>
      <ButtonOrLink
        {...rest}
        {...handlers}
        {...ariaSelected}
        role={role}
        tabIndex={isFirstChild ? 0 : -1}
        id={id}
      />
    </li>
  );
}

MenubarItem.propTypes = {
  ...ButtonOrLink.propTypes,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  value: PropTypes.string,
  /**
   * Provides a way to deal with optional items.
   */
  hideIf: PropTypes.bool,
  className: PropTypes.string,
  role: PropTypes.oneOf(['menuitem', 'option']),
  selected: PropTypes.bool
};

MenubarItem.defaultProps = {
  onClick: null,
  value: null,
  hideIf: false,
  className: 'nav__dropdown-item',
  role: 'menuitem',
  selected: false
};

export default MenubarItem;
