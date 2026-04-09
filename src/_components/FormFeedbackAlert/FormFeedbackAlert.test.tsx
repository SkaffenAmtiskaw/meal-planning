import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { FormFeedbackAlert } from './FormFeedbackAlert';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('FormFeedbackAlert', () => {
	test('renders null in idle state', () => {
		render(
			<FormFeedbackAlert status="idle" errorMessage="Something went wrong" />,
		);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	test('renders null in submitting state', () => {
		render(
			<FormFeedbackAlert
				status="submitting"
				errorMessage="Something went wrong"
			/>,
		);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	test('renders null in success state', () => {
		render(
			<FormFeedbackAlert
				status="success"
				errorMessage="Something went wrong"
			/>,
		);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	test('renders alert with errorMessage in error state', () => {
		render(
			<FormFeedbackAlert status="error" errorMessage="Failed to save recipe" />,
		);
		expect(screen.getByText('Failed to save recipe')).toBeDefined();
	});
});
