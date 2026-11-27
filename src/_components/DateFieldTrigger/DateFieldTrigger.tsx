import { type ComponentPropsWithRef, type ReactElement, useId } from 'react';

import { InputBase, type InputBaseProps } from '@mantine/core';

type DateFieldTriggerProps = ComponentPropsWithRef<'button'> &
	Pick<
		InputBaseProps,
		'withAsterisk' | 'leftSection' | 'rightSection' | 'variant'
	> & {
		label: string;
	};

/**
 * A button that looks like a date field. Its children are the date as the
 * caller formats it, or nothing for an empty field. Button props, such as
 * `onClick` and the ARIA props a popover's target adds, pass through to the button.
 */
export function DateFieldTrigger({
	children,
	...props
}: DateFieldTriggerProps): ReactElement {
	// Its own ids, since a popover's target replaces the button's id.
	const id = useId();
	const labelId = `${id}-label`;
	const valueId = `${id}-value`;

	return (
		<InputBase
			component="button"
			type="button"
			pointer
			rightSectionPointerEvents="none"
			labelProps={{ id: labelId }}
			// A label would otherwise name the button alone, so screen readers wouldn't hear the date.
			aria-labelledby={children ? `${labelId} ${valueId}` : labelId}
			{...props}
		>
			{children && <span id={valueId}>{children}</span>}
		</InputBase>
	);
}
