import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SavedSearchInput } from './SavedSearchInput';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('SavedSearchInput', () => {
	it('reports what the user types', () => {
		const onChange = vi.fn();
		render(<SavedSearchInput value="" onChange={onChange} />);

		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'taco' },
		});

		expect(onChange).toHaveBeenCalledWith('taco');
	});
});
