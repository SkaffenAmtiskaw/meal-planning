import type { ReactNode } from 'react';

import { Stack } from '@mantine/core';

export interface AuthLayoutSocialSectionProps {
	children: ReactNode;
}

export const AuthLayoutSocialSection: React.FC<
	AuthLayoutSocialSectionProps
> = ({ children }) => {
	return <Stack gap="sm">{children}</Stack>;
};
