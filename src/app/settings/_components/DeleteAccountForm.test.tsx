import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { DeleteAccountForm } from './DeleteAccountForm';

const mockPush = vi.fn();
const mockDeleteAccount = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/_actions/user', () => ({
	deleteAccount: () => mockDeleteAccount(),
}));

vi.mock('@/_utils/auth', () => ({
	client: {
		signOut: () => mockSignOut(),
	},
}));

describe('DeleteAccountForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders the confirmation input', () => {
		render(<DeleteAccountForm />);

		expect(screen.getByTestId('delete-confirmation-input')).toBeDefined();
	});

	test('delete button is disabled when input is empty', () => {
		render(<DeleteAccountForm />);

		const button = screen.getByTestId('delete-account-button');
		expect(button).toHaveProperty('disabled', true);
	});

	test('delete button is disabled when input is not DELETE', () => {
		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'delete' },
		});

		const button = screen.getByTestId('delete-account-button');
		expect(button).toHaveProperty('disabled', true);
	});

	test('delete button is enabled when input is DELETE', () => {
		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'DELETE' },
		});

		const button = screen.getByTestId('delete-account-button');
		expect(button).toHaveProperty('disabled', false);
	});

	test('calls deleteAccount on submit', async () => {
		mockDeleteAccount.mockResolvedValueOnce({ ok: true, data: undefined });
		mockSignOut.mockResolvedValueOnce(undefined);

		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'DELETE' },
		});
		fireEvent.click(screen.getByTestId('delete-account-button'));

		await waitFor(() => {
			expect(mockDeleteAccount).toHaveBeenCalledOnce();
		});
	});

	test('signs out and redirects to / on success', async () => {
		mockDeleteAccount.mockResolvedValueOnce({ ok: true, data: undefined });
		mockSignOut.mockResolvedValueOnce(undefined);

		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'DELETE' },
		});
		fireEvent.click(screen.getByTestId('delete-account-button'));

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalledOnce();
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});

	test('shows error alert when action returns error', async () => {
		mockDeleteAccount.mockResolvedValueOnce({
			ok: false,
			error: 'User not found.',
		});

		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'DELETE' },
		});
		fireEvent.click(screen.getByTestId('delete-account-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'User not found.',
			);
		});
	});

	test('does not sign out or redirect on error', async () => {
		mockDeleteAccount.mockResolvedValueOnce({
			ok: false,
			error: 'User not found.',
		});

		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'DELETE' },
		});
		fireEvent.click(screen.getByTestId('delete-account-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert')).toBeDefined();
		});

		expect(mockSignOut).not.toHaveBeenCalled();
		expect(mockPush).not.toHaveBeenCalled();
	});
});
