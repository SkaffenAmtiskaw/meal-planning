import { getThemeColor, Indicator } from '@mantine/core';

/**
 * Mantine's white variant, which Indicator lacks: a white badge with its number in the
 * badge's color, for a badge on the navy header, where a navy one would disappear.
 */
export const indicatorDefaults = Indicator.extend({
	vars: (theme, props) => ({
		root:
			props.variant === 'white'
				? {
						'--indicator-color': theme.white,
						'--indicator-text-color': getThemeColor(
							props.color ?? theme.primaryColor,
							theme,
						),
					}
				: {},
	}),
});
