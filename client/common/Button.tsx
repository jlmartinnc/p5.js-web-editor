import React from 'react';
import styled from 'styled-components';
import { Link, LinkProps } from 'react-router-dom';
import { remSize, prop } from '../theme';

const kinds = {
  primary: 'primary',
  secondary: 'secondary'
} as const;

const displays = {
  block: 'block',
  inline: 'inline'
} as const;

const buttonTypes = {
  button: 'button',
  submit: 'submit'
} as const;

type Kind = keyof typeof kinds;
type Display = keyof typeof displays;
type ButtonType = keyof typeof buttonTypes;

type StyledButtonProps = {
  kind: Kind;
  display: Display;
};

type SharedButtonProps = {
  /**
   * The visible part of the button, telling the user what
   * the action is
   */
  children?: React.ReactNode;
  /**
      If the button can be activated or not
    */
  disabled?: boolean;
  /**
   * The display type of the button—inline or block
   */
  display?: Display;
  /**
   * SVG icon to place after child content
   */
  iconAfter?: React.ReactNode;
  /**
   * SVG icon to place before child content
   */
  iconBefore?: React.ReactNode;
  /**
   * If the button content is only an SVG icon
   */
  iconOnly?: boolean;
  /**
   * The kind of button - determines how it appears visually
   */
  kind?: Kind;
  /**
   * Specifying an href will use an <a> to link to the URL
   */
  href?: string | null;
  /**
   * An ARIA Label used for accessibility
   */
  'aria-label'?: string | null;
  /**
   * Specifying a to URL will use a react-router Link
   */
  to?: string | null;
  /**
   * If using a button, then type is defines the type of button
   */
  type?: ButtonType;
  /**
   * Allows for IconButton to pass `focusable="false"` as a prop for SVGs.
   * See @types/react > interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T>
   */
  focusable?: boolean | 'true' | 'false';
};

export type ButtonProps = SharedButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> &
  Partial<LinkProps>;

// The '&&&' will increase the specificity of the
// component's CSS so that it overrides the more
// general global styles
const StyledButton = styled.button<StyledButtonProps>`
  &&& {
    font-weight: bold;
    display: ${({ display }) =>
      display === displays.inline ? 'inline-flex' : 'flex'};
    justify-content: center;
    align-items: center;

    width: max-content;
    text-decoration: none;

    color: ${({ kind }) => prop(`Button.${kind}.default.foreground`)};
    background-color: ${({ kind }) =>
      prop(`Button.${kind}.default.background`)};
    cursor: pointer;
    border: 2px solid ${({ kind }) => prop(`Button.${kind}.default.border`)};
    border-radius: 2px;
    padding: ${remSize(8)} ${remSize(25)};
    line-height: 1;

    svg * {
      fill: ${({ kind }) => prop(`Button.${kind}.default.foreground`)};
    }

    &:hover:not(:disabled) {
      color: ${({ kind }) => prop(`Button.${kind}.hover.foreground`)};
      background-color: ${({ kind }) =>
        prop(`Button.${kind}.hover.background`)};
      border-color: ${({ kind }) => prop(`Button.${kind}.hover.border`)};

      svg * {
        fill: ${({ kind }) => prop(`Button.${kind}.hover.foreground`)};
      }
    }

    &:active:not(:disabled) {
      color: ${({ kind }) => prop(`Button.${kind}.active.foreground`)};
      background-color: ${({ kind }) =>
        prop(`Button.${kind}.active.background`)};

      svg * {
        fill: ${({ kind }) => prop(`Button.${kind}.active.foreground`)};
      }
    }

    &:disabled {
      color: ${({ kind }) => prop(`Button.${kind}.disabled.foreground`)};
      background-color: ${({ kind }) =>
        prop(`Button.${kind}.disabled.background`)};
      border-color: ${({ kind }) => prop(`Button.${kind}.disabled.border`)};
      cursor: not-allowed;

      svg * {
        fill: ${({ kind }) => prop(`Button.${kind}.disabled.foreground`)};
      }
    }

    > * + * {
      margin-left: ${remSize(8)};
    }
  }
`;

const StyledInlineButton = styled.button`
  &&& {
    display: flex;
    justify-content: center;
    align-items: center;

    text-decoration: none;

    color: ${prop('primaryTextColor')};
    cursor: pointer;
    border: none;
    line-height: 1;

    svg * {
      fill: ${prop('primaryTextColor')};
    }

    &:disabled {
      cursor: not-allowed;
    }

    > * + * {
      margin-left: ${remSize(8)};
    }
  }
`;

/**
 * A Button performs an primary action
 */
const Button = ({
  children = null,
  display = displays.block,
  href,
  kind = kinds.primary,
  iconBefore = null,
  iconAfter = null,
  iconOnly = false,
  'aria-label': ariaLabel,
  to,
  type = buttonTypes.button,
  ...props
}: ButtonProps) => {
  const hasChildren = React.Children.count(children) > 0;
  const content = (
    <>
      {iconBefore}
      {hasChildren && !iconOnly && <span>{children}</span>}
      {iconAfter}
    </>
  );
  const StyledComponent: React.ElementType = iconOnly
    ? StyledInlineButton
    : StyledButton;

  if (href) {
    return (
      <StyledComponent
        kind={kind}
        display={display}
        as="a"
        aria-label={ariaLabel}
        href={href}
        {...props}
      >
        {content}
      </StyledComponent>
    );
  }

  if (to) {
    return (
      <StyledComponent
        kind={kind}
        display={display}
        as={Link}
        aria-label={ariaLabel}
        to={to}
        {...props}
      >
        {content}
      </StyledComponent>
    );
  }

  return (
    <StyledComponent
      kind={kind}
      display={display}
      aria-label={ariaLabel}
      type={type}
      {...props}
    >
      {content}
    </StyledComponent>
  );
};

Button.kinds = kinds;
Button.displays = displays;

export default Button;
