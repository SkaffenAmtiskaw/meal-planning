import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redirect } from 'next/navigation';

import { addUser } from '@/_actions/user';
import { auth } from '@/_auth';
import { users } from '@/_models/database/users';

import Page from './page';

import { getLastOpenedPlannerId } from './_utils/getLastOpenedPlannerId';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));
vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));
vi.mock('@/_actions/user', async () => await import('#mocks/@/_actions/user'));

const { mockSession, plannerId, lastOpenedPlannerId, membership } = vi.hoisted(
	() => {
		const plannerId = '507f1f77bcf86cd799439011';
		return {
			mockSession: { user: { email: 'ariel@sea.com', name: 'Ariel' } },
			plannerId,
			lastOpenedPlannerId: '507f1f77bcf86cd799439022',
			membership: { planner: plannerId, accessLevel: 'owner' },
		};
	},
);

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn().mockResolvedValue(mockSession),
		},
	},
}));

vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);

vi.mock('./_components/SignInPrompt', () => ({
	SignInPrompt: vi.fn(() => <div data-testid="sign-in-prompt" />),
}));

vi.mock('./_utils/getLastOpenedPlannerId', () => ({
	getLastOpenedPlannerId: vi.fn(async () => lastOpenedPlannerId),
}));

describe('page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(users.findOne).mockResolvedValue({
			planners: [membership],
		} as never);
	});

	it('renders sign in prompt when there is no session', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

		render(await Page({ searchParams: Promise.resolve({}) }));

		expect(screen.getByTestId('sign-in-prompt')).toBeDefined();
	});

	it("redirects an existing user to the planner chosen from the user's planners", async () => {
		await Page({ searchParams: Promise.resolve({}) });

		expect(getLastOpenedPlannerId).toHaveBeenCalledWith([membership]);
		expect(vi.mocked(redirect)).toHaveBeenCalledWith(
			`${lastOpenedPlannerId}/calendar`,
		);
	});

	it('creates a new user and redirects when no user exists', async () => {
		vi.mocked(users.findOne).mockResolvedValueOnce(null as never);

		await Page({ searchParams: Promise.resolve({}) });

		expect(addUser).toHaveBeenCalledWith('ariel@sea.com', undefined, 'Ariel');
		expect(vi.mocked(redirect)).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});
});
