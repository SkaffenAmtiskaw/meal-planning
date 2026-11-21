import Link from 'next/link';
import type { ReactElement } from 'react';

import { Anchor, Text } from '@mantine/core';

import type { ResolvedDish } from '../../_utils/types';
import { isSavedSource, isUrlSource } from '../_utils/dishSource';

interface DishLinkProps {
	dish: ResolvedDish;
	plannerId: string;
	tabIndex?: number;
	size?: 'xs' | 'sm';
}

export function DishLink({
	dish,
	plannerId,
	tabIndex,
	size = 'xs',
}: DishLinkProps): ReactElement {
	if (isUrlSource(dish.source)) {
		return (
			<Anchor
				href={dish.source.url}
				target="_blank"
				rel="noreferrer"
				size={size}
				tabIndex={tabIndex}
			>
				{dish.name}
			</Anchor>
		);
	}

	if (isSavedSource(dish.source)) {
		return (
			<Anchor
				component={Link}
				href={`/${plannerId}/recipes/${dish.source._id}`}
				size={size}
				tabIndex={tabIndex}
			>
				{dish.name}
			</Anchor>
		);
	}

	return <Text size={size}>{dish.name}</Text>;
}
