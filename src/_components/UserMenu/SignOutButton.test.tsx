import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { SignOutButton } from './SignOutButton';

const { mockPush, mockSignOut } = vi.hoisted(() => ({
	mockPush: vi.fn(),
	mockSignOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/_utils/auth', () => ({
	client: { signOut: mockSignOut },
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('SignOutButton', () => {
	test('renders sign-out button with label', () => {
		render(<SignOutButton />);
		expect(screen.getByTestId('sign-out-button')).toBeDefined();
		expect(screen.getByText('Log Out')).toBeDefined();
	});

	test('clicking calls signOut and redirects to /', async () => {
		mockSignOut.mockResolvedValueOnce(undefined);
		render(<SignOutButton />);
		fireEvent.click(screen.getByTestId('sign-out-button'));
		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalledOnce();
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});
});
