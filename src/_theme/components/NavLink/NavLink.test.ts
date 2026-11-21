import { describe, expect, it } from 'vitest';

import { createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

import { navLinkDefaults } from './NavLink';

import { FOREST_RAMPS, NAVY_RAMPS } from '../../colors';

describe('navLinkDefaults', () => {
	it('colors the active item forest with white text when navy is the primary color', () => {
		const theme = mergeMantineTheme(
			DEFAULT_THEME,
			createTheme({
				primaryColor: 'navy',
				colors: { forest: FOREST_RAMPS, navy: NAVY_RAMPS },
			}),
		);

		expect(navLinkDefaults.vars?.(theme, {}, {})).toEqual({
			root: {
				'--nl-bg': FOREST_RAMPS[5],
				'--nl-hover': FOREST_RAMPS[6],
				'--nl-color': theme.white,
			},
			children: {},
		});
	});
});
