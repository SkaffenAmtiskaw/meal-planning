'use client';

import type { ReactElement, ReactNode } from 'react';

import { Drawer } from '@mantine/core';

import { useSwipe } from '@/_hooks';

import classes from './BottomSheet.module.css';

type BottomSheetProps = {
	opened: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
};

/**
 * A sheet that slides up from the bottom of the screen over a dimmed page,
 * with a handle, a title and a Close button. Tapping the dimmed page or
 * swiping down on the handle or title closes it. Swipes in its content never
 * do. Its content scrolls once the sheet would pass 90% of the screen.
 */
export function BottomSheet({
	opened,
	onClose,
	title,
	children,
}: BottomSheetProps): ReactElement {
	const swipeRef = useSwipe<HTMLDivElement>({
		onSwipe: (direction) => {
			if (direction === 'down') {
				onClose();
			}
		},
	});

	return (
		<Drawer.Root
			opened={opened}
			onClose={onClose}
			position="bottom"
			classNames={{
				content: classes.content,
				header: classes.header,
				body: classes.body,
			}}
		>
			<Drawer.Overlay />
			<Drawer.Content>
				<div ref={swipeRef} className={classes.handle} aria-hidden="true" />
				<Drawer.Header ref={swipeRef}>
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
