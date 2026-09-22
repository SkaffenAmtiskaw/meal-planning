import { makeDish } from '@fixtures/dish';
import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishRow } from './DishRow';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('../../_hooks/usePlannerSavedItems', () => ({
	usePlannerSavedItems: vi.fn(),
}));

vi.mock('./DishRow.module.css', () => ({
	default: {
		root: 'root',
		expanded: 'expanded',
		expandButton: 'expandButton',
		label: 'label',
		expandedContent: 'expandedContent',
		removeButton: 'removeButton',
		helperHint: 'helperHint',
		noteColumn: 'noteColumn',
		noteTextareaWrapper: 'noteTextareaWrapper',
		noteTextareaInput: 'noteTextareaInput',
		nameInput: 'nameInput',
	},
}));

const mockUsePlannerSavedItems = vi.mocked(usePlannerSavedItems);

const defaultProps = {
	index: 0,
	showRemove: false,
	onUpdate: vi.fn(),
	onRemove: vi.fn(),
};

describe('DishRow', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUsePlannerSavedItems.mockReturnValue([]);
	});

	it('renders dish row with correct data-testid', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} />);
		expect(screen.getByTestId('dish-row-0')).toBeDefined();
	});

	it('renders dish name input with current dish name', () => {
		render(<DishRow dish={makeDish({ name: 'Soup' })} {...defaultProps} />);
		expect((screen.getByTestId('dish-name-0') as HTMLInputElement).value).toBe(
			'Soup',
		);
	});

	it('calls onUpdate with name when dish name input changes', () => {
		const onUpdate = vi.fn();
		render(<DishRow dish={makeDish()} {...defaultProps} onUpdate={onUpdate} />);
		fireEvent.change(screen.getByTestId('dish-name-0'), {
			target: { value: 'Pasta' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ name: 'Pasta' });
	});

	it('hides remove button when showRemove is false', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} showRemove={false} />);
		expect(screen.queryByTestId('dish-remove-0')).toBeNull();
	});

	it('shows remove button when showRemove is true', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} showRemove={true} />);
		expect(screen.getByTestId('dish-remove-0')).toBeDefined();
	});

	it('calls onRemove when remove button clicked', () => {
		const onRemove = vi.fn();
		render(
			<DishRow
				dish={makeDish()}
				{...defaultProps}
				showRemove={true}
				onRemove={onRemove}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-remove-0'));
		expect(onRemove).toHaveBeenCalledOnce();
	});

	it('expands the row when chevron is clicked while collapsed', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: false })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-expand-0'));
		expect(onUpdate).toHaveBeenCalledWith({ expanded: true });
	});

	it('collapses the row when chevron is clicked while expanded', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-expand-0'));
		expect(onUpdate).toHaveBeenCalledWith({ expanded: false });
	});

	it('hides source controls and note when collapsed', () => {
		render(<DishRow dish={makeDish({ expanded: false })} {...defaultProps} />);
		expect(screen.queryByTestId('dish-source-type-0')).toBeNull();
		expect(screen.queryByTestId('dish-note-0')).toBeNull();
	});

	it('shows source controls and note when expanded', () => {
		render(<DishRow dish={makeDish({ expanded: true })} {...defaultProps} />);
		expect(screen.getByTestId('dish-source-type-0')).toBeDefined();
		expect(screen.getByTestId('dish-note-0')).toBeDefined();
	});

	it('preserves the note value when collapsing and re-expanding', () => {
		const { rerender } = render(
			<DishRow
				dish={makeDish({ expanded: true, note: 'Keep me' })}
				{...defaultProps}
			/>,
		);
		expect(
			(screen.getByTestId('dish-note-0') as HTMLTextAreaElement).value,
		).toBe('Keep me');

		rerender(
			<DishRow
				dish={makeDish({ expanded: false, note: 'Keep me' })}
				{...defaultProps}
			/>,
		);
		expect(screen.queryByTestId('dish-note-0')).toBeNull();

		rerender(
			<DishRow
				dish={makeDish({ expanded: true, note: 'Keep me' })}
				{...defaultProps}
			/>,
		);
		expect(
			(screen.getByTestId('dish-note-0') as HTMLTextAreaElement).value,
		).toBe('Keep me');
	});

	it('preserves the note value when switching source types', () => {
		const { rerender } = render(
			<DishRow
				dish={makeDish({
					expanded: true,
					sourceType: 'saved',
					note: 'Keep me',
				})}
				{...defaultProps}
			/>,
		);
		expect(
			(screen.getByTestId('dish-note-0') as HTMLTextAreaElement).value,
		).toBe('Keep me');

		rerender(
			<DishRow
				dish={makeDish({ expanded: true, sourceType: 'text', note: 'Keep me' })}
				{...defaultProps}
			/>,
		);
		expect(
			(screen.getByTestId('dish-note-0') as HTMLTextAreaElement).value,
		).toBe('Keep me');
	});

	it('calls onUpdate with sourceType when segmented control clicked', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		const control = screen.getByTestId('dish-source-type-0');
		fireEvent.click(control.querySelector('[data-value="saved"]') as Element);
		expect(onUpdate).toHaveBeenCalledWith({ sourceType: 'saved' });
	});

	it('renders saved select when sourceType is saved', () => {
		render(
			<DishRow
				dish={makeDish({ expanded: true, sourceType: 'saved' })}
				{...defaultProps}
			/>,
		);
		expect(screen.getByTestId('dish-saved-0')).toBeDefined();
		expect(screen.queryByTestId('dish-source-text-0')).toBeNull();
	});

	it('renders source text input when sourceType is text', () => {
		render(
			<DishRow
				dish={makeDish({ expanded: true, sourceType: 'text' })}
				{...defaultProps}
			/>,
		);
		expect(screen.getByTestId('dish-source-text-0')).toBeDefined();
		expect(screen.queryByTestId('dish-saved-0')).toBeNull();
	});

	it('calls onUpdate with savedId when saved select changes', () => {
		const onUpdate = vi.fn();
		mockUsePlannerSavedItems.mockReturnValueOnce([
			{ _id: '1', name: 'Pasta', url: '/pasta' },
		]);
		render(
			<DishRow
				dish={makeDish({ expanded: true, sourceType: 'saved' })}
				{...defaultProps}
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
		mockUsePlannerSavedItems.mockReturnValueOnce([
			{ _id: '1', name: 'Pasta', url: '/pasta' },
		]);
		render(
			<DishRow
				dish={makeDish({ expanded: true, sourceType: 'saved', savedId: '1' })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.change(screen.getByTestId('dish-saved-0'), {
			target: { value: '' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ savedId: '' });
	});

	it('calls onUpdate with sourceText when source text input changes', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: true, sourceType: 'text' })}
				{...defaultProps}
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

	it('calls onUpdate with note when note textarea changes', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.change(screen.getByTestId('dish-note-0'), {
			target: { value: 'A note' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ note: 'A note' });
	});
});
