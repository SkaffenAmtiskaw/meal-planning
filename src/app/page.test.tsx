import { redirect } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { addUser } from '@/_actions';
import { auth } from '@/_auth';
import { User, zObjectId } from '@/_models';

import Page from './page';

const mockCookiesGet = vi.hoisted(() => vi.fn());
vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue({}),
	cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

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

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn().mockReturnValue({
			exec: vi.fn().mockResolvedValue({ planners: [membership] }),
		}),
	},
	zObjectId: {
		safeParse: vi.fn().mockReturnValue({ success: false }),
	},
}));

vi.mock('@/_actions', () => ({
	addUser: vi.fn().mockResolvedValue({
		planners: [{ planner: 'fallback-planner', accessLevel: 'owner' }],
	}),
}));

const mockSignInPrompt = vi.fn();
vi.mock('./_components/SignInPrompt', () => ({
	SignInPrompt: (props: unknown) => {
		mockSignInPrompt(props);
		return <div>Sign In Prompt</div>;
	},
}));

describe('page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('renders sign in prompt when there is no session', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

		render(await Page({ searchParams: Promise.resolve({}) }));

		expect(screen.getByText('Sign In Prompt')).toBeDefined();
	});

	test('redirects to first planner when no last-opened cookie', async () => {
		mockCookiesGet.mockReturnValue(undefined);

		await Page({ searchParams: Promise.resolve({}) });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});

	test('redirects to last-opened planner when cookie matches a planner', async () => {
		const lastPlannerId = '507f1f77bcf86cd799439022';
		vi.mocked(User.findOne).mockReturnValueOnce({
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

		await Page({ searchParams: Promise.resolve({}) });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith(
			`${lastPlannerId}/calendar`,
		);
	});

	test('falls back to first planner when cookie planner is not in user planners', async () => {
		const foreignPlannerId = '507f1f77bcf86cd799439099';
		mockCookiesGet.mockReturnValue({ value: foreignPlannerId });
		vi.mocked(zObjectId.safeParse).mockReturnValueOnce({
			success: true,
		} as never);

		await Page({ searchParams: Promise.resolve({}) });

		expect(vi.mocked(redirect)).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});

	test('creates a new user and redirects when no user exists', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(null),
		} as never);
		vi.mocked(addUser).mockResolvedValueOnce({
			planners: [{ planner: 'new-planner-456', accessLevel: 'owner' }],
		} as never);

		await Page({ searchParams: Promise.resolve({}) });

		expect(addUser).toHaveBeenCalledWith('ariel@sea.com', undefined, 'Ariel');
		expect(vi.mocked(redirect)).toHaveBeenCalledWith(
			'new-planner-456/calendar',
		);
	});
});
