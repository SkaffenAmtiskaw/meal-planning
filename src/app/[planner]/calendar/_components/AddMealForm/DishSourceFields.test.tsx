import { makeDish } from '@fixtures/dish';
import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishSourceFields } from './DishSourceFields';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('../../_hooks/usePlannerSavedItems', () => ({
	usePlannerSavedItems: vi.fn(),
}));

vi.mock('./DishRow.module.css', () => ({
	default: {
		label: 'label',
		helperHint: 'helperHint',
		sourceColumn: 'sourceColumn',
		hiddenSourcePlaceholder: 'hiddenSourcePlaceholder',
	},
}));

const mockUsePlannerSavedItems = vi.mocked(usePlannerSavedItems);

const defaultProps = {
	dish: makeDish(),
	index: 0,
	onUpdate: vi.fn(),
};

describe('DishSourceFields', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUsePlannerSavedItems.mockReturnValue([]);
	});

	it('renders source type segmented control with current value', () => {
		render(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'saved' })}
			/>,
		);
		expect(
			(
				screen
					.getByTestId('dish-source-type-0')
					.querySelector('[data-active="true"]') as HTMLElement
			).dataset.value,
		).toBe('saved');
	});

	it('calls onUpdate with sourceType when segmented control clicked', () => {
		const onUpdate = vi.fn();
		render(<DishSourceFields {...defaultProps} onUpdate={onUpdate} />);
		fireEvent.click(
			screen
				.getByTestId('dish-source-type-0')
				.querySelector('[data-value="saved"]') as Element,
		);
		expect(onUpdate).toHaveBeenCalledWith({ sourceType: 'saved' });
	});

	it('renders hidden source placeholder for none source type', () => {
		render(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'none' })}
			/>,
		);
		expect(screen.getByTestId('dish-source-placeholder-0')).toBeDefined();
		expect(
			screen.getByText('Search your saved recipes and bookmarks.'),
		).toBeDefined();
	});

	it('does not render hidden source placeholder for saved or text source type', () => {
		const { rerender } = render(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'saved' })}
			/>,
		);
		expect(screen.queryByTestId('dish-source-placeholder-0')).toBeNull();

		rerender(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'text' })}
			/>,
		);
		expect(screen.queryByTestId('dish-source-placeholder-0')).toBeNull();
	});

	it('renders saved select and helper hint for saved source type', () => {
		mockUsePlannerSavedItems.mockReturnValue([
			{ _id: '1', name: 'Pasta', url: '/pasta' },
		]);
		render(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'saved' })}
			/>,
		);
		expect(screen.getByTestId('dish-saved-0')).toBeDefined();
		expect(screen.queryByTestId('dish-source-text-0')).toBeNull();
		expect(
			screen.getByText('Search your saved recipes and bookmarks.'),
		).toBeDefined();
	});

	it('renders reference input and helper hint for text source type', () => {
		render(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'text' })}
			/>,
		);
		expect(screen.getByTestId('dish-source-text-0')).toBeDefined();
		expect(screen.queryByTestId('dish-saved-0')).toBeNull();
		expect(
			screen.getByText(
				'A URL, or a book and page — “Dinner in French, p. 88”.',
			),
		).toBeDefined();
	});

	it('calls onUpdate with savedId when saved select changes', () => {
		const onUpdate = vi.fn();
		mockUsePlannerSavedItems.mockReturnValue([
			{ _id: '1', name: 'Pasta', url: '/pasta' },
		]);
		render(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'saved' })}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.change(screen.getByTestId('dish-saved-0'), {
			target: { value: '1' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ savedId: '1' });
	});

	it('calls onUpdate with empty savedId when saved select is cleared', () => {
		const onUpdate = vi.fn();
		mockUsePlannerSavedItems.mockReturnValue([
			{ _id: '1', name: 'Pasta', url: '/pasta' },
		]);
		render(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'saved', savedId: '1' })}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.change(screen.getByTestId('dish-saved-0'), {
			target: { value: '' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ savedId: '' });
	});

	it('calls onUpdate with sourceText when reference input changes', () => {
		const onUpdate = vi.fn();
		render(
			<DishSourceFields
				{...defaultProps}
				dish={makeDish({ sourceType: 'text' })}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.change(screen.getByTestId('dish-source-text-0'), {
			target: { value: 'https://example.com' },
		});
		expect(onUpdate).toHaveBeenCalledWith({
			sourceText: 'https://example.com',
		});
	});
});
