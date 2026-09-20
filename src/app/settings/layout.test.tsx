import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '@/_actions/user';

import Layout from './layout';

vi.mock('next/headers', async () => await import('@mocks/next/headers'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

vi.mock('@/_utils/catchify', () => ({
	catchify: vi.fn(async (fn: () => Promise<unknown>) => {
		try {
			return [await fn()];
		} catch (e) {
			return [undefined, e];
		}
	}),
}));

vi.mock('@/_utils/zObjectId', () => ({
	zObjectId: {
		safeParse: (value: unknown) => ({
			success: typeof value === 'string',
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
		vi.mocked(getUser).mockRejectedValueOnce(new Error('No Valid Session'));

		await Layout({ children: null });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
	});

	it('redirects to / when user has no planners', async () => {
		vi.mocked(getUser).mockResolvedValueOnce({ planners: [] } as never);

		await Layout({ children: null });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
	});

	it('back button uses first planner when no last-opened cookie', async () => {
		vi.mocked(getUser).mockResolvedValueOnce({
			planners: [{ planner: plannerId, accessLevel: 'owner' }],
		} as never);

		render(await Layout({ children: null }));

		expect(screen.getByTestId('back-button').getAttribute('href')).toBe(
			`/${plannerId}/calendar`,
		);
	});

	it('back button uses last-opened planner when cookie matches a planner', async () => {
		vi.mocked(getUser).mockResolvedValueOnce({
			planners: [
				{ planner: plannerId, accessLevel: 'owner' },
				{ planner: otherPlannerId, accessLevel: 'owner' },
			],
		} as never);

		vi.mocked(cookies).mockResolvedValueOnce({
			get: vi.fn().mockReturnValue({ value: otherPlannerId }),
		} as never);

		render(await Layout({ children: null }));

		expect(screen.getByTestId('back-button').getAttribute('href')).toBe(
			`/${otherPlannerId}/calendar`,
		);
	});

	it('back button falls back to first planner when cookie planner not in user planners', async () => {
		const foreignPlannerId = '507f1f77bcf86cd799439099';
		vi.mocked(getUser).mockResolvedValueOnce({
			planners: [{ planner: plannerId, accessLevel: 'owner' }],
		} as never);

		vi.mocked(cookies).mockResolvedValueOnce({
			get: vi.fn().mockReturnValue({ value: foreignPlannerId }),
		} as never);

		render(await Layout({ children: null }));

		expect(screen.getByTestId('back-button').getAttribute('href')).toBe(
			`/${plannerId}/calendar`,
		);
	});
});
