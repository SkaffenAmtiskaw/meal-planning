import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME } from '@mantine/core';

import { chipDefaults } from './Chip';

describe('chipDefaults', () => {
	const vars = chipDefaults.vars;

	it('gives the tag variant the same padding selected or not, since it shows no check icon', () => {
		expect(vars?.(DEFAULT_THEME, { variant: 'tag' }, {})).toEqual({
			root: {
				'--chip-padding': DEFAULT_THEME.spacing.xs,
				'--chip-checked-padding': DEFAULT_THEME.spacing.xs,
			},
		});
	});

	it("leaves other variants to Mantine's padding", () => {
		expect(vars?.(DEFAULT_THEME, {}, {})).toEqual({ root: {} });
	});
});
