import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addUser } from '@/_actions/user';
import { auth } from '@/_auth';
import { User } from '@/_models/user';
import { zObjectId } from '@/_utils/zObjectId';

import Page from './page';

vi.mock('next/headers', async () => await import('@mocks/next/headers'));
vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));
vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

const { mockSession, plannerId, membership } = vi.hoisted(() => {
	const plannerId = '507f1f77bcf86cd799439011';
	return {
		mockSession: { user: { email: 'ariel@sea.com', name: 'Ariel' } },
		plannerId,
		membership: { planner: plannerId, accessLevel: 'owner' },
	};
});

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn().mockResolvedValue(mockSession),
		},
	},
}));

vi.mock('@/_models/user', () => ({
	User: {
		findOne: vi.fn().mockReturnValue({
			exec: vi.fn().mockResolvedValue({ planners: [membership] }),
		}),
	},
}));

vi.mock('@/_utils/zObjectId', () => ({
	zObjectId: {
		safeParse: vi.fn().mockReturnValue({ success: false }),
	},
}));

vi.mock('./_components/SignInPrompt', () => ({
	SignInPrompt: vi.fn(() => <div data-testid="sign-in-prompt" />),
}));

describe('page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders sign in prompt when there is no session', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

		render(await Page({ searchParams: Promise.resolve({}) }));

		expect(screen.getByTestId('sign-in-prompt')).toBeDefined();
	});

	it('redirects to first planner when no last-opened cookie', async () => {
		await Page({ searchParams: Promise.resolve({}) });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});

	it('redirects to last-opened planner when cookie matches a planner', async () => {
		const lastPlannerId = '507f1f77bcf86cd799439022';
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue({
				planners: [
					membership,
					{ planner: lastPlannerId, accessLevel: 'owner' },
				],
			}),
		} as never);
		vi.mocked(cookies).mockResolvedValueOnce({
			get: vi.fn().mockReturnValueOnce({ value: lastPlannerId }),
		} as never);
		vi.mocked(zObjectId.safeParse).mockReturnValueOnce({
			success: true,
		} as never);

		await Page({ searchParams: Promise.resolve({}) });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith(
			`${lastPlannerId}/calendar`,
		);
	});

	it('falls back to first planner when cookie planner is not in user planners', async () => {
		const foreignPlannerId = '507f1f77bcf86cd799439099';
		vi.mocked(cookies).mockResolvedValueOnce({
			get: vi.fn().mockReturnValueOnce({ value: foreignPlannerId }),
		} as never);
		vi.mocked(zObjectId.safeParse).mockReturnValueOnce({
			success: true,
		} as never);

		await Page({ searchParams: Promise.resolve({}) });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});

	it('creates a new user and redirects when no user exists', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(null),
		} as never);

		await Page({ searchParams: Promise.resolve({}) });

		expect(addUser).toHaveBeenCalledWith('ariel@sea.com', undefined, 'Ariel');
		expect(vi.mocked(redirect)).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});
});
