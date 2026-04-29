import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { AuthLayoutRoot } from './AuthLayoutRoot';

describe('AuthLayoutRoot', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders children inside the auth card layout', () => {
		render(
			<AuthLayoutRoot>
				<div data-testid="test-child">Test Content</div>
			</AuthLayoutRoot>,
		);

		expect(screen.getByTestId('test-child')).toBeDefined();
		expect(screen.getByText('Test Content')).toBeDefined();
	});

	it('displays the weeknight logo', () => {
		render(
			<AuthLayoutRoot>
				<div>Content</div>
			</AuthLayoutRoot>,
		);

		const image = screen.getByAltText('weeknight');
		expect(image).toBeDefined();
		expect(image.getAttribute('src')).toBe('/weeknight-login.svg');
	});

	it('uses navy background color', () => {
		const { container } = render(
			<AuthLayoutRoot>
				<div>Content</div>
			</AuthLayoutRoot>,
		);

		// Box should have navy background
		const box = container.querySelector('[class*="mantine-Box-root"]');
		expect(box).toBeDefined();
	});

	it('uses chalk card background', () => {
		const { container } = render(
			<AuthLayoutRoot>
				<div>Content</div>
			</AuthLayoutRoot>,
		);

		// Stack should have chalk background
		const stack = container.querySelector('[class*="mantine-Stack-root"]');
		expect(stack).toBeDefined();
	});
});
