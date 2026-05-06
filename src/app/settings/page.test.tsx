import { redirect } from 'next/navigation';

import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsPage from './page';

const { mockGetSession } = vi.hoisted(() => ({
	mockGetSession: vi.fn(),
}));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: mockGetSession,
		},
	},
}));

vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('./_components/UserSettings', () => ({
	UserSettings: vi.fn(() => null),
}));

vi.mock('./_components/PlannerList', () => ({
	PlannerList: vi.fn(() => null),
}));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const session = { user: { email: 'user@example.com' } };

describe('SettingsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('redirects to home when no session', async () => {
		mockGetSession.mockResolvedValueOnce(null);

		await SettingsPage();

		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
	});

	it('renders without errors when session exists', async () => {
		mockGetSession.mockResolvedValueOnce(session);

		const { container } = render(await SettingsPage());

		expect(container).toBeTruthy();
	});
});
