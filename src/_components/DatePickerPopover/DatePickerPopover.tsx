'use client';

import type { ReactElement } from 'react';

import { useDisclosure } from '@mantine/hooks';

import type { DatePickerPopoverProps } from './types';

import { AdaptivePopover } from '../AdaptivePopover';
import { DatePickerPanel } from '../DatePickerPanel';

/**
 * Opens a date picker from the trigger it renders: a popover on desktop and a
 * bottom sheet on phones. A pick calls onChange and closes the picker.
 */
export function DatePickerPopover({
	sheetTitle,
	renderTrigger,
	onChange,
	...panelProps
}: DatePickerPopoverProps): ReactElement {
	const [opened, { toggle, close }] = useDisclosure(false);

	return (
		<AdaptivePopover
			opened={opened}
			onClose={close}
			sheetTitle={sheetTitle}
			target={renderTrigger({ opened, onClick: toggle })}
		>
			<DatePickerPanel
				{...panelProps}
				onChange={(date) => {
					onChange(date);
					close();
				}}
			/>
		</AdaptivePopover>
	);
}
