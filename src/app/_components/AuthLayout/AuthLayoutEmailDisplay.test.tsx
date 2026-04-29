import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { AuthLayoutEmailDisplay } from './AuthLayoutEmailDisplay';

describe('AuthLayoutEmailDisplay', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('displays the email address', () => {
		render(<AuthLayoutEmailDisplay email="user@example.com" />);

		expect(screen.getByText('user@example.com')).toBeDefined();
	});

	it('shows change email button when onChangeEmail provided', () => {
		render(
			<AuthLayoutEmailDisplay
				email="user@example.com"
				onChangeEmail={() => {}}
			/>,
		);

		expect(screen.getByText('Change email')).toBeDefined();
	});

	it('does not show change email button when onChangeEmail not provided', () => {
		const { container } = render(
			<AuthLayoutEmailDisplay email="user@example.com" />,
		);

		expect(
			container.querySelector('[data-testid="change-email-btn"]'),
		).toBeNull();
	});

	it('calls onChangeEmail when change email button clicked', async () => {
		const onChangeEmail = vi.fn();
		render(
			<AuthLayoutEmailDisplay
				email="user@example.com"
				onChangeEmail={onChangeEmail}
				data-testid="email-display"
			/>,
		);

		await fireEvent.click(screen.getByText('Change email'));
		expect(onChangeEmail).toHaveBeenCalledTimes(1);
	});
});
