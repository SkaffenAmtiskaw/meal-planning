import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishNoteChip } from './DishNoteChip';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./DishNoteChip.module.css', () => ({
	default: {
		root: 'root',
		empty: 'empty',
		set: 'set',
	},
}));

const defaultProps = {
	note: '',
	onClick: vi.fn(),
	'data-testid': 'dish-note-chip-0',
};

describe('DishNoteChip', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders Add note when note is empty', () => {
		render(<DishNoteChip {...defaultProps} />);

		expect(screen.getByTestId('dish-note-chip-0').textContent).toBe('Add note');
	});

	it('renders Note when note is set', () => {
		render(<DishNoteChip {...defaultProps} note="Make it spicy" />);

		expect(screen.getByTestId('dish-note-chip-0').textContent).toBe('Note');
	});

	it('calls onClick when clicked', () => {
		const onClick = vi.fn();
		render(<DishNoteChip {...defaultProps} onClick={onClick} />);

		fireEvent.click(screen.getByTestId('dish-note-chip-0'));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('uses the provided data-testid', () => {
		render(<DishNoteChip {...defaultProps} data-testid="custom-note-chip" />);

		expect(screen.getByTestId('custom-note-chip')).toBeDefined();
	});
});
