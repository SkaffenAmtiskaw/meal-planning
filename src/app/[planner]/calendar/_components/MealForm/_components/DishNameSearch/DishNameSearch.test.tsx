import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DishNameSearch } from './DishNameSearch';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const props = {
	name: 'Lemon Herb Chicken',
	linked: false,
	listOpen: false,
	onRename: vi.fn(),
	onUnlink: vi.fn(),
	onOpenList: vi.fn(),
};

const field = () => screen.getByRole('textbox', { name: 'Dish name' });

describe('DishNameSearch', () => {
	it('renames the dish and opens its list as the user types', () => {
		render(<DishNameSearch {...props} />);

		fireEvent.change(field(), { target: { value: 'Soup' } });

		expect(props.onRename).toHaveBeenCalledWith('Soup');
		expect(props.onOpenList).toHaveBeenCalled();
		expect(props.onUnlink).not.toHaveBeenCalled();
	});

	it('unlinks a linked dish once its name is edited', () => {
		const onUnlink = vi.fn();
		render(<DishNameSearch {...props} linked onUnlink={onUnlink} />);

		fireEvent.change(field(), { target: { value: 'Lemon Herb Chickens' } });

		expect(onUnlink).toHaveBeenCalledTimes(1);
	});

	it.each(['focus', 'click'] as const)('opens its list on %s', (event) => {
		const onOpenList = vi.fn();
		render(<DishNameSearch {...props} onOpenList={onOpenList} />);

		fireEvent[event](field());

		expect(onOpenList).toHaveBeenCalled();
	});

	it('puts the cursor in the field when its list opens from elsewhere', () => {
		const { rerender } = render(<DishNameSearch {...props} />);
		expect(document.activeElement).not.toBe(field());

		rerender(<DishNameSearch {...props} listOpen />);

		expect(document.activeElement).toBe(field());
	});
});
