import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

const { mockCheckAuth, mockRedirect, mockNotFound, mockGetUser } = vi.hoisted(
	() => ({
		mockCheckAuth: vi.fn(),
		mockRedirect: vi.fn(),
		mockNotFound: vi.fn(),
		mockGetUser: vi.fn(),
	}),
);

vi.mock('@/_models', async () => {
	const { zObjectId } = await import('@/_models/utils/zObjectId');
	return { zObjectId };
});

vi.mock('@/_actions', () => ({
	checkAuth: (...args: unknown[]) => mockCheckAuth(...args),
	getUser: () => mockGetUser(),
}));

vi.mock('next/navigation', () => ({
	redirect: (...args: unknown[]) => mockRedirect(...args),
	notFound: () => mockNotFound(),
}));

vi.mock('@/app/_components/Header', () => ({
	Header: ({ children }: { children?: React.ReactNode }) => children || null,
}));

const plannerProviderCalls: unknown[] = [];
vi.mock('./_components', async () => {
	const React = await import('react');
	const mp = vi.fn(
		({
			children,
			...props
		}: {
			children: React.ReactNode;
			accessLevel: string;
		}) => {
			plannerProviderCalls.push(props);
			return React.createElement(React.Fragment, null, children);
		},
	);
	return {
		PlannerLayout: ({ children }: { children: React.ReactNode }) =>
			React.createElement(React.Fragment, null, children),
		PlannerProvider: mp,
		BurgerToggle: () => null,
		ToggleContext: {
			Provider: ({ children }: { children: React.ReactNode }) =>
				React.createElement(React.Fragment, null, children),
		},
		NavbarServer: () => null,
	};
});

import Layout from './layout';

const plannerId = '507f1f77bcf86cd799439011';
const params = Promise.resolve({ planner: plannerId });

describe('planner layout', () => {
	afterEach(() => {
		plannerProviderCalls.length = 0;
		mockGetUser.mockResolvedValue({ email: 'test@example.com' });
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
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner',
		});

		render(await Layout({ children: "Ursula's Menu", params }));

		expect(screen.getByText("Ursula's Menu")).toBeDefined();
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

		expect(plannerProviderCalls).toContainEqual(
			expect.objectContaining({ accessLevel: 'owner' }),
		);
	});
});
