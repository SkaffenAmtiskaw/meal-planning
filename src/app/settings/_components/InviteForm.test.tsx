import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InviteForm } from './InviteForm';

vi.mock('@mantine/core', async (_importOriginal) => {
	const actual = await import('@mocks/@mantine/core');
	return {
		...actual,
		TextInput: vi.fn(
			({
				value,
				onChange,
				onKeyDown,
				label,
				placeholder,
			}: {
				value?: string;
				onChange?: React.ChangeEventHandler<HTMLInputElement>;
				onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
				label?: string;
				placeholder?: string;
			}) => (
				<input
					data-testid={`input-${label}`}
					type="text"
					value={value ?? ''}
					placeholder={placeholder}
					onChange={onChange}
					onKeyDown={onKeyDown}
				/>
			),
		),
	};
});

vi.mock('@/_components', () => ({
	FormFeedbackAlert: ({
		status,
		errorMessage,
	}: {
		status: string;
		errorMessage?: string | null;
	}) =>
		status === 'error' ? (
			<div data-testid="form-feedback-alert">{errorMessage}</div>
		) : null,
}));

describe('InviteForm', () => {
	const defaultProps = {
		status: 'idle' as const,
		error: null,
		onInvite: vi.fn(),
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders email input and invite button', () => {
		render(<InviteForm {...defaultProps} />);
		expect(screen.getByTestId('input-Email address')).toBeDefined();
		expect(screen.getByTestId('invite-button')).toBeDefined();
	});

	it('disables invite button when email is empty', () => {
		render(<InviteForm {...defaultProps} />);
		const button = screen.getByTestId('invite-button');
		expect(button).toHaveProperty('disabled', true);
	});

	it('disables invite button for invalid email format', () => {
		render(<InviteForm {...defaultProps} />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: 'notanemail' } });
		const button = screen.getByTestId('invite-button');
		expect(button).toHaveProperty('disabled', true);
	});

	it('disables invite button for email missing domain', () => {
		render(<InviteForm {...defaultProps} />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: 'test@' } });
		const button = screen.getByTestId('invite-button');
		expect(button).toHaveProperty('disabled', true);
	});

	it('disables invite button for email starting with @', () => {
		render(<InviteForm {...defaultProps} />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: '@test.com' } });
		const button = screen.getByTestId('invite-button');
		expect(button).toHaveProperty('disabled', true);
	});

	it('disables invite button when status is loading', () => {
		render(<InviteForm {...defaultProps} status="loading" />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		const button = screen.getByTestId('invite-button');
		expect(button).toHaveProperty('disabled', true);
	});

	it('calls onInvite with email when submitted', () => {
		const onInvite = vi.fn();
		render(<InviteForm {...defaultProps} onInvite={onInvite} />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		const button = screen.getByTestId('invite-button');
		fireEvent.click(button);
		expect(onInvite).toHaveBeenCalledWith('test@example.com');
	});

	it('clears input after successful invite', () => {
		const { rerender } = render(<InviteForm {...defaultProps} />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		rerender(<InviteForm {...defaultProps} status="success" />);
		expect(input).toHaveProperty('value', '');
	});

	it('shows error alert when status is error', () => {
		render(
			<InviteForm
				{...defaultProps}
				status="error"
				error="Failed to send invite"
			/>,
		);
		expect(screen.getByTestId('form-feedback-alert')).toBeDefined();
		expect(screen.getByText('Failed to send invite')).toBeDefined();
	});

	it('shows success message when status is success', () => {
		render(<InviteForm {...defaultProps} status="success" />);
		expect(screen.getByTestId('success-alert')).toBeDefined();
		expect(screen.getByText('Invitation sent successfully')).toBeDefined();
	});

	it('submits on Enter key press', () => {
		const onInvite = vi.fn();
		render(<InviteForm {...defaultProps} onInvite={onInvite} />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onInvite).toHaveBeenCalledWith('test@example.com');
	});

	it('does not call onInvite when button is disabled via click', () => {
		const onInvite = vi.fn();
		render(<InviteForm {...defaultProps} onInvite={onInvite} />);
		// Try to submit with empty email (button should be disabled)
		const button = screen.getByTestId('invite-button');
		fireEvent.click(button);
		expect(onInvite).not.toHaveBeenCalled();
	});

	it('does not call onInvite when button is disabled via Enter key', () => {
		const onInvite = vi.fn();
		render(<InviteForm {...defaultProps} onInvite={onInvite} />);
		const input = screen.getByTestId('input-Email address');
		// Empty email, so button is disabled - Enter should not submit
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onInvite).not.toHaveBeenCalled();
	});

	it('does not submit on non-Enter key press', () => {
		const onInvite = vi.fn();
		render(<InviteForm {...defaultProps} onInvite={onInvite} />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		fireEvent.keyDown(input, { key: 'Escape' });
		expect(onInvite).not.toHaveBeenCalled();
	});

	it('does not clear input when status changes to non-success', () => {
		const { rerender } = render(<InviteForm {...defaultProps} />);
		const input = screen.getByTestId('input-Email address');
		fireEvent.change(input, { target: { value: 'test@example.com' } });
		rerender(<InviteForm {...defaultProps} status="error" />);
		expect(input).toHaveProperty('value', 'test@example.com');
	});
});
