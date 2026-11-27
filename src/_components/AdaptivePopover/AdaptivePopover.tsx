'use client';

import {
	type AriaAttributes,
	cloneElement,
	type ReactElement,
	type ReactNode,
} from 'react';

import { Popover } from '@mantine/core';

import { useEscapeLayer, useIsMobile } from '@/_hooks';

import { BottomSheet } from '../BottomSheet';

type AdaptivePopoverProps = {
	opened: boolean;
	// Called when the popover or sheet asks to close, such as on Esc or a click outside it.
	onClose: () => void;
	// The sheet's title on phones. The desktop popover has no title.
	sheetTitle: string;
	/**
	 * The element that opens it. It has to take a ref, since the desktop
	 * popover anchors to it, and pass ARIA props on to its element, since
	 * both the popover and the sheet add them.
	 */
	target: ReactElement<AriaAttributes>;
	children: ReactNode;
};

/**
 * Shows its content in a popover anchored to its target on desktop, or in a
 * bottom sheet on phones. Its caller owns the open state.
 */
export function AdaptivePopover({
	opened,
	onClose,
	sheetTitle,
	target,
	children,
}: AdaptivePopoverProps): ReactElement {
	const isMobile = useIsMobile();
	// Inside a modal, Esc closes the desktop popover first. The phone sheet registers itself.
	useEscapeLayer(opened && !isMobile);

	if (isMobile) {
		return (
			<>
				{/* The desktop popover's target gets these from Mantine; the sheet has no target to add them. */}
				{cloneElement(target, {
					'aria-haspopup': 'dialog',
					'aria-expanded': opened,
				})}
				<BottomSheet opened={opened} onClose={onClose} title={sheetTitle}>
					{children}
				</BottomSheet>
			</>
		);
	}

	return (
		<Popover opened={opened} onDismiss={onClose} trapFocus>
			<Popover.Target>{target}</Popover.Target>
			<Popover.Dropdown>{children}</Popover.Dropdown>
		</Popover>
	);
}
