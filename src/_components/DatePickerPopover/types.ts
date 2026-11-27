import type { AriaAttributes, ReactElement } from 'react';

import type { DatePickerPanelProps } from '../DatePickerPanel';

export type DatePickerPopoverProps = DatePickerPanelProps & {
	// The sheet's title on phones, such as "Choose day".
	sheetTitle: string;
	/**
	 * Renders the element that opens the picker, given whether the picker is
	 * open and the click handler that opens or closes it. The element has to
	 * take a ref, since the desktop popover anchors to it.
	 */
	renderTrigger: (trigger: {
		opened: boolean;
		onClick: () => void;
	}) => ReactElement<AriaAttributes>;
};
