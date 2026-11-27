import type { ReactElement } from 'react';

import { Skeleton, Stack } from '@mantine/core';

import { PhoneDayFrame } from './PhoneDayFrame';
import { PhoneDayHeader } from './PhoneDayHeader';

// One placeholder day: a header line and one card-height block, in a real day's frame and header.
function SkeletonDay(): ReactElement {
	return (
		<PhoneDayFrame
			header={<PhoneDayHeader label={<Skeleton height={16} width={90} />} />}
		>
			<Skeleton height={64} radius="md" />
		</PhoneDayFrame>
	);
}

/**
 * Stands in for the phone list's days while the viewer's day isn't known yet,
 * so the list replaces it without moving the page.
 */
export function PhoneDayListSkeleton(): ReactElement {
	return (
		<Stack gap={0} data-testid="phone-day-list-skeleton">
			<SkeletonDay />
			<SkeletonDay />
			<SkeletonDay />
			<SkeletonDay />
			<SkeletonDay />
		</Stack>
	);
}
