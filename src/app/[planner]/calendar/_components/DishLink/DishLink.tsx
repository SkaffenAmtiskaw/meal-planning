import Link from 'next/link';
import type { ReactElement } from 'react';

import { Anchor, Text } from '@mantine/core';

import type { SerializedDish } from '../../_utils/toScheduleXEvents';

export interface DishLinkProps {
	dish: SerializedDish;
	plannerId: string;
}

export function DishLink({ dish, plannerId }: DishLinkProps): ReactElement {
	if (typeof dish.source === 'object' && dish.source !== null) {
		if ('url' in dish.source) {
			return (
				<Anchor
					href={dish.source.url}
					target="_blank"
					rel="noreferrer"
					size="xs"
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
				>
					{dish.name}
				</Anchor>
			);
		}
	}

	return <Text size="xs">{dish.name}</Text>;
}
