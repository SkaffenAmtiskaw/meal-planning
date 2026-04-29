import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { SignInPrompt } from './SignInPrompt';

vi.mock('@/_components', () => ({
	AuthCard: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SignIn: () => <button type="button">Sign In</button>,
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('sign in prompt', () => {
	test('renders the sign in message', () => {
		render(<SignInPrompt />);

		expect(
			screen.getByText('In order to use the meal planner, you must sign in.'),
		).toBeDefined();
	});

	test('renders the sign in button', () => {
		render(<SignInPrompt />);

		expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
	});
});
