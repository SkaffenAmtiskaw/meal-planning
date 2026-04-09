import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import Layout from './layout';

const mockGetUser = vi.fn();
vi.mock('@/_actions', () => ({
	getUser: (...args: unknown[]) => mockGetUser(...args),
}));

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
	redirect: (...args: unknown[]) => mockRedirect(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockHeader = vi.fn<
	(props: { leftSection?: React.ReactNode }) => React.ReactNode
>(({ leftSection }) => <>{leftSection}</>);
vi.mock('@/app/_components/Header', () => ({
	Header: (props: { leftSection?: React.ReactNode }) => mockHeader(props),
}));

vi.mock('./_components/BackButton', () => ({
	BackButton: ({ href }: { href: string }) => (
		<a data-testid="back-button" href={href}>
			back
		</a>
	),
}));

const plannerId = '507f1f77bcf86cd799439011';

describe('settings layout', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('redirects to / when user has no session', async () => {
		mockGetUser.mockRejectedValue(new Error('No Valid Session'));

		await Layout({ children: null });

		expect(mockRedirect).toHaveBeenCalledWith('/');
	});

	test('redirects to / when user has no planners', async () => {
		mockGetUser.mockResolvedValue({ planners: [] });

		await Layout({ children: null });

		expect(mockRedirect).toHaveBeenCalledWith('/');
	});

	test('renders children when user has a planner', async () => {
		mockGetUser.mockResolvedValue({ planners: [plannerId] });

		render(await Layout({ children: 'Settings Content' }));

		expect(screen.getByText('Settings Content')).toBeDefined();
	});

	test('passes back button with correct planner href to Header', async () => {
		mockGetUser.mockResolvedValue({ planners: [plannerId] });

		render(await Layout({ children: null }));

		const backButton = screen.getByTestId('back-button');
		expect(backButton.getAttribute('href')).toBe(`/${plannerId}/calendar`);
	});
});
