import type { ComponentPropsWithRef, ReactElement } from 'react';

import { InputBase, type InputBaseProps } from '@mantine/core';

type DateFieldTriggerProps = ComponentPropsWithRef<'button'> &
	Pick<
		InputBaseProps,
		'label' | 'withAsterisk' | 'leftSection' | 'rightSection' | 'variant'
	>;

/**
 * A button that looks like a date field. Its children are the date as the
 * caller formats it, or nothing for an empty field. Button props, such as
 * `onClick` and the ARIA props a popover's target adds, pass through to the button.
 */
export function DateFieldTrigger(props: DateFieldTriggerProps): ReactElement {
	return (
		<InputBase
			component="button"
			type="button"
			pointer
			rightSectionPointerEvents="none"
			{...props}
		/>
	);
}
