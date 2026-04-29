import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { SubmitButton } from './SubmitButton';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('SubmitButton', () => {
	test('renders label in idle state and is enabled', () => {
		render(<SubmitButton status="idle" countdown={0} label="Save Recipe" />);
		const button = screen.getByRole('button', { name: 'Save Recipe' });
		expect(button).toBeDefined();
		expect(button.hasAttribute('disabled')).toBe(false);
	});

	test('renders label in error state and is enabled', () => {
		render(<SubmitButton status="error" countdown={0} label="Save Recipe" />);
		const button = screen.getByRole('button', { name: 'Save Recipe' });
		expect(button).toBeDefined();
		expect(button.hasAttribute('disabled')).toBe(false);
	});

	test('renders loading indicator and is disabled in submitting state', () => {
		render(
			<SubmitButton status="submitting" countdown={0} label="Save Recipe" />,
		);
		const button = screen.getByRole('button');
		expect(button.hasAttribute('disabled')).toBe(true);
		expect(button.getAttribute('data-loading')).toBe('true');
	});

	test('renders green countdown text and is enabled in success state', () => {
		render(<SubmitButton status="success" countdown={3} label="Save Recipe" />);
		const button = screen.getByRole('button', { name: 'Saved! Closing in 3…' });
		expect(button).toBeDefined();
		expect(button.hasAttribute('disabled')).toBe(false);
	});
});
