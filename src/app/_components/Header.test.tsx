import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { Header } from './Header';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_components/UserMenu', () => ({
	UserMenu: () => <div data-testid="user-menu" />,
}));

describe('Header', () => {
	test('renders UserMenu when no rightSection is provided', () => {
		render(<Header />);
		expect(screen.getByTestId('user-menu')).toBeDefined();
	});

	test('renders rightSection instead of UserMenu when provided', () => {
		render(<Header rightSection={<div data-testid="right-section" />} />);
		expect(screen.getByTestId('right-section')).toBeDefined();
		expect(screen.queryByTestId('user-menu')).toBeNull();
	});
});
