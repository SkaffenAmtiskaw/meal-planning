import { redirect } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { addUser } from '@/_actions';
import { auth } from '@/_auth';
import { User, zObjectId } from '@/_models';

import Page from './page';

const mockCookiesGet = vi.hoisted(() => vi.fn());
vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue({}),
	cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
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
	zObjectId: {
		safeParse: vi.fn().mockReturnValue({ success: false }),
	},
}));

vi.mock('@/_actions', () => ({
	addUser: vi.fn(),
}));

vi.mock('./_components/SignInPrompt', () => ({
	SignInPrompt: () => <div>Sign In Prompt</div>,
}));

const mockSession = {
	user: { email: 'ariel@sea.com', name: 'Ariel' },
};

const plannerId = '507f1f77bcf86cd799439011';
const membership = { planner: plannerId, accessLevel: 'owner' };

describe('page', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('renders sign in prompt when there is no session', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

		render(await Page());

		expect(screen.getByText('Sign In Prompt')).toBeDefined();
	});

	test('redirects to first planner when no last-opened cookie', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue({ planners: [membership] }),
		} as never);
		mockCookiesGet.mockReturnValue(undefined);

		await expect(Page()).rejects.toThrow('NEXT_REDIRECT');

		expect(redirect).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});

	test('redirects to last-opened planner when cookie matches a planner', async () => {
		const lastPlannerId = '507f1f77bcf86cd799439022';
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue({
				planners: [
					membership,
					{ planner: lastPlannerId, accessLevel: 'owner' },
				],
			}),
		} as never);
		mockCookiesGet.mockReturnValue({ value: lastPlannerId });
		vi.mocked(zObjectId.safeParse).mockReturnValueOnce({
			success: true,
		} as never);

		await expect(Page()).rejects.toThrow('NEXT_REDIRECT');

		expect(redirect).toHaveBeenCalledWith(`${lastPlannerId}/calendar`);
	});

	test('falls back to first planner when cookie planner is not in user planners', async () => {
		const foreignPlannerId = '507f1f77bcf86cd799439099';
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue({ planners: [membership] }),
		} as never);
		mockCookiesGet.mockReturnValue({ value: foreignPlannerId });
		vi.mocked(zObjectId.safeParse).mockReturnValueOnce({
			success: true,
		} as never);

		await expect(Page()).rejects.toThrow('NEXT_REDIRECT');

		expect(redirect).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});

	test('creates a new user and redirects when no user exists', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue(null),
		} as never);
		vi.mocked(addUser).mockResolvedValue({
			planners: [{ planner: 'new-planner-456', accessLevel: 'owner' }],
		} as never);

		await expect(Page()).rejects.toThrow('NEXT_REDIRECT');

		expect(addUser).toHaveBeenCalledWith('ariel@sea.com', undefined, 'Ariel');
		expect(redirect).toHaveBeenCalledWith('new-planner-456/calendar');
	});
});
