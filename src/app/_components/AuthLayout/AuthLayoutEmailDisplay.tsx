import { Button, Stack, Text } from '@mantine/core';

export interface AuthLayoutEmailDisplayProps {
	email: string;
	onChangeEmail?: () => void;
	'data-testid'?: string;
}

export const AuthLayoutEmailDisplay: React.FC<AuthLayoutEmailDisplayProps> = ({
	email,
	onChangeEmail,
	'data-testid': testId,
}) => {
	return (
		<Stack gap="xs" align="center" data-testid={testId}>
			<Text size="sm" c="dimmed">
				{email}
			</Text>
			{onChangeEmail && (
				<Button
					variant="subtle"
					size="compact-xs"
					onClick={onChangeEmail}
					data-testid="change-email-btn"
				>
					Change email
				</Button>
			)}
		</Stack>
	);
};
