import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/_utils/auth';

import { SignInWithNewEmailButton } from './SignInWithNewEmailButton';

const mockPush = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@/_utils/auth', () => ({
	client: {
		signOut: vi.fn(),
	},
}));

describe('SignInWithNewEmailButton', () => {
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

	it('calls signOut and navigates to home when clicked', async () => {
		vi.mocked(client.signOut).mockResolvedValueOnce(undefined);
		render(<SignInWithNewEmailButton />);

		fireEvent.click(screen.getByTestId('sign-in-link'));

		await waitFor(() => {
			expect(client.signOut).toHaveBeenCalledOnce();
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});
});
