import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthCard } from './AuthCard';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('AuthCard', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders children inside the card', () => {
		render(
			<AuthCard>
				<div data-testid="test-child">Test Content</div>
			</AuthCard>,
		);

		expect(screen.getByTestId('test-child')).toBeDefined();
		expect(screen.getByText('Test Content')).toBeDefined();
	});

	it('renders the logo image', () => {
		render(
			<AuthCard>
				<div>Content</div>
			</AuthCard>,
		);

		const image = screen.getByAltText('weeknight');
		expect(image).toBeDefined();
		expect(image.getAttribute('src')).toBe('/weeknight-login.svg');
	});

	it('renders logo image with correct dimensions', () => {
		render(
			<AuthCard>
				<div>Content</div>
			</AuthCard>,
		);

		const image = screen.getByAltText('weeknight');
		expect(image.getAttribute('width')).toBe('200');
		expect(image.getAttribute('height')).toBe('50');
	});
});
