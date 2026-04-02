import { Anchor, Center, Stack, Text, Title } from '@mantine/core';

import { ResetPasswordForm } from './_components/ResetPasswordForm';

const ResetPasswordPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) => {
	const { token } = await searchParams;

	if (!token) {
		return (
			<Center h="100%" w="100%">
				<Stack>
					<Title order={3}>Invalid reset link</Title>
					<Text>
						This link is invalid or has expired.{' '}
						<Anchor href="/" data-testid="back-to-sign-in-link">
							Return to sign in
						</Anchor>{' '}
						to request a new one.
					</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<Center h="100%" w="100%">
			<Stack>
				<Title order={3}>Reset your password</Title>
				<ResetPasswordForm token={token} />
			</Stack>
		</Center>
	);
};

export default ResetPasswordPage;
