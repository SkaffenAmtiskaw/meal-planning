import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { notFound, redirect } from 'next/navigation';

import { checkAuth } from '@/_actions/auth/checkAuth';

import { PlannerProvider } from './_components';

const mockCheckAuth = vi.mocked(checkAuth);

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock('@/app/_components/Header', () => ({
	Header: ({ children }: { children?: React.ReactNode }) => children || null,
}));

vi.mock('./_components', async () => {
	const React = await import('react');
	return {
		PlannerLayout: ({ children }: { children: React.ReactNode }) =>
			React.createElement(React.Fragment, null, children),
		PlannerProvider: vi.fn(() => null),
		BurgerToggle: () => null,
	};
});

vi.mock('./_components/NavbarServer', () => ({
	NavbarServer: () => null,
}));

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('./_utils/getCookieTimeZone', () => ({
	getCookieTimeZone: vi.fn(async () => null),
}));

import Layout from './layout';

const plannerId = '507f1f77bcf86cd799439011';
const params = Promise.resolve({ planner: plannerId });

describe('planner layout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('redirects to / when unauthenticated', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'unauthenticated' });

		await Layout({ children: null, params });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
	});

	test('calls notFound when unauthorized', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'unauthorized' });

		await Layout({ children: null, params });

		expect(vi.mocked(notFound)).toHaveBeenCalled();
	});

	test('throws when there is a system error', async () => {
		const dbError = new Error('DB connection timeout');
		mockCheckAuth.mockResolvedValue({ type: 'error', error: dbError });

		await expect(Layout({ children: null, params })).rejects.toThrow(
			'DB connection timeout',
		);
	});

	test('rejects a malformed planner id without checking auth', async () => {
		await expect(
			Layout({
				children: null,
				params: Promise.resolve({ planner: 'zzzzzzzzzzzzzzzzzzzzzzzz' }),
			}),
		).rejects.toThrow('Id is invalid');

		expect(mockCheckAuth).not.toHaveBeenCalled();
	});

	test('passes planner id to checkAuth', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner',
		} as never);

		await Layout({ children: null, params });

		expect(mockCheckAuth).toHaveBeenCalledWith(plannerId, 'read');
	});

	test('passes accessLevel to PlannerProvider when authorized', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner',
		} as never);

		render(await Layout({ children: null, params }));

		const calls = vi.mocked(PlannerProvider).mock.calls;
		expect(calls[0][0]).toEqual(
			expect.objectContaining({ accessLevel: 'owner' }),
		);
	});
});
