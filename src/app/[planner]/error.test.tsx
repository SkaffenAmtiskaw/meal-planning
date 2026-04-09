import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import PlannerError from './error';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

describe('PlannerError', () => {
	test('renders error message', () => {
		render(<PlannerError error={new Error('test')} reset={() => undefined} />);

		expect(screen.getByText('Something went wrong')).toBeDefined();
	});

	test('calls reset when try again is clicked', () => {
		const reset = vi.fn();
		render(<PlannerError error={new Error('test')} reset={reset} />);

		fireEvent.click(screen.getByText('Try again'));

		expect(reset).toHaveBeenCalled();
	});
});
