import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

import { INPUT_BORDER } from './colors';
import { theme } from './theme';

describe('theme', () => {
	it('colors the selected SegmentedControl option with the primary color', () => {
		const merged = mergeMantineTheme(DEFAULT_THEME, theme);
		const defaultProps = theme.components?.SegmentedControl?.defaultProps;

		expect(
			typeof defaultProps === 'function' ? defaultProps(merged) : defaultProps,
		).toEqual({ color: 'navy' });
	});

	it("gives an input the theme's border color, except while it shows an error", () => {
		const merged = mergeMantineTheme(DEFAULT_THEME, theme);
		const styles = theme.components?.Input?.styles;
		const inputStyles = (props: { error?: boolean }) =>
			typeof styles === 'function'
				? styles(merged, props, undefined).input
				: undefined;

		expect(inputStyles({})).toHaveProperty('borderColor', INPUT_BORDER);
		expect(inputStyles({ error: true })).not.toHaveProperty('borderColor');
	});
});
