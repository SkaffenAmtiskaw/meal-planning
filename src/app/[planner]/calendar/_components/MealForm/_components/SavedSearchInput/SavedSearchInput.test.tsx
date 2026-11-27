import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEscapeLayer } from '@/_hooks';

import { SavedSearchInput } from './SavedSearchInput';

import { searchKeyIntent } from '../../_utils/searchKeyIntent';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
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

	it('takes Esc from the modal while the search has text and focus', () => {
		renderSearch('taco');
		expect(useEscapeLayer).toHaveBeenLastCalledWith(false);

		fireEvent.focus(screen.getByRole('textbox'));

		expect(useEscapeLayer).toHaveBeenLastCalledWith(true);
	});

	it('leaves Esc to the modal once focus moves away', () => {
		renderSearch('taco');
		fireEvent.focus(screen.getByRole('textbox'));

		fireEvent.blur(screen.getByRole('textbox'));

		expect(useEscapeLayer).toHaveBeenLastCalledWith(false);
	});

	it('leaves Esc to the modal while the focused search is empty', () => {
		renderSearch('');

		fireEvent.focus(screen.getByRole('textbox'));

		expect(useEscapeLayer).toHaveBeenLastCalledWith(false);
	});
});
