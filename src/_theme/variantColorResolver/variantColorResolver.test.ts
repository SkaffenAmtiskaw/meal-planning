import { describe, expect, it } from 'vitest';

import {
	DEFAULT_THEME,
	defaultVariantColorsResolver,
	mergeMantineTheme,
} from '@mantine/core';

import { variantColorResolver } from './variantColorResolver';

import { EMBER_RAMPS } from '../colors';

const theme = mergeMantineTheme(DEFAULT_THEME, {
	colors: { ember: EMBER_RAMPS },
});

describe('variantColorResolver', () => {
	it('resolves the cta variant to ember with white text and no border', () => {
		expect(
			variantColorResolver({ color: 'blue', theme, variant: 'cta' }),
		).toEqual(
			expect.objectContaining({
				background: EMBER_RAMPS[5],
				hover: EMBER_RAMPS[6],
				color: theme.white,
				border: 'none',
			}),
		);
	});

	it("gives other variants Mantine's default colors", () => {
		const input = { color: 'blue', theme, variant: 'filled' };

		expect(variantColorResolver(input)).toEqual(
			defaultVariantColorsResolver(input),
		);
	});
});
