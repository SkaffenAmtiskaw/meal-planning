import { Divider } from '@mantine/core';

export interface AuthLayoutDividerProps {
	label?: string;
}

export const AuthLayoutDivider: React.FC<AuthLayoutDividerProps> = ({
	label,
}) => {
	return <Divider label={label} />;
};
