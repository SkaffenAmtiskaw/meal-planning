import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Group } from '@mantine/core';

import { makeDishDraft } from '#fixtures/dish';
import type { SavedItem } from '@/_actions/library/types';
import { useIsMobile } from '@/_hooks';

import { DishList } from './DishList';

import { formatDishCount } from '../../_utils/formatDishCount';
import { DishRow } from '../DishRow/DishRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('../../_utils/formatDishCount', () => ({
	formatDishCount: vi.fn(() => '1 dish'),
}));
vi.mock('../DishRow/DishRow', () => ({
	DishRow: vi.fn(() => null),
}));

const soup = makeDishDraft({ key: 'a', name: 'Soup' });
const bread = makeDishDraft({ key: 'b', name: 'Bread' });
const pasta: SavedItem = {
	_id: 'pasta',
	name: 'Weeknight Pasta Ideas',
	kind: 'bookmark',
	url: 'https://example.com/pasta',
	tags: [],
};

const handlers = {
	dishCount: 1,
	onAddDish: vi.fn(),
	onRenameDish: vi.fn(),
	onRemoveDish: vi.fn(),
	onUnlinkDish: vi.fn(),
	onSetReference: vi.fn(),
	onSetNote: vi.fn(),
	onStartLinking: vi.fn(),
	linkedIds: new Set<string>(),
	openListKey: null,
	onOpenList: vi.fn(),
	onCloseList: vi.fn(),
	onChooseRecipe: vi.fn(),
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

	it('shows the count it was given', () => {
		render(<DishList dishes={[soup, bread]} {...handlers} dishCount={1} />);

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

	it('marks only the row being linked', () => {
		vi.mocked(DishRow).mockClear();
		render(<DishList dishes={[soup, bread]} linkingKey="b" {...handlers} />);

		expect(rowProps(0).linking).toBe(false);
		expect(rowProps(1).linking).toBe(true);
	});

	it("opens only that dish's list", () => {
		vi.mocked(DishRow).mockClear();
		render(<DishList dishes={[soup, bread]} {...handlers} openListKey="b" />);

		expect(rowProps(0).listOpen).toBe(false);
		expect(rowProps(1).listOpen).toBe(true);
	});

	it('changes the dish whose row asked', () => {
		vi.mocked(DishRow).mockClear();
		render(<DishList dishes={[soup, bread]} {...handlers} />);

		rowProps(1).onRename('Rye Bread');
		rowProps(1).onDelete();
		rowProps(1).onUnlink();
		rowProps(1).onReferenceChange('p. 12');
		rowProps(1).onNoteChange('Toast it');
		rowProps(1).onStartLinking();
		rowProps(1).onOpenList();
		rowProps(1).onChooseRecipe(pasta);

		expect(handlers.onStartLinking).toHaveBeenCalledWith(bread);
		expect(handlers.onRenameDish).toHaveBeenCalledWith('b', 'Rye Bread');
		expect(handlers.onRemoveDish).toHaveBeenCalledWith('b');
		expect(handlers.onUnlinkDish).toHaveBeenCalledWith('b');
		expect(handlers.onSetReference).toHaveBeenCalledWith('b', 'p. 12');
		expect(handlers.onSetNote).toHaveBeenCalledWith('b', 'Toast it');
		expect(handlers.onOpenList).toHaveBeenCalledWith('b');
		expect(handlers.onChooseRecipe).toHaveBeenCalledWith('b', pasta);
	});
});
