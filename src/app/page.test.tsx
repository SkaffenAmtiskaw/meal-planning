import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redirect } from 'next/navigation';

import { auth } from '@/_auth';

import Page from './page';

import { getLastOpenedPlannerId } from './_utils/getLastOpenedPlannerId';
import { getOrCreateUser } from './_utils/getOrCreateUser';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));
vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

const { mockSession, lastOpenedPlannerId, membership } = vi.hoisted(() => ({
	mockSession: { user: { email: 'ariel@sea.com', name: 'Ariel' } },
	lastOpenedPlannerId: '507f1f77bcf86cd799439022',
	membership: { planner: '507f1f77bcf86cd799439011', accessLevel: 'owner' },
}));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn().mockResolvedValue(mockSession),
		},
	},
}));

vi.mock('./_components/SignInPrompt', () => ({
	SignInPrompt: vi.fn(() => <div data-testid="sign-in-prompt" />),
}));

vi.mock('./_components/NoPlannersPrompt', () => ({
	NoPlannersPrompt: vi.fn(() => <div data-testid="no-planners-prompt" />),
}));

vi.mock('./_utils/getLastOpenedPlannerId', () => ({
	getLastOpenedPlannerId: vi.fn(async () => lastOpenedPlannerId),
}));

vi.mock('./_utils/getOrCreateUser', () => ({
	getOrCreateUser: vi.fn(async () => ({ planners: [membership] })),
}));

describe('page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders sign in prompt when there is no session', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

		render(await Page());

		expect(screen.getByTestId('sign-in-prompt')).toBeDefined();
		expect(getOrCreateUser).not.toHaveBeenCalled();
	});

	it('renders the no planners prompt when the user has no planners', async () => {
		vi.mocked(getOrCreateUser).mockResolvedValueOnce({ planners: [] } as never);

		render(await Page());

		expect(screen.getByTestId('no-planners-prompt')).toBeDefined();
		expect(getLastOpenedPlannerId).not.toHaveBeenCalled();
		expect(vi.mocked(redirect)).not.toHaveBeenCalled();
	});

	it("redirects the user to the planner chosen from the user's planners", async () => {
		await Page();

		expect(getOrCreateUser).toHaveBeenCalledWith('ariel@sea.com', 'Ariel');
		expect(getLastOpenedPlannerId).toHaveBeenCalledWith([membership]);
		expect(vi.mocked(redirect)).toHaveBeenCalledWith(
			`/${lastOpenedPlannerId}/calendar`,
		);
	});
});
