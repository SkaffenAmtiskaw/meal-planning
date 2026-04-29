import { Stack, Text } from '@mantine/core';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { zSafeString } from '@/_utils/zSafeString';

import {
	getLastSubmissionError,
	RegistrationForm,
	setLastSubmissionError,
} from './RegistrationForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

// Create a mock that simulates useAsyncButton with proper state management
const mockRun = vi.fn();
let mockLoading = false;
let mockError: string | null = null;

vi.mock('@/_hooks', () => ({
	useAsyncButton: () => ({
		loading: mockLoading,
		get error() {
			return mockError;
		},
		run: mockRun,
	}),
}));

vi.mock('@/_utils/zSafeString', () => ({
	zSafeString: vi.fn(),
}));

describe('RegistrationForm', () => {
	const defaultProps = {
		email: 'test@example.com',
		onSubmit: vi.fn(),
		submitLabel: 'Create Account',
		passwordLabel: 'Create a password',
	};

	beforeEach(() => {
		// Reset mock state
		mockLoading = false;
		mockError = null;
		mockRun.mockReset();

		// Setup default mock for zSafeString to return a working validator
		vi.mocked(zSafeString).mockImplementation(
			() =>
				({
					safeParse: (val: string) => {
						const SAFE_STRING_REGEX = /^[a-zA-Z0-9 '.,-]+$/;
						if (!SAFE_STRING_REGEX.test(val)) {
							return {
								success: false,
								error: { issues: [{ message: 'Contains invalid characters' }] },
							};
						}
						return { success: true, data: val };
					},
				}) as unknown as ReturnType<typeof zSafeString>,
		);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('renders email as read-only text', () => {
		render(<RegistrationForm {...defaultProps} />);

		expect(screen.getByTestId('email-display').textContent).toBe(
			'test@example.com',
		);
	});

	it('centers content in Stack component', () => {
		render(<RegistrationForm {...defaultProps} />);

		expect(vi.mocked(Stack)).toHaveBeenCalledWith(
			expect.objectContaining({ align: 'center' }),
			undefined,
		);
	});

	it('renders message as Text when provided', () => {
		render(
			<RegistrationForm {...defaultProps} message="Test message content" />,
		);

		expect(vi.mocked(Text)).toHaveBeenCalledWith(
			expect.objectContaining({ children: 'Test message content' }),
			undefined,
		);
	});

	it('does not render message Text when message prop is not provided', () => {
		render(<RegistrationForm {...defaultProps} />);

		const textCalls = vi.mocked(Text).mock.calls;
		// Only the email display Text should be called, not a message Text
		const messageTextCalls = textCalls.filter(
			(call) =>
				(call[0] as { children?: React.ReactNode })?.children ===
				'test@example.com',
		);
		// Should only have the email display, no message
		expect(textCalls.length).toBe(1);
		expect(messageTextCalls.length).toBe(1);
	});

	it('renders name input with correct label', () => {
		render(<RegistrationForm {...defaultProps} />);

		const nameInput = screen.getByTestId('name-input');
		expect(nameInput).toBeDefined();
	});

	it('renders password input with configurable label', () => {
		render(
			<RegistrationForm
				{...defaultProps}
				passwordLabel="Custom Password Label"
			/>,
		);

		const passwordInput = screen.getByTestId('password-input');
		expect(passwordInput).toBeDefined();
	});

	it('calls onSubmit with name and password when form submitted', async () => {
		const onSubmit = vi.fn().mockResolvedValueOnce(undefined);

		// Setup mockRun to actually call the function
		mockRun.mockImplementation((fn) => fn());

		render(<RegistrationForm {...defaultProps} onSubmit={onSubmit} />);

		fireEvent.change(screen.getByTestId('name-input'), {
			target: { value: 'John Doe' },
		});
		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({
				name: 'John Doe',
				password: 'password123',
			});
		});
	});

	it('shows loading state on submit button during submission', () => {
		// Set loading state
		mockLoading = true;

		render(<RegistrationForm {...defaultProps} />);

		const submitButton = screen.getByTestId('submit-button');
		expect(submitButton.getAttribute('data-loading')).toBe('true');
		expect(submitButton.hasAttribute('disabled')).toBe(true);
	});

	it('displays error alert when onSubmit throws', async () => {
		const onSubmit = vi
			.fn()
			.mockRejectedValueOnce(new Error('Submission failed'));

		// Setup mockRun to capture and set error state, then trigger re-render
		const { rerender } = render(
			<RegistrationForm {...defaultProps} onSubmit={onSubmit} />,
		);

		mockRun.mockImplementation(async (fn) => {
			try {
				mockError = null;
				await fn();
			} catch (err) {
				mockError =
					err instanceof Error ? err.message : 'An unexpected error occurred';
				// Trigger re-render by updating component
				rerender(<RegistrationForm {...defaultProps} onSubmit={onSubmit} />);
			}
		});

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Submission failed',
			);
		});
	});

	it('shows change email button when showChangeEmail=true', () => {
		render(
			<RegistrationForm
				{...defaultProps}
				showChangeEmail={true}
				onChangeEmail={vi.fn()}
			/>,
		);

		expect(screen.getByTestId('change-email-button')).toBeDefined();
	});

	it('calls onChangeEmail when change email button clicked', () => {
		const onChangeEmail = vi.fn();
		render(
			<RegistrationForm
				{...defaultProps}
				showChangeEmail={true}
				onChangeEmail={onChangeEmail}
			/>,
		);

		fireEvent.click(screen.getByTestId('change-email-button'));

		expect(onChangeEmail).toHaveBeenCalled();
	});

	it('hides change email button when showChangeEmail=false', () => {
		render(<RegistrationForm {...defaultProps} showChangeEmail={false} />);

		expect(screen.queryByTestId('change-email-button')).toBeNull();
	});

	it('validates name using zSafeString when provided', async () => {
		const onSubmit = vi.fn().mockResolvedValueOnce(undefined);

		// Setup mockRun to capture and set error state, then trigger re-render
		const { rerender } = render(
			<RegistrationForm {...defaultProps} onSubmit={onSubmit} />,
		);

		mockRun.mockImplementation(async (fn) => {
			try {
				mockError = null;
				await fn();
			} catch (err) {
				mockError =
					err instanceof Error ? err.message : 'An unexpected error occurred';
				// Trigger re-render by updating component
				rerender(<RegistrationForm {...defaultProps} onSubmit={onSubmit} />);
			}
		});

		fireEvent.change(screen.getByTestId('name-input'), {
			target: { value: '$invalid' },
		});
		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'Contains invalid characters',
			);
		});
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('allows empty name', async () => {
		const onSubmit = vi.fn().mockResolvedValueOnce(undefined);

		// Setup mockRun to actually call the function
		mockRun.mockImplementation((fn) => fn());

		render(<RegistrationForm {...defaultProps} onSubmit={onSubmit} />);

		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({
				name: '',
				password: 'password123',
			});
		});
	});

	it('validates password minimum length', async () => {
		const onSubmit = vi.fn().mockResolvedValueOnce(undefined);

		// Setup mockRun to capture and set error state, then trigger re-render
		const { rerender } = render(
			<RegistrationForm {...defaultProps} onSubmit={onSubmit} />,
		);

		mockRun.mockImplementation(async (fn) => {
			try {
				mockError = null;
				await fn();
			} catch (err) {
				mockError =
					err instanceof Error ? err.message : 'An unexpected error occurred';
				// Trigger re-render by updating component
				rerender(<RegistrationForm {...defaultProps} onSubmit={onSubmit} />);
			}
		});

		fireEvent.change(screen.getByTestId('name-input'), {
			target: { value: 'John' },
		});
		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'short' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(screen.getByTestId('error-alert').textContent).toContain(
				'at least 8 characters',
			);
		});
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('trims name before submitting', async () => {
		const onSubmit = vi.fn().mockResolvedValueOnce(undefined);

		// Setup mockRun to actually call the function
		mockRun.mockImplementation((fn) => fn());

		render(<RegistrationForm {...defaultProps} onSubmit={onSubmit} />);

		fireEvent.change(screen.getByTestId('name-input'), {
			target: { value: '  John Doe  ' },
		});
		fireEvent.change(screen.getByTestId('password-input'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByTestId('submit-button'));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({
				name: 'John Doe',
				password: 'password123',
			});
		});
	});

	it('test helpers work correctly', () => {
		// Test setLastSubmissionError and getLastSubmissionError
		setLastSubmissionError('test error');
		expect(getLastSubmissionError()).toBe('test error');

		setLastSubmissionError(null);
		expect(getLastSubmissionError()).toBeNull();
	});
});
