import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { Stack } from '@mantine/core';

import { AuthLayoutFooter } from './AuthLayoutFooter';

describe('AuthLayoutFooter', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders children', () => {
		render(
			<AuthLayoutFooter>
				<a href="/login">Back to Login</a>
			</AuthLayoutFooter>,
		);

		expect(screen.getByText('Back to Login')).toBeDefined();
	});

	it('centers content (align="center")', () => {
		render(
			<AuthLayoutFooter>
				<div>Footer Content</div>
			</AuthLayoutFooter>,
		);

		expect(vi.mocked(Stack)).toHaveBeenCalledWith(
			expect.objectContaining({
				align: 'center',
			}),
			undefined,
		);
	});
});
