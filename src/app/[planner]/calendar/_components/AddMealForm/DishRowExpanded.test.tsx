import { createRef } from 'react';

import { makeDish } from '@fixtures/dish';
import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishRowExpanded } from './DishRowExpanded';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock(
	'../../_hooks/usePlannerSavedItems',
	async () =>
		await import('@mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);

vi.mock('./DishRow.module.css', () => ({
	default: {
		expandedContent: 'expandedContent',
		expandedGrid: 'expandedGrid',
	},
}));

const mockUsePlannerSavedItems = vi.mocked(usePlannerSavedItems);

const defaultProps = {
	dish: makeDish({ expanded: true }),
	index: 0,
	onUpdate: vi.fn(),
};

describe('DishRowExpanded', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUsePlannerSavedItems.mockReturnValue([]);
	});

	it('renders source type segmented control', () => {
		render(<DishRowExpanded {...defaultProps} />);
		expect(screen.getByTestId('dish-source-type-0')).toBeDefined();
	});

	it('renders note textarea', () => {
		render(<DishRowExpanded {...defaultProps} />);
		expect(screen.getByTestId('dish-note-0')).toBeDefined();
	});

	it('propagates source type changes to onUpdate', () => {
		const onUpdate = vi.fn();
		render(<DishRowExpanded {...defaultProps} onUpdate={onUpdate} />);
		fireEvent.click(
			screen
				.getByTestId('dish-source-type-0')
				.querySelector('[data-value="saved"]') as Element,
		);
		expect(onUpdate).toHaveBeenCalledWith({ sourceType: 'saved' });
	});

	it('propagates note changes to onUpdate', () => {
		const onUpdate = vi.fn();
		render(<DishRowExpanded {...defaultProps} onUpdate={onUpdate} />);
		fireEvent.change(screen.getByTestId('dish-note-0'), {
			target: { value: 'A note' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ note: 'A note' });
	});

	it('forwards ref to the note textarea', () => {
		const ref = createRef<HTMLTextAreaElement>();
		render(<DishRowExpanded {...defaultProps} ref={ref} />);
		expect(ref.current).toBe(screen.getByTestId('dish-note-0'));
		expect(() => ref.current?.focus()).not.toThrow();
	});
});
