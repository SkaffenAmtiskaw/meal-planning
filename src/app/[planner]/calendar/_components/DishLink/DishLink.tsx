import Link from 'next/link';
import type { ReactElement } from 'react';

import { Anchor, Text } from '@mantine/core';

import type { SerializedDish } from '../../_utils/toScheduleXEvents';

export interface DishLinkProps {
	dish: SerializedDish;
	plannerId: string;
	tabIndex?: number;
}

export function DishLink({
	dish,
	plannerId,
	tabIndex,
}: DishLinkProps): ReactElement {
	if (typeof dish.source === 'object' && dish.source !== null) {
		if ('url' in dish.source) {
			return (
				<Anchor
					href={dish.source.url}
					target="_blank"
					rel="noreferrer"
					size="xs"
					tabIndex={tabIndex}
				>
					{dish.name}
				</Anchor>
			);
		}

		if ('_id' in dish.source) {
			return (
				<Anchor
					component={Link}
					href={`/${plannerId}/recipes/${dish.source._id}`}
					size="xs"
					tabIndex={tabIndex}
				>
					{dish.name}
				</Anchor>
			);
		}
	}

	return <Text size="xs">{dish.name}</Text>;
}
