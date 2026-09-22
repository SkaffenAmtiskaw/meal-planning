import { makeDish } from '@fixtures/dish';
import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishList } from './DishList';
import { DishRow } from './DishRow';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./DishRow', async () => ({
	DishRow: vi.fn(() => null),
}));

const defaultProps = {
	dishes: [makeDish()],
	onAddDish: vi.fn(),
	onRemoveDish: vi.fn(),
	onUpdateDish: vi.fn(),
};

describe('DishList', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders header with dishes label and count', () => {
		render(
			<DishList
				{...defaultProps}
				dishes={[makeDish(), makeDish({ id: 'dish-2' })]}
			/>,
		);

		expect(screen.getByText('DISHES')).toBeDefined();
		expect(screen.getByText('2 dishes')).toBeDefined();
	});

	it('calls onAddDish when header Add dish button clicked', () => {
		render(<DishList {...defaultProps} />);

		fireEvent.click(screen.getByText('Add dish'));

		expect(defaultProps.onAddDish).toHaveBeenCalledOnce();
	});

	it('renders a DishRow for each dish', () => {
		render(
			<DishList
				{...defaultProps}
				dishes={[
					makeDish({ id: 'dish-1' }),
					makeDish({ id: 'dish-2' }),
					makeDish({ id: 'dish-3' }),
				]}
			/>,
		);

		expect(DishRow).toHaveBeenCalledTimes(3);
	});

	it('passes showRemove false when only one dish', () => {
		render(
			<DishList {...defaultProps} dishes={[makeDish({ id: 'dish-1' })]} />,
		);

		expect(DishRow).toHaveBeenCalledWith(
			expect.objectContaining({ showRemove: false }),
			undefined,
		);
	});

	it('passes showRemove true when multiple dishes', () => {
		render(
			<DishList
				{...defaultProps}
				dishes={[makeDish({ id: 'dish-1' }), makeDish({ id: 'dish-2' })]}
			/>,
		);

		expect(DishRow).toHaveBeenCalledWith(
			expect.objectContaining({ showRemove: true }),
			undefined,
		);
	});

	it('calls onAddDish when Add another dish row clicked', () => {
		render(<DishList {...defaultProps} />);

		fireEvent.click(screen.getByText('Add another dish'));

		expect(defaultProps.onAddDish).toHaveBeenCalledOnce();
	});

	it('renders singular dish count', () => {
		render(<DishList {...defaultProps} dishes={[makeDish()]} />);

		expect(screen.getByText('1 dish')).toBeDefined();
	});

	it('renders plural dish count', () => {
		render(
			<DishList
				{...defaultProps}
				dishes={[makeDish(), makeDish({ id: 'dish-2' })]}
			/>,
		);

		expect(screen.getByText('2 dishes')).toBeDefined();
	});

	it('passes index and dish to each DishRow', () => {
		const dishes = [makeDish({ id: 'a' }), makeDish({ id: 'b' })];

		render(<DishList {...defaultProps} dishes={dishes} />);

		expect(vi.mocked(DishRow).mock.calls[0][0]).toMatchObject({
			dish: dishes[0],
			index: 0,
		});
		expect(vi.mocked(DishRow).mock.calls[1][0]).toMatchObject({
			dish: dishes[1],
			index: 1,
		});
	});

	it('wraps DishRow onUpdate and onRemove with dish id', () => {
		const dishes = [makeDish({ id: 'dish-x' })];

		render(<DishList {...defaultProps} dishes={dishes} />);

		const { onUpdate, onRemove } = vi.mocked(DishRow).mock.calls[0][0];
		onUpdate({ name: 'Pasta' });
		onRemove();

		expect(defaultProps.onUpdateDish).toHaveBeenCalledWith('dish-x', {
			name: 'Pasta',
		});
		expect(defaultProps.onRemoveDish).toHaveBeenCalledWith('dish-x');
	});
});
