import type { ReactElement } from 'react';

import { Anchor, Text, VisuallyHidden } from '@mantine/core';

import { LinkAnchor } from '@/_components';

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
				<VisuallyHidden> (opens in a new tab)</VisuallyHidden>
			</Anchor>
		);
	}

	if (isSavedSource(dish.source)) {
		return (
			<LinkAnchor
				href={`/${plannerId}/recipes/${dish.source._id}`}
				size={size}
				tabIndex={tabIndex}
			>
				{dish.name}
			</LinkAnchor>
		);
	}

	return <Text size={size}>{dish.name}</Text>;
}
