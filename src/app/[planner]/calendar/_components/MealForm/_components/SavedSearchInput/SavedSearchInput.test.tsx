import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SavedSearchInput } from './SavedSearchInput';

import { searchKeyIntent } from '../../_utils/searchKeyIntent';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../../_utils/searchKeyIntent', () => ({
	searchKeyIntent: vi.fn(() => 'ignore'),
}));

const handlers = {
	onChange: vi.fn(),
	onMoveDown: vi.fn(),
	onMoveUp: vi.fn(),
	onRun: vi.fn(),
};

const renderSearch = (value = '', linking = false) =>
	render(<SavedSearchInput value={value} linking={linking} {...handlers} />);

// Whether the field kept the key's default action.
const pressKey = (key: string) =>
	fireEvent.keyDown(screen.getByRole('textbox'), { key });

describe('SavedSearchInput', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('reports what the user types', () => {
		renderSearch();

		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'taco' },
		});

		expect(handlers.onChange).toHaveBeenCalledWith('taco');
	});

	it('works out what a key does from the key, whether the search has text and whether a dish is being linked', () => {
		renderSearch('taco', true);

		pressKey('Escape');

		expect(searchKeyIntent).toHaveBeenCalledWith(
			expect.objectContaining({ key: 'Escape', isComposing: false }),
			{ hasText: true, linking: true },
		);
	});

	it.each([
		['moveDown', 'onMoveDown'],
		['moveUp', 'onMoveUp'],
		['run', 'onRun'],
	] as const)('runs %s in place of what the key would do in the field', (intent, handler) => {
		vi.mocked(searchKeyIntent).mockReturnValueOnce(intent);
		renderSearch('taco');

		const keptDefault = pressKey('x');

		expect(handlers[handler]).toHaveBeenCalled();
		expect(keptDefault).toBe(false);
	});

	it('empties the search on clear', () => {
		vi.mocked(searchKeyIntent).mockReturnValueOnce('clear');
		renderSearch('taco');

		pressKey('Escape');

		expect(handlers.onChange).toHaveBeenCalledWith('');
	});

	it.each([
		'pass',
		'ignore',
	] as const)('leaves the key alone on %s', (intent) => {
		vi.mocked(searchKeyIntent).mockReturnValueOnce(intent);
		renderSearch('taco');

		const keptDefault = pressKey('Escape');

		expect(keptDefault).toBe(true);
		expect(handlers.onChange).not.toHaveBeenCalled();
	});

	// Mantine's modal hears Esc before the field does, and skips a target with this attribute.
	it('keeps the modal from closing on Esc only while the search has text', () => {
		const { rerender } = renderSearch('taco');
		expect(
			screen.getByRole('textbox').getAttribute('data-mantine-stop-propagation'),
		).toBe('true');

		rerender(<SavedSearchInput value="" linking={false} {...handlers} />);
		expect(
			screen.getByRole('textbox').hasAttribute('data-mantine-stop-propagation'),
		).toBe(false);
	});
});
