import { redirect } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import Layout from './layout';

const mockCookiesGet = vi.hoisted(() => vi.fn());
vi.mock('next/headers', () => ({
	cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}));

const mockGetUser = vi.fn();
vi.mock('@/_actions', () => ({
	getUser: (...args: unknown[]) => mockGetUser(...args),
}));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_models', () => ({
	zObjectId: {
		safeParse: (value: unknown) => ({
			success: typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value),
			data: value,
		}),
	},
}));

vi.mock('@/app/_components/Header', () => ({
	Header: ({ leftSection }: { leftSection?: React.ReactNode }) =>
		leftSection || null,
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
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('redirects to / when user has no session', async () => {
		mockGetUser.mockRejectedValue(new Error('No Valid Session'));

		await Layout({ children: null });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
	});

	it('redirects to / when user has no planners', async () => {
		mockGetUser.mockResolvedValue({ planners: [] });

		await Layout({ children: null });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
	});

	it('back button uses first planner when no last-opened cookie', async () => {
		mockGetUser.mockResolvedValue({
			planners: [{ planner: plannerId, accessLevel: 'owner' }],
		});
		mockCookiesGet.mockReturnValue(undefined);

		render(await Layout({ children: null }));

		expect(screen.getByTestId('back-button').getAttribute('href')).toBe(
			`/${plannerId}/calendar`,
		);
	});

	it('back button uses last-opened planner when cookie matches a planner', async () => {
		mockGetUser.mockResolvedValue({
			planners: [
				{ planner: plannerId, accessLevel: 'owner' },
				{ planner: otherPlannerId, accessLevel: 'owner' },
			],
		});
		mockCookiesGet.mockReturnValue({ value: otherPlannerId });

		render(await Layout({ children: null }));

		expect(screen.getByTestId('back-button').getAttribute('href')).toBe(
			`/${otherPlannerId}/calendar`,
		);
	});

	it('back button falls back to first planner when cookie planner not in user planners', async () => {
		const foreignPlannerId = '507f1f77bcf86cd799439099';
		mockGetUser.mockResolvedValue({
			planners: [{ planner: plannerId, accessLevel: 'owner' }],
		});
		mockCookiesGet.mockReturnValue({ value: foreignPlannerId });

		render(await Layout({ children: null }));

		expect(screen.getByTestId('back-button').getAttribute('href')).toBe(
			`/${plannerId}/calendar`,
		);
	});
});
