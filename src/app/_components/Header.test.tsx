import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { Header } from './Header';

vi.mock('@mantine/core', async () => {
	const actual = await import('@mocks/@mantine/core');
	return {
		...actual,
		Image: ({ src, alt, ...props }: { src?: string; alt?: string }) => (
			// biome-ignore lint/performance/noImgElement: this is a unit test who cares
			<img src={src} alt={alt} data-testid={`image-${alt}`} {...props} />
		),
	};
});

vi.mock('@/_components/UserMenu', () => ({
	UserMenu: () => <div data-testid="user-menu" />,
}));

describe('Header', () => {
	test('renders user menu by default', () => {
		render(<Header />);
		expect(screen.getByTestId('user-menu')).toBeDefined();
	});

	test('renders leftSection when provided', () => {
		render(<Header leftSection={<div data-testid="left-section" />} />);
		expect(screen.getByTestId('left-section')).toBeDefined();
	});

	test('renders without leftSection', () => {
		render(<Header />);
		expect(screen.queryByTestId('left-section')).toBeNull();
	});

	test('renders rightSection when provided', () => {
		render(<Header rightSection={<div data-testid="right-section" />} />);
		expect(screen.getByTestId('right-section')).toBeDefined();
		expect(screen.queryByTestId('user-menu')).toBeNull();
	});

	test('renders user menu when rightSection is not provided', () => {
		render(<Header />);
		expect(screen.getByTestId('user-menu')).toBeDefined();
	});

	test('renders both leftSection and rightSection when both are provided', () => {
		render(
			<Header
				leftSection={<div data-testid="left-section" />}
				rightSection={<div data-testid="right-section" />}
			/>,
		);
		expect(screen.getByTestId('left-section')).toBeDefined();
		expect(screen.getByTestId('right-section')).toBeDefined();
		expect(screen.queryByTestId('user-menu')).toBeNull();
	});
});
