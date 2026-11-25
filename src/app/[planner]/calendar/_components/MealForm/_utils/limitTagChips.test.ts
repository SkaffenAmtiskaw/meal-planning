import { describe, expect, it } from 'vitest';

import { makeTagFilterOption as option } from '#fixtures/tagFilterOption';

import { limitTagChips } from './limitTagChips';

const unselected = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((name) =>
	option(name),
);

describe('limitTagChips', () => {
	it('shows six chips and counts the rest as hidden', () => {
		expect(limitTagChips(unselected, false)).toEqual({
			shown: unselected.slice(0, 6),
			hiddenCount: 2,
		});
	});

	it('counts the selected chips among the six', () => {
		const options = [option('x', true), option('y', true), ...unselected];

		expect(limitTagChips(options, false)).toEqual({
			shown: options.slice(0, 6),
			hiddenCount: 4,
		});
	});

	it('shows every selected chip even past six, and no unselected ones', () => {
		const selected = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'].map((name) =>
			option(name, true),
		);

		expect(limitTagChips([...selected, ...unselected], false)).toEqual({
			shown: selected,
			hiddenCount: unselected.length,
		});
	});

	it('shows every chip, with none hidden, while expanded', () => {
		expect(limitTagChips(unselected, true)).toEqual({
			shown: unselected,
			hiddenCount: 0,
		});
	});
});
