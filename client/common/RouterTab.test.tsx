import React from 'react';
import { render, screen, fireEvent, waitFor, history } from '../test-utils';
import Tab from './RouterTab';

const mockPath = '/projects';
const mockLinkText = 'Projects';

describe('Tab', () => {
  function rerender() {
    return render(<Tab to={mockPath}>{mockLinkText}</Tab>);
  }

  it('renders a react-router NavLink with correct text and path', async () => {
    rerender();

    const linkElement = screen.getByText(mockLinkText);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute('href')).toBe(mockPath);

    fireEvent.click(linkElement);
    await waitFor(() => expect(history.location.pathname).toEqual('/projects'));
  });

  it('includes the dashboard-header class names', () => {
    const { container } = rerender();

    const listItem = container.querySelector('li');
    const link = container.querySelector('a');

    expect(listItem).toHaveClass('dashboard-header__tab');
    expect(link).toHaveClass('dashboard-header__tab__title');
  });
});
