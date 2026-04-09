import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { SignInWithNewEmailButton } from './SignInWithNewEmailButton';

const mockPush = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/_utils/auth', () => ({
	client: {
		signOut: () => mockSignOut(),
	},
}));

describe('SignInWithNewEmailButton', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders sign in link', () => {
		render(<SignInWithNewEmailButton />);

		expect(screen.getByTestId('sign-in-link')).toBeDefined();
	});

	test('calls signOut and navigates to home when clicked', async () => {
		mockSignOut.mockResolvedValueOnce(undefined);
		render(<SignInWithNewEmailButton />);

		fireEvent.click(screen.getByTestId('sign-in-link'));

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalledOnce();
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});
});
