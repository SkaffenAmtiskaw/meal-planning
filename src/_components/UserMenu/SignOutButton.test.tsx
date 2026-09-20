import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/_utils/auth';

import { SignOutButton } from './SignOutButton';

const mockPush = vi.fn();

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_utils/auth', () => ({
	client: { signOut: vi.fn() },
}));

describe('SignOutButton', () => {
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

	it('clicking calls signOut and redirects to /', async () => {
		vi.mocked(client.signOut).mockResolvedValueOnce(undefined);
		render(<SignOutButton />);
		fireEvent.click(screen.getByTestId('sign-out-button'));
		await waitFor(() => {
			expect(client.signOut).toHaveBeenCalledOnce();
			expect(mockPush).toHaveBeenCalledWith('/');
		});
	});
});
