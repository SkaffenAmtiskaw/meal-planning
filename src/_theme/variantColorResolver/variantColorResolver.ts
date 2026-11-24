import {
	defaultVariantColorsResolver,
	type VariantColorsResolver,
} from '@mantine/core';

import { MUTED_TEXT, TAG_COLORS } from '../colors';
import type { TagColor } from '../types';

const isTagColor = (color: string | undefined): color is TagColor =>
	color !== undefined && color in TAG_COLORS;

export const variantColorResolver: VariantColorsResolver = (input) => {
	const defaultResolvedColors = defaultVariantColorsResolver(input);

	if (input.variant === 'cta') {
		return {
			...defaultResolvedColors,
			background: input.theme.colors.ember[5],
			hover: input.theme.colors.ember[6],
			color: input.theme.white,
			border: 'none',
		};
	}

	if (input.variant === 'ring') {
		return {
			...defaultResolvedColors,
			background: 'transparent',
			hover: 'transparent',
			color: input.theme.colors.navy[5],
			border: `var(--ring-width) solid ${input.theme.colors.navy[5]}`,
		};
	}

	// A button that adds a row to a list, such as Add dish: subtle, inside a dashed outline.
	if (input.variant === 'dashed') {
		return {
			...defaultVariantColorsResolver({ ...input, variant: 'subtle' }),
			border: `1px dashed ${input.theme.colors.chalk[8]}`,
		};
	}

	/**
	 * A tag badge, colored from the tag palette by the tag's color name, such as
	 * `color="fern"`. `tag` has the palette's border; `tag-plain`, for a row of
	 * small tags under a list item, has none.
	 */
	if (
		(input.variant === 'tag' || input.variant === 'tag-plain') &&
		isTagColor(input.color)
	) {
		const { bg, text, border } = TAG_COLORS[input.color];
		return {
			...defaultResolvedColors,
			background: bg,
			hover: bg,
			color: text,
			border: input.variant === 'tag' ? `1px solid ${border}` : 'none',
		};
	}

	// A quiet button on a tinted surface, such as a saved recipe's Add: white, inside a light navy border.
	if (input.variant === 'white-outline') {
		return {
			...defaultVariantColorsResolver({ ...input, variant: 'white' }),
			hover: input.theme.colors.navy[0],
			border: `1px solid ${input.theme.colors.navy[2]}`,
		};
	}

	// A button that's there to be seen rather than used, such as a saved recipe's "Added".
	if (input.variant === 'muted') {
		return {
			...defaultResolvedColors,
			background: 'transparent',
			hover: 'transparent',
			color: MUTED_TEXT,
			border: 'none',
		};
	}

	return defaultResolvedColors;
};
