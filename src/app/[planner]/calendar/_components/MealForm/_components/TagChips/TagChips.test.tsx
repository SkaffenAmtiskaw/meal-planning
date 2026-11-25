import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeTagFilterOption as option } from '#fixtures/tagFilterOption';

import { TagChips } from './TagChips';

import { limitTagChips } from '../../_utils/limitTagChips';
import { TagFilterChip } from '../TagFilterChip/TagFilterChip';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../../_utils/limitTagChips', () => ({
	limitTagChips: vi.fn(() => ({ shown: [], hiddenCount: 0 })),
}));
vi.mock('../TagFilterChip/TagFilterChip', () => ({
	TagFilterChip: vi.fn(() => <div data-testid="chip" />),
}));

const onToggleExpanded = vi.fn();

const renderChips = (expanded = false, options = [option('quick')]) =>
	render(
		<TagChips
			options={options}
			value={[]}
			onChange={vi.fn()}
			expanded={expanded}
			onToggleExpanded={onToggleExpanded}
		/>,
	);

describe('TagChips', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each([
		false,
		true,
	])('shows a chip for each option the limit lets through, expanded %s', (expanded) => {
		const options = [option('quick'), option('vegetarian')];
		vi.mocked(limitTagChips).mockReturnValue({
			shown: options,
			hiddenCount: 0,
		});

		renderChips(expanded, options);

		expect(limitTagChips).toHaveBeenLastCalledWith(options, expanded);
		expect(screen.getAllByTestId('chip')).toHaveLength(2);
		expect(
			vi.mocked(TagFilterChip).mock.calls.map(([props]) => props.option),
		).toEqual(options);
	});

	it('shows no "+N more" while nothing is hidden and the row is collapsed', () => {
		vi.mocked(limitTagChips).mockReturnValue({ shown: [], hiddenCount: 0 });

		renderChips();

		expect(screen.queryByRole('button')).toBeNull();
	});

	it('expands from "+N more" while tags are hidden', () => {
		vi.mocked(limitTagChips).mockReturnValue({ shown: [], hiddenCount: 3 });
		renderChips();

		fireEvent.click(screen.getByRole('button', { name: '+3 more' }));

		expect(onToggleExpanded).toHaveBeenCalled();
	});

	it('collapses from "Fewer" while expanded', () => {
		vi.mocked(limitTagChips).mockReturnValue({ shown: [], hiddenCount: 0 });
		renderChips(true);

		fireEvent.click(screen.getByRole('button', { name: 'Fewer' }));

		expect(onToggleExpanded).toHaveBeenCalled();
	});
});
