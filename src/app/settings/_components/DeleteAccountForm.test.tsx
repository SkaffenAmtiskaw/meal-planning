import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteAccount } from '@/_actions/user';
import { client } from '@/_utils/auth';

import { DeleteAccountForm } from './DeleteAccountForm';

const mockPush = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@/_actions/user', () => ({
	deleteAccount: vi.fn(),
}));

vi.mock('@/_utils/auth', () => ({
	client: {
		signOut: vi.fn(),
	},
}));

describe('DeleteAccountForm', () => {
	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('delete button is disabled when input is empty', () => {
		render(<DeleteAccountForm />);

		const button = screen.getByTestId('delete-account-button');
		expect(button).toHaveProperty('disabled', true);
	});

	it('delete button is disabled when input is not DELETE', () => {
		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'delete' },
		});

		const button = screen.getByTestId('delete-account-button');
		expect(button).toHaveProperty('disabled', true);
	});

	it('delete button is enabled when input is DELETE', () => {
		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'DELETE' },
		});

		const button = screen.getByTestId('delete-account-button');
		expect(button).toHaveProperty('disabled', false);
	});

	it('calls deleteAccount on submit', async () => {
		vi.mocked(deleteAccount).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		vi.mocked(client.signOut).mockResolvedValueOnce(undefined);

		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'DELETE' },
		});
		fireEvent.click(screen.getByTestId('delete-account-button'));

		await waitFor(() => {
			expect(deleteAccount).toHaveBeenCalledOnce();
		});
	});

	it('signs out and redirects to / on success', async () => {
		vi.mocked(deleteAccount).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		vi.mocked(client.signOut).mockResolvedValueOnce(undefined);

		render(<DeleteAccountForm />);

		fireEvent.change(screen.getByTestId('delete-confirmation-input'), {
			target: { value: 'DELETE' },
		});
		fireEvent.click(screen.getByTestId('delete-account-button'));

		await waitFor(() => {
			expect(client.signOut).toHaveBeenCalledOnce();
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});

	it('shows error alert when action returns error', async () => {
		vi.mocked(deleteAccount).mockResolvedValueOnce({
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

	it('does not sign out or redirect on error', async () => {
		vi.mocked(deleteAccount).mockResolvedValueOnce({
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

		expect(client.signOut).not.toHaveBeenCalled();
		expect(mockPush).not.toHaveBeenCalled();
	});
});
