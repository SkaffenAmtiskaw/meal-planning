import { Button, Group, Paper, Portal, Text } from '@mantine/core';

import type { SnackbarMessage } from './types';
import classes from './Snackbar.module.css';

interface SnackbarProps {
	snackbar: SnackbarMessage | null;
	onUndo: () => void;
}

/**
 * The dark confirmation bar at the bottom of the screen. The status region
 * stays in the page while no message shows, so a screen reader announces each
 * new one.
 */
export function Snackbar({ snackbar, onUndo }: SnackbarProps) {
	return (
		<Portal>
			<output className={classes.root}>
				{snackbar && (
					<Paper bg="navy" radius={10} shadow="lg">
						<Group
							justify="space-between"
							wrap="nowrap"
							mih={52}
							pl={18}
							pr={8}
						>
							<Text c="white" fz={15}>
								{snackbar.message}
							</Text>
							{snackbar.onUndo && (
								<Button variant="on-dark" fw={700} onClick={onUndo}>
									Undo
								</Button>
							)}
						</Group>
					</Paper>
				)}
			</output>
		</Portal>
	);
}
