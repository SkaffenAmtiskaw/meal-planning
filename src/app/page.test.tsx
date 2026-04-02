import { redirect } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { addUser } from '@/_actions';
import { auth } from '@/_auth';
import { User } from '@/_models';

import Page from './page';

vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue({}),
}));

vi.mock('next/navigation', () => ({
	redirect: vi.fn().mockImplementation(() => {
		throw new Error('NEXT_REDIRECT');
	}),
}));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn(),
	},
}));

vi.mock('@/_actions', () => ({
	addUser: vi.fn(),
}));

vi.mock('./_components/SignInPrompt', () => ({
	SignInPrompt: () => <div>Sign In Prompt</div>,
}));

const mockSession = {
	user: { email: 'ariel@sea.com' },
};

describe('page', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('renders sign in prompt when there is no session', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

		render(await Page());

		expect(screen.getByText('Sign In Prompt')).toBeDefined();
	});

	test('redirects to existing planner when user already exists', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue({ planners: ['planner-123'] }),
		} as never);

		await expect(Page()).rejects.toThrow('NEXT_REDIRECT');

		expect(redirect).toHaveBeenCalledWith('planner-123/calendar');
	});

	test('creates a new user and redirects when no user exists', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue(null),
		} as never);
		vi.mocked(addUser).mockResolvedValue({
			planners: ['new-planner-456'],
		} as never);

		await expect(Page()).rejects.toThrow('NEXT_REDIRECT');

		expect(addUser).toHaveBeenCalledWith('ariel@sea.com');
		expect(redirect).toHaveBeenCalledWith('new-planner-456/calendar');
	});
});
