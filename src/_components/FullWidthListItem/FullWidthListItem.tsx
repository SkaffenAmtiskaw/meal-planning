import type { ComponentProps } from 'react';

import { ListItem } from '@mantine/core';

import classes from './FullWidthListItem.module.css';

type Props = ComponentProps<typeof ListItem>;

export const FullWidthListItem = ({ classNames, ...props }: Props) => (
	<ListItem
		classNames={{
			...classNames,
			itemWrapper: classes.itemWrapper,
			itemLabel: classes.itemLabel,
		}}
		{...props}
	/>
);
