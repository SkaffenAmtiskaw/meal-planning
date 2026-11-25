import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TagFilter } from './TagFilter';

import { limitTagChips } from '../../_utils/limitTagChips';
import type { TagFilterOption } from '../../_utils/types';
import { TagFilterChip } from '../TagFilterChip/TagFilterChip';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../../_utils/limitTagChips', () => ({
	limitTagChips: vi.fn(() => ({ shown: [], hiddenCount: 0 })),
}));
vi.mock('../TagFilterChip/TagFilterChip', () => ({
	TagFilterChip: vi.fn(() => <div data-testid="chip" />),
}));

const option = (name: string, selected = false): TagFilterOption => ({
	tag: { _id: name, name, color: 'fern' },
	selected,
	count: selected ? null : 1,
});

const onChange = vi.fn();

const renderFilter = (options = [option('quick')]) =>
	render(<TagFilter options={options} value={[]} onChange={onChange} />);

describe('TagFilter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows nothing when no tag would return anything', () => {
		const { container } = renderFilter([]);

		expect(container.firstChild).toBeNull();
	});

	it('shows a chip for each option the limit lets through', () => {
		const shown = [option('quick'), option('vegetarian')];
		vi.mocked(limitTagChips).mockReturnValue({ shown, hiddenCount: 0 });

		renderFilter(shown);

		expect(limitTagChips).toHaveBeenLastCalledWith(shown, false);
		expect(screen.getAllByTestId('chip')).toHaveLength(2);
		expect(
			vi.mocked(TagFilterChip).mock.calls.map(([props]) => props.option),
		).toEqual(shown);
	});

	it('shows Clear only while a tag is selected, and clears every tag', () => {
		renderFilter([option('quick')]);
		expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();

		renderFilter([option('vegetarian', true)]);
		fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

		expect(onChange).toHaveBeenCalledWith([]);
	});

	it('shows "+N more" only while tags are hidden', () => {
		vi.mocked(limitTagChips).mockReturnValue({ shown: [], hiddenCount: 0 });
		renderFilter();
		expect(screen.queryByRole('button', { name: /more/ })).toBeNull();

		vi.mocked(limitTagChips).mockReturnValue({ shown: [], hiddenCount: 3 });
		renderFilter();
		expect(screen.getByRole('button', { name: '+3 more' })).toBeDefined();
	});

	it('expands on "+N more" and stays expanded, showing "Fewer", until "Fewer" collapses it', () => {
		vi.mocked(limitTagChips).mockReturnValue({ shown: [], hiddenCount: 3 });
		const { rerender } = renderFilter();

		fireEvent.click(screen.getByRole('button', { name: '+3 more' }));
		expect(limitTagChips).toHaveBeenLastCalledWith(expect.any(Array), true);

		// Nothing is hidden once expanded, and new options keep it expanded.
		vi.mocked(limitTagChips).mockReturnValue({ shown: [], hiddenCount: 0 });
		rerender(
			<TagFilter
				options={[option('quick', true)]}
				value={['quick']}
				onChange={onChange}
			/>,
		);
		expect(limitTagChips).toHaveBeenLastCalledWith(expect.any(Array), true);

		fireEvent.click(screen.getByRole('button', { name: 'Fewer' }));
		expect(limitTagChips).toHaveBeenLastCalledWith(expect.any(Array), false);
		expect(screen.queryByRole('button', { name: 'Fewer' })).toBeNull();
	});
});
