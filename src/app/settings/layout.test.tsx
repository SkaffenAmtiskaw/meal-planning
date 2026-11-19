import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redirect } from 'next/navigation';

import { getUser } from '@/_actions/user';
import { reportError } from '@/_reporting/reportError';
import { getLastOpenedPlannerId } from '@/app/_utils/getLastOpenedPlannerId';

import Layout from './layout';

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('@/_actions/user', async () => await import('#mocks/@/_actions/user'));

vi.mock('@/_utils/catchify', () => ({
	catchify: vi.fn(async (fn: () => Promise<unknown>) => {
		try {
			return [await fn()];
		} catch (e) {
			return [undefined, e];
		}
	}),
}));

vi.mock(
	'@/_reporting/reportError',
	async () => await import('#mocks/@/_reporting/reportError'),
);

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

const { lastOpenedPlannerId } = vi.hoisted(() => ({
	lastOpenedPlannerId: '507f1f77bcf86cd799439022',
}));

vi.mock('@/app/_utils/getLastOpenedPlannerId', () => ({
	getLastOpenedPlannerId: vi.fn(async () => lastOpenedPlannerId),
}));

const plannerId = '507f1f77bcf86cd799439011';

describe('settings layout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('redirects to / when user has no session', async () => {
		vi.mocked(getUser).mockRejectedValueOnce(new Error('No Valid Session'));

		await Layout({ children: null });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
		expect(reportError).not.toHaveBeenCalled();
	});

	it('redirects to /, and reports, when getting the user fails', async () => {
		const error = new Error('DB connection timeout');
		vi.mocked(getUser).mockRejectedValueOnce(error);

		await Layout({ children: null });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('redirects to / when user has no planners', async () => {
		vi.mocked(getUser).mockResolvedValueOnce({ planners: [] } as never);

		await Layout({ children: null });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
	});

	it("back button goes to the planner chosen from the user's planners", async () => {
		const planners = [{ planner: plannerId, accessLevel: 'owner' }];
		vi.mocked(getUser).mockResolvedValueOnce({ planners } as never);

		render(await Layout({ children: null }));

		expect(getLastOpenedPlannerId).toHaveBeenCalledWith(planners);
		expect(screen.getByTestId('back-button').getAttribute('href')).toBe(
			`/${lastOpenedPlannerId}/calendar`,
		);
	});
});
