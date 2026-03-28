import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { client } from '@/_utils/auth';

import { SignIn } from './SignIn';

vi.mock('@/_utils/auth', () => ({
	client: {
		signIn: {
			social: vi.fn(),
		},
	},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

describe('sign in', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders sign in button', () => {
		render(<SignIn />, { wrapper });

		expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
	});

	test('clicking the button initiates google sign in', () => {
		render(<SignIn />, { wrapper });

		fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

		expect(client.signIn.social).toHaveBeenCalledWith({ provider: 'google' });
	});
});
