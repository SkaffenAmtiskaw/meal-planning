import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { NavLink } from './NavLink';

vi.mock('next/font/google', () => ({
	Inter: () => ({ className: 'mock-inter-class' }),
}));

vi.mock('@mantine/core', async () => {
	const actual = await import('@mocks/@mantine/core');
	return {
		...actual,
		NavLink: ({
			label,
			href,
			active,
			leftSection,
		}: {
			label: string;
			href: string;
			active?: boolean;
			leftSection?: React.ReactNode;
		}) => (
			<a href={href} data-active={active ? 'true' : undefined}>
				{leftSection}
				{label}
			</a>
		),
	};
});

describe('NavLink', () => {
	test('renders label', () => {
		render(<NavLink label="Test Link" href="/test" />);
		expect(screen.getByText('Test Link')).toBeDefined();
	});

	test('applies active state', () => {
		render(<NavLink label="Active Link" href="/test" active />);
		expect(screen.getByText('Active Link').getAttribute('data-active')).toBe(
			'true',
		);
	});

	test('renders left section when provided', () => {
		render(
			<NavLink
				label="With Icon"
				href="/test"
				leftSection={<span data-testid="icon">🎯</span>}
			/>,
		);
		expect(screen.getByTestId('icon')).toBeDefined();
	});

	test('renders without left section', () => {
		const { container } = render(<NavLink label="No Icon" href="/test" />);
		expect(container.querySelector('span[data-testid="icon"]')).toBeNull();
	});
});
