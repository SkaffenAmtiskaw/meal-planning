import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LinkButton } from './LinkButton';

// Mock next/link
vi.mock('next/link', () => ({
	default: vi.fn(
		({ href, children }: { href: string; children: React.ReactNode }) => (
			<a href={href} data-testid="next-link">
				{children}
			</a>
		),
	),
}));

// Mock @mantine/core Button
vi.mock('@mantine/core', async () => {
	const actual =
		await vi.importActual<typeof import('@mantine/core')>('@mantine/core');
	return {
		...actual,
		Button: vi.fn(
			({
				children,
				component: Component,
				href,
				...props
			}: {
				children?: React.ReactNode;
				component?:
					| React.ComponentType<{ href: string; children: React.ReactNode }>
					| string;
				href?: string;
				[key: string]: unknown;
			}) => {
				// When component is provided (like Next.js Link), render with that component
				if (Component && typeof Component !== 'string') {
					return <Component href={href ?? ''}>{children}</Component>;
				}
				// Otherwise render as button or anchor
				if (href) {
					return (
						<a href={href} {...props}>
							{children}
						</a>
					);
				}
				return (
					<button type="button" {...props}>
						{children}
					</button>
				);
			},
		),
	};
});

describe('LinkButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders with href prop', () => {
		render(<LinkButton href="/test-path">Click Me</LinkButton>);

		expect(screen.getByText('Click Me')).toBeDefined();
	});

	it('uses Next.js Link as the component', () => {
		render(<LinkButton href="/dashboard">Dashboard</LinkButton>);

		// The Button should receive Link as its component prop
		const linkElement = screen.getByTestId('next-link');
		expect(linkElement).toBeDefined();
		expect(linkElement.getAttribute('href')).toBe('/dashboard');
	});

	it('passes href to the underlying Link component', () => {
		render(<LinkButton href="/settings">Settings</LinkButton>);

		const linkElement = screen.getByTestId('next-link');
		expect(linkElement.getAttribute('href')).toBe('/settings');
	});

	it('renders children correctly', () => {
		render(<LinkButton href="/home">Home Page</LinkButton>);

		expect(screen.getByText('Home Page')).toBeDefined();
	});

	it('passes through Button props like variant and color', () => {
		render(
			<LinkButton href="/styled" variant="filled" color="blue">
				Styled Button
			</LinkButton>,
		);

		// The component should render successfully with extra props
		expect(screen.getByText('Styled Button')).toBeDefined();
	});

	it('passes through disabled prop', () => {
		render(
			<LinkButton href="/disabled" disabled>
				Disabled Link
			</LinkButton>,
		);

		expect(screen.getByText('Disabled Link')).toBeDefined();
	});
});
