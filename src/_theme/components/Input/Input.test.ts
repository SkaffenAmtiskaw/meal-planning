import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

import { inputDefaults } from './Input';

import { INPUT_BORDER } from '../../colors';
import { theme } from '../../theme';

describe('inputDefaults', () => {
	it("gives an input the theme's border color, except while it shows an error", () => {
		const merged = mergeMantineTheme(DEFAULT_THEME, theme);
		const styles = inputDefaults.styles;
		const inputStyles = (props: { error?: boolean }) =>
			typeof styles === 'function'
				? styles(merged, props, undefined).input
				: undefined;

		expect(inputStyles({})).toHaveProperty('borderColor', INPUT_BORDER);
		expect(inputStyles({ error: true })).not.toHaveProperty('borderColor');
	});
});
