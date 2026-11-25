import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AddAsNewDishRow } from './AddAsNewDishRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('AddAsNewDishRow', () => {
	it('keeps the typed text as a new dish', () => {
		const onAdd = vi.fn();
		render(<AddAsNewDishRow text="pas" onAdd={onAdd} />);

		fireEvent.click(
			screen.getByRole('button', { name: 'Add “pas” as a new dish' }),
		);

		expect(onAdd).toHaveBeenCalledTimes(1);
	});

	it('asks for a name, with nothing to tap, before anything is typed', () => {
		render(<AddAsNewDishRow text=" " onAdd={vi.fn()} />);

		expect(screen.queryByText('Type a name for a new dish')).not.toBeNull();
		expect(screen.queryByRole('button')).toBeNull();
	});
});
