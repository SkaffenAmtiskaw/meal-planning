import { makeDish } from '@fixtures/dish';
import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishNoteField } from './DishNoteField';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./DishRow.module.css', () => ({
	default: {
		label: 'label',
		noteColumn: 'noteColumn',
		noteTextareaWrapper: 'noteTextareaWrapper',
		noteTextareaInput: 'noteTextareaInput',
	},
}));

const defaultProps = {
	dish: makeDish(),
	index: 0,
	onUpdate: vi.fn(),
};

describe('DishNoteField', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders note textarea with current note value', () => {
		render(
			<DishNoteField
				{...defaultProps}
				dish={makeDish({ note: 'Prep note' })}
			/>,
		);
		expect(
			(screen.getByTestId('dish-note-0') as HTMLTextAreaElement).value,
		).toBe('Prep note');
	});

	it('calls onUpdate with note when textarea changes', () => {
		const onUpdate = vi.fn();
		render(<DishNoteField {...defaultProps} onUpdate={onUpdate} />);
		fireEvent.change(screen.getByTestId('dish-note-0'), {
			target: { value: 'A note' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ note: 'A note' });
	});
});
