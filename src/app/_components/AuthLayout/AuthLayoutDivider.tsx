import { Divider } from '@mantine/core';

interface AuthLayoutDividerProps {
	label?: string;
}

export const AuthLayoutDivider: React.FC<AuthLayoutDividerProps> = ({
	label,
}) => {
	return <Divider label={label} />;
};
