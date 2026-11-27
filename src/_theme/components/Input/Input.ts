import { Input } from '@mantine/core';

import classes from './Input.module.css';

import { INPUT_BORDER } from '../../colors';

/**
 * Every input's white background, navy text and border color, and the classes
 * for the notched variant, a field with its label notched into its top border.
 */
export const inputDefaults = Input.extend({
	classNames: classes,
	// The border color is inline, so it's left off while the input shows an error, or it would hide Mantine's red border.
	styles: (theme, props) => ({
		input: {
			backgroundColor: theme.white,
			...(!props.error && { borderColor: INPUT_BORDER }),
			color: theme.colors.navy[5],
		},
	}),
});

// Mantine marks the wrapper's root with the variant too, and the notched label is styled from there.
export const inputWrapperDefaults = Input.Wrapper.extend({
	classNames: classes,
});
