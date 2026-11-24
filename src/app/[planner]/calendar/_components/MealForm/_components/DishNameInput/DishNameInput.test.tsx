import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DishNameInput } from './DishNameInput';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('DishNameInput', () => {
	it('renames the dish as the user types', () => {
		const onRename = vi.fn();
		render(<DishNameInput name="Soup" onRename={onRename} />);

		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Tomato Soup' },
		});

		expect(onRename).toHaveBeenCalledWith('Tomato Soup');
	});
});
