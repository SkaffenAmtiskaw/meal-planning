'use client';

import type { ReactElement, ReactNode } from 'react';

import { Drawer } from '@mantine/core';

import classes from './BottomSheet.module.css';

type BottomSheetProps = {
	opened: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
};

/**
 * A sheet that slides up from the bottom of the screen over a dimmed page,
 * with a handle, a title and a Close button. Tapping the dimmed page closes
 * it. Its content scrolls once the sheet would pass 90% of the screen.
 */
export function BottomSheet({
	opened,
	onClose,
	title,
	children,
}: BottomSheetProps): ReactElement {
	return (
		<Drawer.Root
			opened={opened}
			onClose={onClose}
			position="bottom"
			classNames={{ content: classes.content, body: classes.body }}
		>
			<Drawer.Overlay />
			<Drawer.Content>
				<div className={classes.handle} aria-hidden="true" />
				<Drawer.Header>
					<Drawer.Title fw={700} fz="lg">
						{title}
					</Drawer.Title>
					<Drawer.CloseButton aria-label="Close" />
				</Drawer.Header>
				<Drawer.Body>{children}</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
}
