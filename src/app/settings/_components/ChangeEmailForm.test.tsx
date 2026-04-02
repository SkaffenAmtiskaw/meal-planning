import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { ChangeEmailForm } from './ChangeEmailForm';

const mockRefresh = vi.fn();
const mockRequestEmailChange = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/_actions/user', () => ({
	requestEmailChange: (email: string) => mockRequestEmailChange(email),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

const futureDate = new Date(Date.now() + 1000 * 60 * 60);
const pastDate = new Date(Date.now() - 1000 * 60 * 60);

describe('ChangeEmailForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('displays current email', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		expect(screen.getByTestId('current-email').textContent).toBe(
			'user@example.com',
		);
	});

	test('shows change email button', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		expect(screen.getByTestId('change-email-button')).toBeDefined();
	});

	test('does not show pending alert when no pending change', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		expect(screen.queryByTestId('pending-email-alert')).toBeNull();
	});

	test('shows pending alert when pending change is active', () => {
		render(
			<ChangeEmailForm
				currentEmail="user@example.com"
				pendingEmailChange={{ email: 'new@example.com', expiresAt: futureDate }}
			/>,
			{ wrapper },
		);

		const alert = screen.getByTestId('pending-email-alert');
		expect(alert.textContent).toContain('new@example.com');
	});

	test('does not show pending alert when pending change is expired', () => {
		render(
			<ChangeEmailForm
				currentEmail="user@example.com"
				pendingEmailChange={{ email: 'new@example.com', expiresAt: pastDate }}
			/>,
			{ wrapper },
		);

		expect(screen.queryByTestId('pending-email-alert')).toBeNull();
	});

	test('shows form when change email button is clicked', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));

		expect(screen.getByTestId('new-email-input')).toBeDefined();
		expect(screen.getByTestId('submit-email-change-button')).toBeDefined();
		expect(screen.getByTestId('cancel-email-change-button')).toBeDefined();
	});

	test('hides form when cancel is clicked', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.click(screen.getByTestId('cancel-email-change-button'));

		expect(screen.queryByTestId('new-email-input')).toBeNull();
		expect(screen.getByTestId('change-email-button')).toBeDefined();
	});

	test('updates new email input value', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.change(screen.getByTestId('new-email-input'), {
			target: { value: 'new@example.com' },
		});

		expect(
			(screen.getByTestId('new-email-input') as HTMLInputElement).value,
		).toBe('new@example.com');
	});

	test('calls requestEmailChange with new email on submit', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.change(screen.getByTestId('new-email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(mockRequestEmailChange).toHaveBeenCalledWith('new@example.com');
		});
	});

	test('hides form and calls router.refresh on success', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(screen.queryByTestId('new-email-input')).toBeNull();
			expect(mockRefresh).toHaveBeenCalledOnce();
		});
	});

	test('shows success message with new email when no previous request', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.change(screen.getByTestId('new-email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			const alert = screen.getByTestId('success-alert');
			expect(alert.textContent).toContain('new@example.com');
			expect(alert.textContent).not.toContain(
				'Any previous request has been cancelled.',
			);
		});
	});

	test('shows success message with cancellation notice when previous request existed', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: true },
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.change(screen.getByTestId('new-email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			const alert = screen.getByTestId('success-alert');
			expect(alert.textContent).toContain('new@example.com');
			expect(alert.textContent).toContain(
				'Any previous request has been cancelled.',
			);
		});
	});

	test('shows error alert when action returns error', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: false,
			error: 'An account with that email already exists.',
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'An account with that email already exists.',
			);
		});
	});

	test('does not call router.refresh on error', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: false,
			error: 'Some error',
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />, { wrapper });

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert')).toBeDefined();
		});

		expect(mockRefresh).not.toHaveBeenCalled();
	});
});
