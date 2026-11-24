import { describe, expect, it } from 'vitest';

import {
	DEFAULT_THEME,
	defaultVariantColorsResolver,
	mergeMantineTheme,
} from '@mantine/core';

import { variantColorResolver } from './variantColorResolver';

import { CHALK_RAMPS, EMBER_RAMPS, NAVY_RAMPS } from '../colors';

const theme = mergeMantineTheme(DEFAULT_THEME, {
	colors: { chalk: CHALK_RAMPS, ember: EMBER_RAMPS, navy: NAVY_RAMPS },
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

	it('resolves the ring variant to a navy ring at the shared width with no fill', () => {
		expect(
			variantColorResolver({ color: 'blue', theme, variant: 'ring' }),
		).toEqual(
			expect.objectContaining({
				background: 'transparent',
				color: NAVY_RAMPS[5],
				border: `var(--ring-width) solid ${NAVY_RAMPS[5]}`,
			}),
		);
	});

	it("resolves the dashed variant to the subtle variant's colors inside a dashed chalk border", () => {
		const subtle = defaultVariantColorsResolver({
			color: 'navy',
			theme,
			variant: 'subtle',
		});

		expect(
			variantColorResolver({ color: 'navy', theme, variant: 'dashed' }),
		).toEqual({
			...subtle,
			border: `1px dashed ${CHALK_RAMPS[8]}`,
		});
	});

	it("gives other variants Mantine's default colors", () => {
		const input = { color: 'blue', theme, variant: 'filled' };

		expect(variantColorResolver(input)).toEqual(
			defaultVariantColorsResolver(input),
		);
	});
});
