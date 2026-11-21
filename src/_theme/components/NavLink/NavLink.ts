import { NavLink } from '@mantine/core';

import classes from './NavLink.module.css';

/**
 * The navbar items' look. It names forest rather than the primary color, because the
 * navbar keeps forest whatever the primary color is.
 */
export const navLinkDefaults = NavLink.extend({
	classNames: classes,
	vars: (theme) => ({
		root: {
			'--nl-bg': theme.colors.forest[5],
			'--nl-hover': theme.colors.forest[6],
			'--nl-color': theme.white,
		},
		children: {},
	}),
});
