import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page on initial load', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /sign in/i });
  expect(headingElement).toBeInTheDocument();
});
