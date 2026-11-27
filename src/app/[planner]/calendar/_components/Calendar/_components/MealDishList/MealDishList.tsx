import type { ReactElement } from 'react';

import { Group, List, ListItem, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

import styles from './MealDishList.module.css';

import type { ResolvedDish } from '../../../../_utils/types';
import { isRefSource, isUrlSource } from '../../../_utils/dishSource';
import { DishLink } from '../../../DishLink/DishLink';

interface MealDishListProps {
	dishes: ResolvedDish[];
	plannerId: string;
}

export function MealDishList({
	dishes,
	plannerId,
}: MealDishListProps): ReactElement {
	return (
		<List listStyleType="none" spacing={5} className={styles.dishList}>
			{dishes.map((dish) => (
				<ListItem key={dish._id}>
					<Group align="baseline" gap="xs" wrap="wrap">
						<span className={styles.dishName}>
							<DishLink dish={dish} plannerId={plannerId} size="sm" />
						</span>
						{isUrlSource(dish.source) && (
							<IconExternalLink
								aria-hidden
								size={9}
								color="var(--mantine-primary-color-filled)"
							/>
						)}
						{isRefSource(dish.source) && (
							<Text size="xs" c="var(--text-muted)" fs="italic" span>
								{dish.source.ref}
							</Text>
						)}
					</Group>
					{dish.note && (
						<Text
							size="xs"
							c="navy"
							lh={1.5}
							maw="60ch"
							mt={1}
							className={styles.dishNote}
						>
							{dish.note}
						</Text>
					)}
				</ListItem>
			))}
		</List>
	);
}
