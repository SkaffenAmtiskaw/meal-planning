import { Chip } from '@mantine/core';

import classes from './Chip.module.css';

/**
 * The tag variant, a tag filter's chip: white with a light border while
 * unselected, and in the tag palette's colors once selected, which
 * `variantColorResolver` resolves. It shows no check icon, so it keeps the
 * same padding when selected rather than making room for one.
 */
export const chipDefaults = Chip.extend({
	classNames: classes,
	vars: (theme, props) => ({
		root:
			props.variant === 'tag'
				? {
						'--chip-padding': theme.spacing.xs,
						'--chip-checked-padding': theme.spacing.xs,
					}
				: {},
	}),
});
