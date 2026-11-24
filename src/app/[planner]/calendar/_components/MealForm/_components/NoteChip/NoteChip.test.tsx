import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ButtonHTMLAttributes } from 'react';

import { NoteChip } from './NoteChip';

vi.mock('@/_components', () => ({
	PillButton: vi.fn((props: ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button type="button" {...props} />
	)),
}));

const onTogglePanel = vi.fn();

describe('NoteChip', () => {
	it.each([
		{ hasNote: false, label: 'Add note' },
		{ hasNote: true, label: 'Note' },
	])('reads "$label" and toggles the panel', ({ hasNote, label }) => {
		onTogglePanel.mockClear();
		render(<NoteChip hasNote={hasNote} onTogglePanel={onTogglePanel} />);

		fireEvent.click(screen.getByRole('button', { name: label }));

		expect(onTogglePanel).toHaveBeenCalledTimes(1);
	});
});
