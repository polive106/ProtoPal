// @vitest-environment jsdom
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('div', props),
    Text: (props: any) => React.createElement('span', props),
    Pressable: ({ testID, onPress, children, ...props }: any) =>
      React.createElement('div', { 'data-testid': testID, onClick: onPress, ...props }, children),
  };
});

vi.mock('@acme/design-system-mobile', () => {
  const React = require('react');
  return {
    Card: ({ children, ...props }: any) => React.createElement('div', props, children),
    CardHeader: ({ children, ...props }: any) => React.createElement('div', props, children),
    CardTitle: ({ children, ...props }: any) => React.createElement('div', props, children),
    CardContent: ({ children, ...props }: any) => React.createElement('div', props, children),
    CardFooter: ({ children, ...props }: any) => React.createElement('div', props, children),
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from './NoteCard';

describe('NoteCard', () => {
  const defaultProps = {
    id: '1',
    title: 'Test Note',
    content: 'This is the content of the test note with some extra text',
    updatedAt: '2024-06-15T10:30:00Z',
    onPress: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and content', () => {
    render(<NoteCard {...defaultProps} />);
    expect(screen.getByText('Test Note')).toBeDefined();
    expect(screen.getByText(defaultProps.content)).toBeDefined();
  });

  it('renders formatted date', () => {
    render(<NoteCard {...defaultProps} />);
    const dateText = new Date(defaultProps.updatedAt).toLocaleDateString();
    expect(screen.getByText(dateText)).toBeDefined();
  });

  it('has correct testID', () => {
    render(<NoteCard {...defaultProps} />);
    expect(screen.getByTestId('notes-card-1')).toBeDefined();
  });

  it('calls onPress when pressed', () => {
    render(<NoteCard {...defaultProps} />);
    fireEvent.click(screen.getByTestId('notes-card-1'));
    expect(defaultProps.onPress).toHaveBeenCalledWith('1');
  });
});
