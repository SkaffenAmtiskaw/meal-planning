import { describe, expect, it } from 'vitest';

import { createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

import { indicatorDefaults } from './Indicator';

import { EMBER_RAMPS, NAVY_RAMPS } from '../../colors';

describe('indicatorDefaults', () => {
	const theme = mergeMantineTheme(
		DEFAULT_THEME,
		createTheme({
			primaryColor: 'navy',
			colors: { ember: EMBER_RAMPS, navy: NAVY_RAMPS },
		}),
	);
	const vars = indicatorDefaults.vars;

	it('draws the white variant white with a number in the primary color', () => {
		expect(vars?.(theme, { variant: 'white' }, {})).toEqual({
			root: {
				'--indicator-color': theme.white,
				'--indicator-text-color': 'var(--mantine-color-navy-filled)',
			},
		});
	});

	it("draws the white variant's number in the Indicator's color when it has one", () => {
		expect(vars?.(theme, { variant: 'white', color: 'ember' }, {})).toEqual({
			root: {
				'--indicator-color': theme.white,
				'--indicator-text-color': 'var(--mantine-color-ember-filled)',
			},
		});
	});

	it("leaves other variants to Mantine's colors", () => {
		expect(vars?.(theme, {}, {})).toEqual({ root: {} });
	});
});
