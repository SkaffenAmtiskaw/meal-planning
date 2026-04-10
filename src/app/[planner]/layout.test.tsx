import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import Layout from './layout';

vi.mock('@/_models', async () => {
	const { zObjectId } = await import('@/_models/utils/zObjectId');
	return { zObjectId };
});

const mockCheckAuth = vi.fn();
vi.mock('@/_actions', () => ({
	checkAuth: (...args: unknown[]) => mockCheckAuth(...args),
}));

const mockRedirect = vi.fn();
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
	redirect: (...args: unknown[]) => mockRedirect(...args),
	notFound: () => mockNotFound(),
}));

vi.mock('./_components/NavbarServer', () => ({
	NavbarServer: () => null,
}));

vi.mock('./_components', () => ({
	PlannerLayout: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	PlannerProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

const plannerId = '507f1f77bcf86cd799439011';
const params = Promise.resolve({ planner: plannerId });

describe('planner layout', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('redirects to / when unauthenticated', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'unauthenticated' });

		await Layout({ children: null, params });

		expect(mockRedirect).toHaveBeenCalledWith('/');
	});

	test('calls notFound when unauthorized', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'unauthorized' });

		await Layout({ children: null, params });

		expect(mockNotFound).toHaveBeenCalled();
	});

	test('throws when there is a system error', async () => {
		const dbError = new Error('DB connection timeout');
		mockCheckAuth.mockResolvedValue({ type: 'error', error: dbError });

		await expect(Layout({ children: null, params })).rejects.toThrow(
			'DB connection timeout',
		);
	});

	test('renders children when authorized', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'authorized' });

		render(await Layout({ children: "Ursula's Menu", params }));

		expect(screen.getByText("Ursula's Menu")).toBeDefined();
	});

	test('passes planner id to checkAuth', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'authorized' });

		await Layout({ children: null, params });

		expect(mockCheckAuth).toHaveBeenCalledWith(plannerId, 'read');
	});
});
