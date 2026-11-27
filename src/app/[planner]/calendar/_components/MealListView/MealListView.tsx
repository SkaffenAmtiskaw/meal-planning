'use client';

import type { ReactElement } from 'react';

import { useIsMobile } from '@/_hooks';

import { ListView } from '../ListView/ListView';
import { PhoneListView } from '../PhoneListView/PhoneListView';

interface MealListViewProps {
	plannerId: string;
}

export function MealListView({ plannerId }: MealListViewProps): ReactElement {
	return useIsMobile() ? (
		<PhoneListView plannerId={plannerId} />
	) : (
		<ListView plannerId={plannerId} />
	);
}
