import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Group } from '@mantine/core';

import { makeDishDraft } from '#fixtures/dish';
import { useIsMobile } from '@/_hooks';

import { DishList } from './DishList';

import { formatDishCount } from '../../_utils/formatDishCount';
import { isBlankDish } from '../../_utils/isBlankDish';
import { DishRow } from '../DishRow/DishRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('../../_utils/formatDishCount', () => ({
	formatDishCount: vi.fn(() => '1 dish'),
}));
vi.mock(
	'../../_utils/isBlankDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_utils/isBlankDish'
		),
);
vi.mock('../DishRow/DishRow', () => ({
	DishRow: vi.fn(() => null),
}));

const soup = makeDishDraft({ key: 'a', name: 'Soup' });
const bread = makeDishDraft({ key: 'b', name: 'Bread' });

const handlers = {
	onAddDish: vi.fn(),
	onRenameDish: vi.fn(),
	onRemoveDish: vi.fn(),
	onUnlinkDish: vi.fn(),
	onSetReference: vi.fn(),
	onSetNote: vi.fn(),
};

const rowProps = (index: number) => vi.mocked(DishRow).mock.calls[index][0];

describe('DishList', () => {
	it('adds a dish from Add dish', () => {
		render(<DishList dishes={[soup]} {...handlers} />);

		fireEvent.click(screen.getByRole('button', { name: 'Add dish' }));

		expect(handlers.onAddDish).toHaveBeenCalledTimes(1);
	});

	it('lets a dish be deleted only while there is more than one', () => {
		vi.mocked(DishRow).mockClear();
		render(<DishList dishes={[soup]} {...handlers} />);
		expect(rowProps(0).canDelete).toBe(false);

		vi.mocked(DishRow).mockClear();
		render(<DishList dishes={[soup, bread]} {...handlers} />);
		expect(rowProps(0).canDelete).toBe(true);
	});

	it.each([
		{ device: 'a phone', isMobile: true, justify: 'space-between' },
		{ device: 'desktop', isMobile: false, justify: 'flex-start' },
	])('places the count for $device', ({ isMobile, justify }) => {
		vi.mocked(useIsMobile).mockReturnValueOnce(isMobile);
		render(<DishList dishes={[soup]} {...handlers} />);

		expect(vi.mocked(Group)).toHaveBeenLastCalledWith(
			expect.objectContaining({ justify }),
			undefined,
		);
	});

	it('leaves blank rows out of the count', () => {
		// Soup, the first row, is blank.
		vi.mocked(isBlankDish).mockReturnValueOnce(true);
		render(<DishList dishes={[soup, bread]} {...handlers} />);

		expect(vi.mocked(formatDishCount)).toHaveBeenLastCalledWith(1);
	});

	it('marks only the rows it was told are nameless', () => {
		vi.mocked(DishRow).mockClear();
		render(
			<DishList
				dishes={[soup, bread]}
				namelessKeys={new Set(['b'])}
				{...handlers}
			/>,
		);

		expect(rowProps(0).nameless).toBe(false);
		expect(rowProps(1).nameless).toBe(true);
	});

	it('changes the dish whose row asked', () => {
		vi.mocked(DishRow).mockClear();
		render(<DishList dishes={[soup, bread]} {...handlers} />);

		rowProps(1).onRename('Rye Bread');
		rowProps(1).onDelete();
		rowProps(1).onUnlink();
		rowProps(1).onReferenceChange('p. 12');
		rowProps(1).onNoteChange('Toast it');

		expect(handlers.onRenameDish).toHaveBeenCalledWith('b', 'Rye Bread');
		expect(handlers.onRemoveDish).toHaveBeenCalledWith('b');
		expect(handlers.onUnlinkDish).toHaveBeenCalledWith('b');
		expect(handlers.onSetReference).toHaveBeenCalledWith('b', 'p. 12');
		expect(handlers.onSetNote).toHaveBeenCalledWith('b', 'Toast it');
	});
});
