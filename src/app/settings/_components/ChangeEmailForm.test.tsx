import { useRouter } from 'next/navigation';

import { useDisclosure } from '@mantine/hooks';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestEmailChange } from '@/_actions/user';

import { ChangeEmailForm } from './ChangeEmailForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@/_actions/user', async () => ({
	requestEmailChange: vi.fn(),
}));

const mockRequestEmailChange = vi.mocked(requestEmailChange);
const mockUseDisclosure = vi.mocked(useDisclosure);

const mockRefresh = vi.fn();

beforeAll(() => {
	const defaultRouter = vi.mocked(useRouter)();
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
		mockUseDisclosure.mockReturnValue([
			false,
			{ open: vi.fn(), close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);
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

	it('shows change email button when form is closed', () => {
		render(<ChangeEmailForm currentEmail="user@example.com" />);

		expect(screen.getByTestId('change-email-button')).toBeDefined();
	});

	it('calls open when change email button is clicked', () => {
		const open = vi.fn();
		mockUseDisclosure.mockReturnValue([
			false,
			{ open, close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);
		fireEvent.click(screen.getByTestId('change-email-button'));

		expect(open).toHaveBeenCalled();
	});

	it('shows form when useDisclosure is open', () => {
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: vi.fn(), close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);

		expect(screen.getByTestId('new-email-input')).toBeDefined();
		expect(screen.getByTestId('submit-email-change-button')).toBeDefined();
		expect(screen.getByTestId('cancel-email-change-button')).toBeDefined();
	});

	it('calls close when cancel is clicked', () => {
		const close = vi.fn();
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: vi.fn(), close, toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);
		fireEvent.click(screen.getByTestId('cancel-email-change-button'));

		expect(close).toHaveBeenCalled();
	});

	it('calls requestEmailChange with new email on submit', () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: vi.fn(), close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);
		fireEvent.change(screen.getByTestId('new-email-input'), {
			target: { value: 'new@example.com' },
		});
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		expect(mockRequestEmailChange).toHaveBeenCalledWith('new@example.com');
	});

	it('calls close and router.refresh on success', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		const close = vi.fn();
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: vi.fn(), close, toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(close).toHaveBeenCalled();
			expect(mockRefresh).toHaveBeenCalledOnce();
		});
	});

	it('shows success message with new email when no previous request', async () => {
		mockRequestEmailChange.mockResolvedValueOnce({
			ok: true,
			data: { hadPreviousRequest: false },
		});
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: vi.fn(), close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);
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
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: vi.fn(), close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);
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
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: vi.fn(), close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);
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
		mockUseDisclosure.mockReturnValue([
			true,
			{ open: vi.fn(), close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);

		render(<ChangeEmailForm currentEmail="user@example.com" />);
		fireEvent.click(screen.getByTestId('submit-email-change-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert')).toBeDefined();
		});

		expect(mockRefresh).not.toHaveBeenCalled();
	});
});
