import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChangeEmailForm } from './ChangeEmailForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

const mockRefresh = vi.fn();

const mockRequestEmailChange = vi.hoisted(() => vi.fn());

vi.mock('@/_actions/user', () => ({
	requestEmailChange: mockRequestEmailChange,
}));

const defaultRouter = {
	push: vi.fn(),
	replace: vi.fn(),
	refresh: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	prefetch: vi.fn(),
};

beforeAll(() => {
	vi.mocked(useRouter).mockReturnValue({
		...defaultRouter,
		refresh: mockRefresh,
	});
});

const futureDate = new Date(Date.now() + 1000 * 60 * 60);
const pastDate = new Date(Date.now() - 1000 * 60 * 60);

describe('ChangeEmailForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not show pending alert when no pending change', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />);

		expect(screen.queryByTestId('pending-email-alert')).toBeNull();
	});

	it('shows pending alert when pending change is active', () => {
		render(
			<ChangeEmailForm
				currentEmail="user@example.com"
				pendingEmailChange={{ email: 'new@example.com', expiresAt: futureDate }}
			/>,
		);

		const alert = screen.getByTestId('pending-email-alert');
		expect(alert.textContent).toContain('new@example.com');
	});

	it('does not show pending alert when pending change is expired', () => {
		render(
			<ChangeEmailForm
				currentEmail="user@example.com"
				pendingEmailChange={{ email: 'new@example.com', expiresAt: pastDate }}
			/>,
		);

		expect(screen.queryByTestId('pending-email-alert')).toBeNull();
	});

	it('shows form when change email button is clicked', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />);

		fireEvent.click(screen.getByTestId('change-email-button'));

		expect(screen.getByTestId('new-email-input')).toBeDefined();
		expect(screen.getByTestId('submit-email-change-button')).toBeDefined();
		expect(screen.getByTestId('cancel-email-change-button')).toBeDefined();
	});

	it('hides form when cancel is clicked', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />);

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.click(screen.getByTestId('cancel-email-change-button'));

		expect(screen.queryByTestId('new-email-input')).toBeNull();
		expect(screen.getByTestId('change-email-button')).toBeDefined();
	});

	it('calls requestEmailChange with new email on submit', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />);

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.change(screen.getByTestId('new-email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(mockRequestEmailChange).toHaveBeenCalledWith('new@example.com');
		});
	});

	it('hides form and calls router.refresh on success', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />);

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(screen.queryByTestId('new-email-input')).toBeNull();
			expect(mockRefresh).toHaveBeenCalledOnce();
		});
	});

	it('shows success message with new email when no previous request', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />);

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

	it('shows success message with cancellation notice when previous request existed', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: true },
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />);

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

	it('shows error alert when action returns error', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: false,
			error: 'An account with that email already exists.',
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />);

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'An account with that email already exists.',
			);
		});
	});

	it('does not call router.refresh on error', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: false,
			error: 'Some error',
		});
		render(<ChangeEmailForm currentEmail="user@example.com" />);

		fireEvent.click(screen.getByTestId('change-email-button'));
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert')).toBeDefined();
		});

		expect(mockRefresh).not.toHaveBeenCalled();
	});
});
