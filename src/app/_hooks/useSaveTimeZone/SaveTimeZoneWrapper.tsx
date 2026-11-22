'use client';

import { useSaveTimeZone } from './useSaveTimeZone';

type Props = {
	children: React.ReactNode;
};

export const SaveTimeZoneWrapper = ({ children }: Props) => {
	useSaveTimeZone();

	return children;
};
