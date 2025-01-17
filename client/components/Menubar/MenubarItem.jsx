import PropTypes from 'prop-types';
import React, { useEffect, useContext, useRef, useMemo } from 'react';
import ButtonOrLink from '../../common/ButtonOrLink';
import { MenubarContext, SubmenuContext, ParentMenuContext } from './contexts';

function MenubarItem({
  id,
  hideIf,
  className,
  role: customRole,
  selected,
  ...rest
}) {
  const submenuItemRef = useRef(null);
  const parent = useContext(ParentMenuContext);
  const { createMenuItemHandlers } = useContext(MenubarContext);

  const { registerSubmenuItem, submenuActiveIndex, submenuItems } = useContext(
    SubmenuContext
  );

  const handlers = useMemo(() => createMenuItemHandlers(parent), [
    createMenuItemHandlers,
    parent
  ]);

  if (hideIf) {
    return null;
  }

  const role = customRole || 'menuitem';
  const ariaSelected = role === 'option' ? { 'aria-selected': selected } : {};
  const isActive = submenuItems[submenuActiveIndex] === id; // is this item active in its own submenu?

  useEffect(() => {
    if (isActive && submenuItemRef.current) {
      submenuItemRef.current.focus();
    }
  }, [isActive, submenuItemRef]);

  useEffect(() => {
    const unregister = registerSubmenuItem(id);
    return unregister;
  }, [id, registerSubmenuItem]);

  useEffect(() => {
    if (isActive) {
      console.log('MenubarItem Focus:', {
        id,
        isActive,
        parent,
        submenuActiveIndex,
        element: submenuItemRef.current
      });
    }
  }, [isActive, id, parent, submenuActiveIndex]);

  return (
    <li className={className}>
      <ButtonOrLink
        ref={submenuItemRef}
        {...rest}
        {...handlers}
        {...ariaSelected}
        role={role}
        tabIndex={isActive ? 0 : -1}
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
