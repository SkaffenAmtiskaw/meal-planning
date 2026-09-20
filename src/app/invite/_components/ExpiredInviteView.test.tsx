import { useRouter } from 'next/navigation';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ExpiredInviteView } from './ExpiredInviteView';

const mockPush = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

describe('ExpiredInviteView', () => {
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
