import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { Text } from '@mantine/core';

import { AuthLayoutHeader } from './AuthLayoutHeader';

describe('AuthLayoutHeader', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders children', () => {
		render(<AuthLayoutHeader>Header Content</AuthLayoutHeader>);

		expect(screen.getByText('Header Content')).toBeDefined();
	});

	it('has center alignment (ta="center")', () => {
		render(<AuthLayoutHeader>Header Content</AuthLayoutHeader>);

		expect(vi.mocked(Text)).toHaveBeenCalledWith(
			expect.objectContaining({
				ta: 'center',
			}),
			undefined,
		);
	});
});
