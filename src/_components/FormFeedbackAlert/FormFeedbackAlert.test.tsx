import { MantineProvider } from '@mantine/core';

import { render, screen } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { FormFeedbackAlert } from './FormFeedbackAlert';

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

describe('FormFeedbackAlert', () => {
	test('renders null in idle state', () => {
		render(
			<FormFeedbackAlert status="idle" errorMessage="Something went wrong" />,
			{ wrapper },
		);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	test('renders null in submitting state', () => {
		render(
			<FormFeedbackAlert
				status="submitting"
				errorMessage="Something went wrong"
			/>,
			{ wrapper },
		);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	test('renders null in success state', () => {
		render(
			<FormFeedbackAlert
				status="success"
				errorMessage="Something went wrong"
			/>,
			{ wrapper },
		);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	test('renders alert with errorMessage in error state', () => {
		render(
			<FormFeedbackAlert status="error" errorMessage="Failed to save recipe" />,
			{ wrapper },
		);
		expect(screen.getByText('Failed to save recipe')).toBeDefined();
	});
});
