import type { ReactNode } from 'react';

import { Text } from '@mantine/core';

export interface AuthLayoutHeaderProps {
	children: ReactNode;
}

export const AuthLayoutHeader: React.FC<AuthLayoutHeaderProps> = ({
	children,
}) => {
	return (
		<Text ta="center" size="lg">
			{children}
		</Text>
	);
};
