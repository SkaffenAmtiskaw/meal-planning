import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('ErrorMessage', () => {
	test('calls reset when try again is clicked', () => {
		const reset = vi.fn();
		render(<ErrorMessage reset={reset} />);

		fireEvent.click(screen.getByText('Try again'));

		expect(reset).toHaveBeenCalled();
	});
});
