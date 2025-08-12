import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import '@testing-library/jest-dom';
import SkipLink from './SkipLink';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('SkipLink', () => {
  const defaultProps = {
    targetId: 'main-content',
    text: 'goToMain'
  };

  test('renders with correct href and text', () => {
    render(<SkipLink {...defaultProps} />);
    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveTextContent('SkipLink.goToMain');
  });

  test('adds "focus" class on focus and removes it on blur', () => {
    render(<SkipLink {...defaultProps} />);
    const link = screen.getByRole('link');

    expect(link.className).toBe('skip_link');

    fireEvent.focus(link);
    expect(link.className).toContain('focus');

    fireEvent.blur(link);
    expect(link.className).toBe('skip_link');
  });
});
