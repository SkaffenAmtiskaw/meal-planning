import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { AuthLayoutSubmitButton } from './AuthLayoutSubmitButton';

describe('AuthLayoutSubmitButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders children as button text', () => {
		render(<AuthLayoutSubmitButton>Continue</AuthLayoutSubmitButton>);

		expect(screen.getByRole('button', { name: 'Continue' })).toBeDefined();
	});

	it('shows loading state when loading is true', () => {
		render(<AuthLayoutSubmitButton loading>Continue</AuthLayoutSubmitButton>);

		const button = screen.getByRole('button');
		expect(button.hasAttribute('disabled')).toBe(true);
		expect(button.getAttribute('data-loading')).toBe('true');
	});

	it('calls onClick when clicked', async () => {
		const onClick = vi.fn();
		render(
			<AuthLayoutSubmitButton onClick={onClick}>
				Continue
			</AuthLayoutSubmitButton>,
		);

		await fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('supports type prop', () => {
		render(
			<AuthLayoutSubmitButton type="submit">Continue</AuthLayoutSubmitButton>,
		);

		const button = screen.getByRole('button');
		expect(button.getAttribute('type')).toBe('submit');
	});
});
