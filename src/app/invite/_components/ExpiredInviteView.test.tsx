'use client';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExpiredInviteView } from './ExpiredInviteView';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('ExpiredInviteView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders expired alert with correct message', () => {
		render(<ExpiredInviteView email="test@example.com" />);

		const alert = screen.getByTestId('expired-alert');
		expect(alert).toBeDefined();
		expect(alert.textContent).toContain('This invite has expired');
	});

	it('displays email in the message', () => {
		const email = 'test@example.com';
		render(<ExpiredInviteView email={email} />);

		const message = screen.getByTestId('expired-message');
		expect(message).toBeDefined();
		expect(message.textContent).toContain(email);
		expect(message.textContent).toContain(
			'You can still create an account or sign in with',
		);
	});

	it('renders continue button', () => {
		render(<ExpiredInviteView email="test@example.com" />);

		const button = screen.getByTestId('continue-button');
		expect(button).toBeDefined();
		expect(button.textContent).toBe('Continue to Sign In');
	});

	it('redirects to /?email=<encoded> when button clicked', () => {
		const email = 'test@example.com';
		render(<ExpiredInviteView email={email} />);

		const button = screen.getByTestId('continue-button');
		fireEvent.click(button);

		expect(mockPush).toHaveBeenCalledWith(
			`/?email=${encodeURIComponent(email)}`,
		);
	});

	it('properly encodes special characters in email', () => {
		const email = 'test+special@example.com';
		render(<ExpiredInviteView email={email} />);

		const button = screen.getByTestId('continue-button');
		fireEvent.click(button);

		expect(mockPush).toHaveBeenCalledWith(
			`/?email=${encodeURIComponent(email)}`,
		);
	});
});
