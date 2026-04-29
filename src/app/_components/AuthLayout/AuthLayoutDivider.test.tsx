import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { Divider } from '@mantine/core';

import { AuthLayoutDivider } from './AuthLayoutDivider';

describe('AuthLayoutDivider', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders divider without label', () => {
		render(<AuthLayoutDivider />);

		// Divider should be rendered (mock renders a div with hr)
		expect(vi.mocked(Divider)).toHaveBeenCalled();
		expect(screen.getByRole('separator')).toBeDefined();
	});

	it('renders divider with label when provided', () => {
		render(<AuthLayoutDivider label="or continue with" />);

		expect(screen.getByTestId('divider-label')).toBeDefined();
		expect(screen.getByText('or continue with')).toBeDefined();
	});

	it('passes label to Mantine Divider', () => {
		render(<AuthLayoutDivider label="Test Label" />);

		expect(vi.mocked(Divider)).toHaveBeenCalledWith(
			expect.objectContaining({
				label: 'Test Label',
			}),
			undefined,
		);
	});
});
