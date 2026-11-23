import type { ComponentPropsWithRef, ReactElement } from 'react';

import { InputBase } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

import type { DateTime } from 'luxon';

import { type DateStyle, formatDate } from '@/_utils/formatDate';

import classes from './DateFieldTrigger.module.css';

type DateFieldTriggerProps = Omit<
	ComponentPropsWithRef<'button'>,
	'children'
> & {
	label: string;
	// The date to show, as a luxon `DateTime` or an ISO date.
	date: DateTime | string;
	// The `formatDate` style to show the date in.
	dateStyle: DateStyle;
	// Whether what the field opens is open, which flips the chevron.
	opened: boolean;
};

/**
 * A button that looks like a date field, with its label notched into its top
 * border. Button props, such as `onClick` and the ARIA props a popover's
 * target adds, pass through to the button.
 */
export function DateFieldTrigger({
	label,
	date,
	dateStyle,
	opened,
	...buttonProps
}: DateFieldTriggerProps): ReactElement {
	const Chevron = opened ? IconChevronUp : IconChevronDown;

	return (
		<InputBase
			component="button"
			type="button"
			pointer
			label={label}
			rightSection={<Chevron size={16} />}
			rightSectionPointerEvents="none"
			classNames={{ root: classes.root, label: classes.label }}
			{...buttonProps}
		>
			{formatDate(date, dateStyle)}
		</InputBase>
	);
}
