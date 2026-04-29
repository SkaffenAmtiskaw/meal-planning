import type { ReactNode } from 'react';

import { Stack } from '@mantine/core';

export interface AuthLayoutFormSectionProps {
	children: ReactNode;
}

export const AuthLayoutFormSection: React.FC<AuthLayoutFormSectionProps> = ({
	children,
}) => {
	return (
		<Stack gap="md" w="100%">
			{children}
		</Stack>
	);
};
