import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import Layout from './layout';

const mockCookiesGet = vi.hoisted(() => vi.fn());
vi.mock('next/headers', () => ({
	cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}));

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
const otherPlannerId = '507f1f77bcf86cd799439022';

describe('settings layout', () => {
	afterEach(() => {
		vi.clearAllMocks();
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
		mockCookiesGet.mockReturnValue(undefined);

		render(await Layout({ children: 'Settings Content' }));

		expect(screen.getByText('Settings Content')).toBeDefined();
	});

	test('back button uses first planner when no last-opened cookie', async () => {
		mockGetUser.mockResolvedValue({ planners: [plannerId] });
		mockCookiesGet.mockReturnValue(undefined);

		render(await Layout({ children: null }));

		const backButton = screen.getByTestId('back-button');
		expect(backButton.getAttribute('href')).toBe(`/${plannerId}/calendar`);
	});

	test('back button uses last-opened planner when cookie matches a planner', async () => {
		mockGetUser.mockResolvedValue({
			planners: [plannerId, otherPlannerId],
		});
		mockCookiesGet.mockReturnValue({ value: otherPlannerId });

		render(await Layout({ children: null }));

		const backButton = screen.getByTestId('back-button');
		expect(backButton.getAttribute('href')).toBe(`/${otherPlannerId}/calendar`);
	});

	test('back button falls back to first planner when cookie planner not in user planners', async () => {
		const foreignPlannerId = '507f1f77bcf86cd799439099';
		mockGetUser.mockResolvedValue({ planners: [plannerId] });
		mockCookiesGet.mockReturnValue({ value: foreignPlannerId });

		render(await Layout({ children: null }));

		const backButton = screen.getByTestId('back-button');
		expect(backButton.getAttribute('href')).toBe(`/${plannerId}/calendar`);
	});
});
