import PropTypes from 'prop-types';
import React, { useEffect, useContext, useRef } from 'react';
import { MenubarContext, SubmenuContext, ParentMenuContext } from './contexts';
import ButtonOrLink from '../../common/ButtonOrLink';

/**
 * @component
 * @param {object} props
 * @param {string} [props.className='nav__dropdown-item'] - CSS class name to apply to the list item
 * @param {string} props.id - The id of the list item
 * @param {string} [props.role='menuitem'] - The role of the list item
 * @param {boolean} [props.hideIf=false] - Whether to hide the item
 * @param {boolean} [props.selected=false] - Whether the item is selected
 * @returns {JSX.Element}
 */

/**
 * MenubarItem wraps a button or link in an accessible list item that
 * integrates with keyboard navigation and other submenu behaviors.
 *
 * @example
 * ```jsx
 * // basic MenubarItem with click handler and keyboard shortcut
 * <MenubarItem id="sketch-run" onClick={() => dispatch(startSketch())}>
 *   Run
 *   <span className="nav__keyboard-shortcut">{metaKeyName}+Enter</span>
 * </MenubarItem>
 *
 * // as an option in a listbox
 * <MenubarItem
 *   id={key}
 *   key={key}
 *   value={key}
 *   onClick={handleLangSelection}
 *   role="option"
 *   selected={key === language}
 * >
 *   {languageKeyToLabel(key)}
 * </MenubarItem>
 * ```
 */

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

  // core context and state management
  const { createMenuItemHandlers, hasFocus } = useContext(MenubarContext);
  const {
    setSubmenuActiveIndex,
    submenuItems,
    registerSubmenuItem
  } = useContext(SubmenuContext);
  const parent = useContext(ParentMenuContext);

  // ref for the list item
  const menuItemRef = useRef(null);

  // handlers from parent menu
  const handlers = createMenuItemHandlers(parent);

  // role and aria-selected
  const role = customRole || 'menuitem';
  const ariaSelected = role === 'option' ? { 'aria-selected': selected } : {};

  // focus submenu item on mouse enter
  const handleMouseEnter = () => {
    if (hasFocus) {
      const items = Array.from(submenuItems);
      const index = items.findIndex((item) => item === menuItemRef.current);
      if (index !== -1) {
        setSubmenuActiveIndex(index);
      }
    }
  };

  // register with parent submenu for keyboard navigation
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
        tabIndex={-1}
        id={id}
      />
    </li>
  );
}

MenubarItem.propTypes = {
  ...ButtonOrLink.propTypes,
  id: PropTypes.string,
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
  id: undefined,
  selected: false
};

export default MenubarItem;
