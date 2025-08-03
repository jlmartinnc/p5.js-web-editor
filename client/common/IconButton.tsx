import React, { ComponentType } from 'react';
import styled from 'styled-components';
import Button, { ButtonProps } from './Button';
import { remSize } from '../theme';

const ButtonWrapper = styled(Button)`
  width: ${remSize(48)};
  > svg {
    width: 100%;
    height: 100%;
  }
`;

export type IconButtonProps = Omit<
  ButtonProps,
  'iconBefore' | 'display' | 'focusable'
> & {
  icon?: ComponentType<{ 'aria-label'?: string }> | null;
};

const IconButton = ({ icon: Icon, ...otherProps }: IconButtonProps) => (
  <ButtonWrapper
    iconBefore={Icon ? <Icon /> : undefined}
    iconOnly
    display={Button.displays.inline}
    focusable="false"
    {...otherProps}
  />
);

export default IconButton;
