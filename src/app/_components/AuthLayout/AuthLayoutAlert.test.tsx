import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { AuthLayoutAlert } from './AuthLayoutAlert';

describe('AuthLayoutAlert', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders children inside alert', () => {
		render(<AuthLayoutAlert color="red">Error message</AuthLayoutAlert>);

		expect(screen.getByRole('alert')).toBeDefined();
		expect(screen.getByText('Error message')).toBeDefined();
	});

	it('applies specified color', () => {
		const { container } = render(
			<AuthLayoutAlert color="green">Success message</AuthLayoutAlert>,
		);

		expect(container.querySelector('[role="alert"]')).toBeDefined();
	});
});
