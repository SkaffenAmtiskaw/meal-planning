import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { Stack } from '@mantine/core';

import { AuthLayoutSocialSection } from './AuthLayoutSocialSection';

describe('AuthLayoutSocialSection', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders children', () => {
		render(
			<AuthLayoutSocialSection>
				<button type="button" data-testid="social-button">
					Social Login
				</button>
			</AuthLayoutSocialSection>,
		);

		expect(screen.getByTestId('social-button')).toBeDefined();
		expect(screen.getByText('Social Login')).toBeDefined();
	});

	it('has proper spacing (gap="sm")', () => {
		render(
			<AuthLayoutSocialSection>
				<div>Child Content</div>
			</AuthLayoutSocialSection>,
		);

		expect(vi.mocked(Stack)).toHaveBeenCalledWith(
			expect.objectContaining({
				gap: 'sm',
			}),
			undefined,
		);
	});
});
