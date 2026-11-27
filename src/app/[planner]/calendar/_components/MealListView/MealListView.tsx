'use client';

import type { ReactElement } from 'react';

import { useIsMobile } from '@/_hooks';

import { ListView } from '../ListView/ListView';
import { MobileListViewPlaceholder } from '../MobileListViewPlaceholder/MobileListViewPlaceholder';

interface MealListViewProps {
	plannerId: string;
}

export function MealListView({ plannerId }: MealListViewProps): ReactElement {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <MobileListViewPlaceholder />;
	}

	return <ListView plannerId={plannerId} />;
}
