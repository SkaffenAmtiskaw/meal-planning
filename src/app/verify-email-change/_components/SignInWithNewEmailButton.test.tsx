import { MantineProvider } from '@mantine/core';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { SignInWithNewEmailButton } from './SignInWithNewEmailButton';

const mockPush = vi.fn();
const mockSignOut = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/_utils/auth', () => ({
	client: {
		signOut: () => mockSignOut(),
	},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

describe('SignInWithNewEmailButton', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders sign in link', () => {
		render(<SignInWithNewEmailButton />, { wrapper });

		expect(screen.getByTestId('sign-in-link')).toBeDefined();
	});

	test('calls signOut and navigates to home when clicked', async () => {
		mockSignOut.mockResolvedValueOnce(undefined);
		render(<SignInWithNewEmailButton />, { wrapper });

		fireEvent.click(screen.getByTestId('sign-in-link'));

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalledOnce();
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});
});
