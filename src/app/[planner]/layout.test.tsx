import { notFound, redirect } from 'next/navigation';

import { render } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { PlannerProvider } from './_components';

const { mockCheckAuth, mockGetUser } = vi.hoisted(() => ({
	mockCheckAuth: vi.fn(),
	mockGetUser: vi.fn(),
}));

vi.mock('@/_utils/zObjectId', async () => {
	const { z } = await import('zod');
	return {
		zObjectId: z.string(),
	};
});

vi.mock('@/_actions/auth', () => ({
	checkAuth: (...args: unknown[]) => mockCheckAuth(...args),
}));

vi.mock('@/_actions/user', () => ({
	getUser: () => mockGetUser(),
}));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

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

import Layout from './layout';

const plannerId = '507f1f77bcf86cd799439011';
const params = Promise.resolve({ planner: plannerId });

describe('planner layout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ email: 'test@example.com' });
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

	test('passes planner id to checkAuth', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner',
		});

		await Layout({ children: null, params });

		expect(mockCheckAuth).toHaveBeenCalledWith(plannerId, 'read');
	});

	test('passes accessLevel to PlannerProvider when authorized', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner',
		});

		render(await Layout({ children: null, params }));

		const calls = vi.mocked(PlannerProvider).mock.calls;
		expect(calls[0][0]).toEqual(
			expect.objectContaining({ accessLevel: 'owner' }),
		);
	});
});
