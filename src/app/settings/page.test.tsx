import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

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
	UserSettings: ({ email }: { email: string }) => (
		<div data-testid="user-settings" data-email={email} />
	),
}));

vi.mock('./_components/PlannerList', () => ({
	PlannerList: () => <div data-testid="planner-list" />,
}));

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
	redirect: (...args: unknown[]) => mockRedirect(...args),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const session = { user: { email: 'user@example.com' } };

describe('SettingsPage', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('redirects to home when no session', async () => {
		mockGetSession.mockResolvedValueOnce(null);

		await SettingsPage();

		expect(mockRedirect).toHaveBeenCalledWith('/');
	});

	test('renders User Settings and Planner Settings tabs', async () => {
		mockGetSession.mockResolvedValueOnce(session);

		render(await SettingsPage());

		const tabs = screen.getAllByRole('tab');
		expect(tabs).toHaveLength(2);
		expect(tabs[0].textContent).toBe('User Settings');
		expect(tabs[1].textContent).toBe('Planner Settings');
	});

	test('renders UserSettings with the session email', async () => {
		mockGetSession.mockResolvedValueOnce(session);

		render(await SettingsPage());

		const userSettings = screen.getByTestId('user-settings');
		expect(userSettings.getAttribute('data-email')).toBe('user@example.com');
	});

	test('renders PlannerList in the Planner Settings tab', async () => {
		mockGetSession.mockResolvedValueOnce(session);

		render(await SettingsPage());

		expect(screen.getByTestId('planner-list')).toBeDefined();
	});
});
