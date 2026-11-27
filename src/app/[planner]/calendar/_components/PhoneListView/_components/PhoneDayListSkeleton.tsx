import type { ReactElement } from 'react';

import { Divider, Group, Skeleton, Stack } from '@mantine/core';

import styles from './PhoneDaySection.module.css';

// One placeholder day: a header line and one card-height block, in a real section's frame.
function SkeletonSection(): ReactElement {
	return (
		<Stack className={styles.section} gap="xs" p="sm">
			<Group gap="xs" wrap="nowrap" mih={28}>
				<Skeleton height={16} width={90} />
				<Divider flex={1} color="chalk.2" />
			</Group>
			<Skeleton height={64} radius="md" />
		</Stack>
	);
}

/**
 * Stands in for the phone list's days while the viewer's day isn't known yet,
 * so the list replaces it without moving the page.
 */
export function PhoneDayListSkeleton(): ReactElement {
	return (
		<Stack gap={0} data-testid="phone-day-list-skeleton">
			<SkeletonSection />
			<SkeletonSection />
			<SkeletonSection />
			<SkeletonSection />
			<SkeletonSection />
		</Stack>
	);
}
