import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

import { theme } from './theme';

describe('theme', () => {
	it('colors the selected SegmentedControl option with the primary color', () => {
		const merged = mergeMantineTheme(DEFAULT_THEME, theme);
		const defaultProps = theme.components?.SegmentedControl?.defaultProps;

		expect(
			typeof defaultProps === 'function' ? defaultProps(merged) : defaultProps,
		).toEqual({ color: 'navy' });
	});
});
