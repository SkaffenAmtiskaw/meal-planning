import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeTagFilterOption as option } from '#fixtures/tagFilterOption';

import { TagFilter } from './TagFilter';

import { TagChips } from '../TagChips/TagChips';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../TagChips/TagChips', () => ({
	TagChips: vi.fn(() => <div data-testid="chips" />),
}));

const onChange = vi.fn();

const renderFilter = (options = [option('quick')]) =>
	render(<TagFilter options={options} value={[]} onChange={onChange} />);

const chipsProps = () => vi.mocked(TagChips).mock.lastCall?.[0];

describe('TagFilter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows nothing when no tag would return anything', () => {
		const { container } = renderFilter([]);

		expect(container.firstChild).toBeNull();
	});

	it('shows Clear only while a tag is selected, and clears every tag', () => {
		renderFilter([option('quick')]);
		expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();

		renderFilter([option('vegetarian', true)]);
		fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

		expect(onChange).toHaveBeenCalledWith([]);
	});

	it('starts collapsed, and stays expanded as the options change, until toggled back', () => {
		const { rerender } = renderFilter();
		expect(chipsProps()?.expanded).toBe(false);

		act(() => chipsProps()?.onToggleExpanded());
		expect(chipsProps()?.expanded).toBe(true);

		// With no options it shows nothing, and the flag outlives that.
		rerender(<TagFilter options={[]} value={[]} onChange={onChange} />);
		rerender(
			<TagFilter
				options={[option('quick', true)]}
				value={['quick']}
				onChange={onChange}
			/>,
		);
		expect(chipsProps()?.expanded).toBe(true);

		act(() => chipsProps()?.onToggleExpanded());
		expect(chipsProps()?.expanded).toBe(false);
	});
});
