import { describe, expect, it } from 'vitest';

import {
	DEFAULT_THEME,
	defaultVariantColorsResolver,
	mergeMantineTheme,
} from '@mantine/core';

import { variantColorResolver } from './variantColorResolver';

import {
	CHALK_RAMPS,
	EMBER_RAMPS,
	MUTED_TEXT,
	NAVY_RAMPS,
	TAG_COLORS,
} from '../colors';

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

	it("resolves the tag variant to that tag color's background, text and border", () => {
		const { bg, text, border } = TAG_COLORS.fern;

		expect(
			variantColorResolver({ color: 'fern', theme, variant: 'tag' }),
		).toEqual(
			expect.objectContaining({
				background: bg,
				hover: bg,
				color: text,
				border: `1px solid ${border}`,
			}),
		);
	});

	it("resolves the tag-plain variant to that tag color's background and text, with no border", () => {
		const { bg, text } = TAG_COLORS.fern;

		expect(
			variantColorResolver({ color: 'fern', theme, variant: 'tag-plain' }),
		).toEqual(
			expect.objectContaining({
				background: bg,
				color: text,
				border: 'none',
			}),
		);
	});

	it("gives a tag variant with a color outside the tag palette Mantine's default colors", () => {
		const input = { color: 'navy', theme, variant: 'tag' };

		expect(variantColorResolver(input)).toEqual(
			defaultVariantColorsResolver(input),
		);
	});

	it("resolves the white-outline variant to the white variant's colors inside a light navy border", () => {
		const white = defaultVariantColorsResolver({
			color: 'navy',
			theme,
			variant: 'white',
		});

		expect(
			variantColorResolver({ color: 'navy', theme, variant: 'white-outline' }),
		).toEqual({
			...white,
			hover: NAVY_RAMPS[0],
			border: `1px solid ${NAVY_RAMPS[2]}`,
		});
	});

	it('resolves the muted variant to muted text with no fill or border', () => {
		expect(
			variantColorResolver({ color: 'navy', theme, variant: 'muted' }),
		).toEqual(
			expect.objectContaining({
				background: 'transparent',
				hover: 'transparent',
				color: MUTED_TEXT,
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
