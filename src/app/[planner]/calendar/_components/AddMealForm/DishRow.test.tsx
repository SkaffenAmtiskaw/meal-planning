import { makeDish } from '@fixtures/dish';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/_hooks';

import { DishRow, DishRowLayout } from './DishRow';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';
import { formatSourceChip } from './_utils/formatSourceChip';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock(
	'../../_hooks/usePlannerSavedItems',
	async () =>
		await import('@mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);

vi.mock('./_utils/formatSourceChip', () => ({
	formatSourceChip: vi.fn((value: string) => value),
}));

vi.mock('./DishRow.module.css', () => ({
	default: {
		root: 'root',
		expanded: 'expanded',
		rowLayout: 'rowLayout',
		rowLayoutMobile: 'rowLayoutMobile',
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
const mockUseIsMobile = vi.mocked(useIsMobile);
const mockFormatSourceChip = vi.mocked(formatSourceChip);

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
		mockUseIsMobile.mockReturnValue(false);
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

	it('renders the source chip in the collapsed row', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} />);
		expect(screen.getByTestId('dish-source-chip-0')).toBeDefined();
	});

	it('expands the row when the source chip is clicked while collapsed', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: false })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-source-chip-0'));
		expect(onUpdate).toHaveBeenCalledWith({ expanded: true });
	});

	it('does nothing when the source chip is clicked while expanded', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-source-chip-0'));
		expect(onUpdate).not.toHaveBeenCalled();
	});

	it('renders note chip in the collapsed row', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} />);
		expect(screen.getByTestId('dish-note-chip-0')).toBeDefined();
	});

	it('shows Add note chip when note is empty', () => {
		render(<DishRow dish={makeDish({ note: '' })} {...defaultProps} />);
		const chip = screen.getByTestId('dish-note-chip-0');
		expect(chip.textContent).toBe('Add note');
	});

	it('shows Note chip when note is set', () => {
		render(
			<DishRow dish={makeDish({ note: 'Use less salt' })} {...defaultProps} />,
		);
		const chip = screen.getByTestId('dish-note-chip-0');
		expect(chip.textContent).toBe('Note');
	});

	it('expands the row when note chip is clicked while collapsed', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: false })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-note-chip-0'));
		expect(onUpdate).toHaveBeenCalledWith({ expanded: true });
	});

	it('does nothing when the note chip is clicked while expanded', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ expanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-note-chip-0'));
		expect(onUpdate).not.toHaveBeenCalled();
	});

	it('focuses the note textarea after expanding via the note chip', async () => {
		const onUpdate = vi.fn();
		const { rerender } = render(
			<DishRow
				dish={makeDish({ expanded: false, note: '' })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-note-chip-0'));
		expect(onUpdate).toHaveBeenCalledWith({ expanded: true });

		rerender(
			<DishRow
				dish={makeDish({ expanded: true, note: '' })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		expect(screen.getByTestId('dish-note-0')).not.toBe(document.activeElement);

		await waitFor(() => {
			expect(screen.getByTestId('dish-note-0')).toBe(document.activeElement);
		});
	});

	it('does not focus the note textarea when expanding via the source chip', () => {
		const onUpdate = vi.fn();
		const { rerender } = render(
			<DishRow
				dish={makeDish({ expanded: false })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-source-chip-0'));

		rerender(
			<DishRow
				dish={makeDish({ expanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		expect(screen.getByTestId('dish-note-0')).not.toBe(document.activeElement);
	});

	it('does not focus the note textarea when expanding via the chevron', () => {
		const onUpdate = vi.fn();
		const { rerender } = render(
			<DishRow
				dish={makeDish({ expanded: false })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-expand-0'));

		rerender(
			<DishRow
				dish={makeDish({ expanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		expect(screen.getByTestId('dish-note-0')).not.toBe(document.activeElement);
	});

	it('does not focus the note textarea when initially rendered expanded', () => {
		render(<DishRow dish={makeDish({ expanded: true })} {...defaultProps} />);
		expect(screen.getByTestId('dish-note-0')).not.toBe(document.activeElement);
	});

	it('renders note text below the row when note is set and collapsed', () => {
		render(
			<DishRow
				dish={makeDish({ note: 'Chop herbs finely', expanded: false })}
				{...defaultProps}
			/>,
		);
		const noteText = screen.getByTestId('dish-note-text-0');
		expect(noteText.textContent).toBe('Chop herbs finely');
		expect(noteText.getAttribute('title')).toBe('Chop herbs finely');
	});

	it('hides note text below the row when expanded', () => {
		render(
			<DishRow
				dish={makeDish({ note: 'Chop herbs finely', expanded: true })}
				{...defaultProps}
			/>,
		);
		expect(screen.queryByTestId('dish-note-text-0')).toBeNull();
	});

	it('truncates a long note text', () => {
		const longNote = 'A'.repeat(200);
		render(
			<DishRow
				dish={makeDish({ note: longNote, expanded: false })}
				{...defaultProps}
			/>,
		);
		const noteText = screen.getByTestId('dish-note-text-0');
		expect(noteText.textContent).toBe(longNote);
		expect(noteText.getAttribute('title')).toBe(longNote);
		expect(noteText.getAttribute('truncate')).toBe('end');
	});

	it('shows Add source chip when sourceType is none', () => {
		render(
			<DishRow dish={makeDish({ sourceType: 'none' })} {...defaultProps} />,
		);
		const chip = screen.getByTestId('dish-source-chip-0');
		expect(chip.textContent).toBe('Add source');
		expect(chip.getAttribute('title')).toBeNull();
	});

	it('shows saved item name in chip when sourceType is saved and item exists', () => {
		mockUsePlannerSavedItems.mockReturnValue([
			{ _id: '1', name: 'Pasta Primavera', url: '/pasta' },
		]);
		render(
			<DishRow
				dish={makeDish({ sourceType: 'saved', savedId: '1' })}
				{...defaultProps}
			/>,
		);
		const chip = screen.getByTestId('dish-source-chip-0');
		expect(chip.textContent).toBe('Pasta Primavera');
		expect(chip.getAttribute('title')).toBe('Pasta Primavera');
	});

	it('shows Choose a saved item fallback when saved item is not found', () => {
		mockUsePlannerSavedItems.mockReturnValue([
			{ _id: '2', name: 'Other Saved Item', url: '/other' },
		]);
		render(
			<DishRow
				dish={makeDish({ sourceType: 'saved', savedId: '1' })}
				{...defaultProps}
			/>,
		);
		const chip = screen.getByTestId('dish-source-chip-0');
		expect(chip.textContent).toBe('Choose a saved item');
		expect(chip.getAttribute('title')).toBeNull();
	});

	it('shows formatted text in chip when sourceType is text and text is non-empty', () => {
		mockFormatSourceChip.mockReturnValue('example.com/recipe');
		render(
			<DishRow
				dish={makeDish({
					sourceType: 'text',
					sourceText: 'https://example.com/recipe',
				})}
				{...defaultProps}
			/>,
		);
		const chip = screen.getByTestId('dish-source-chip-0');
		expect(chip.textContent).toBe('example.com/recipe');
		expect(chip.getAttribute('title')).toBe('https://example.com/recipe');
		expect(mockFormatSourceChip).toHaveBeenCalledWith(
			'https://example.com/recipe',
		);
	});

	it('shows Add reference fallback when sourceType is text and text is empty', () => {
		render(
			<DishRow
				dish={makeDish({ sourceType: 'text', sourceText: '' })}
				{...defaultProps}
			/>,
		);
		const chip = screen.getByTestId('dish-source-chip-0');
		expect(chip.textContent).toBe('Add reference');
		expect(chip.getAttribute('title')).toBeNull();
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
				dish={makeDish({
					expanded: true,
					sourceType: 'text',
					note: 'Keep me',
				})}
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
		mockUsePlannerSavedItems.mockReturnValue([
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
		mockUsePlannerSavedItems.mockReturnValue([
			{ _id: '1', name: 'Pasta', url: '/pasta' },
		]);
		render(
			<DishRow
				dish={makeDish({
					expanded: true,
					sourceType: 'saved',
					savedId: '1',
				})}
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

describe('DishRowLayout', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseIsMobile.mockReturnValue(false);
	});

	const layoutProps = {
		index: 0,
		nameInput: <div data-testid="name-input">Name</div>,
		chip: <div data-testid="chip">Chip</div>,
		noteChip: <div data-testid="note-chip">NoteChip</div>,
		expandButton: <div data-testid="expand">Expand</div>,
		removeButton: <div data-testid="remove">Remove</div>,
	};

	it('renders children in a single horizontal row on desktop', () => {
		mockUseIsMobile.mockReturnValue(false);
		render(<DishRowLayout {...layoutProps} />);
		const layout = screen.getByTestId('dish-row-layout-0');
		expect(layout.getAttribute('direction')).toBeNull();
		expect(screen.getByTestId('name-input')).toBeDefined();
		expect(screen.getByTestId('chip')).toBeDefined();
		expect(screen.getByTestId('note-chip')).toBeDefined();
		expect(screen.getByTestId('expand')).toBeDefined();
		expect(screen.getByTestId('remove')).toBeDefined();
	});

	it('renders children in a column on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);
		render(<DishRowLayout {...layoutProps} />);
		const layout = screen.getByTestId('dish-row-layout-0');
		expect(layout.getAttribute('direction')).toBe('column');
		expect(screen.getByTestId('name-input')).toBeDefined();
		expect(screen.getByTestId('chip')).toBeDefined();
		expect(screen.getByTestId('note-chip')).toBeDefined();
	});

	it('renders without a remove button when it is null', () => {
		mockUseIsMobile.mockReturnValue(false);
		render(<DishRowLayout {...layoutProps} removeButton={null} />);
		expect(screen.queryByTestId('remove')).toBeNull();
	});
});
