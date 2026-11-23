import type { ReactElement } from 'react';

import { Group, Paper, Skeleton, Stack } from '@mantine/core';

import styles from './MobileAgenda.module.css';

/**
 * Stands in for the phone agenda while the selected day isn't known yet, in
 * the agenda's own frame, so the agenda replaces it without moving the page.
 */
export function MobileAgendaSkeleton(): ReactElement {
	return (
		<Paper bg="chalk.0" flex={1} mih={0} data-testid="mobile-agenda-skeleton">
			<Stack gap="sm" className={styles.stack}>
				<Group justify="space-between">
					<Skeleton height={20} width="50%" />
					<Skeleton height={20} width={60} />
				</Group>
				<Skeleton height={64} radius="md" />
			</Stack>
		</Paper>
	);
}
