import { redirect } from 'next/navigation';

import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { User } from '@/_models';
import { auth } from '@/auth';

import Page from './page';

vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue({}),
}));

vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
}));

vi.mock('@/auth', () => ({
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

const mockCreatePlannerPrompt = vi.fn((_props: unknown) => null);
vi.mock('./_components/CreatePlannerPrompt', () => ({
	CreatePlannerPrompt: (props: unknown) => mockCreatePlannerPrompt(props),
}));

vi.mock('./_components/SignInPrompt', () => ({
	SignInPrompt: () => <div>Sign In Prompt</div>,
}));

const mockSession = {
	user: { email: 'ariel@sea.com' },
};

describe('page', () => {
	afterEach(() => {
		vi.resetAllMocks();
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

		await Page();

		expect(redirect).toHaveBeenCalledWith('planner-123/calendar');
	});

	test('renders create planner prompt with email when user does not exist', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
		vi.mocked(User.findOne).mockReturnValue({
			exec: vi.fn().mockResolvedValue(null),
		} as never);

		render(await Page());

		expect(mockCreatePlannerPrompt).toHaveBeenCalledWith(
			expect.objectContaining({ email: 'ariel@sea.com' }),
		);
	});
});
