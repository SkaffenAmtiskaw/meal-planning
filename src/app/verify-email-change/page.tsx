import { Anchor, Center, Stack, Text, Title } from '@mantine/core';

import { checkEmailStatus } from '@/_actions/auth';
import { verifyEmailChange } from '@/_actions/user';
import { User } from '@/_models';

import { SetPasswordForm } from './_components/SetPasswordForm';
import { SignInWithNewEmailButton } from './_components/SignInWithNewEmailButton';

const invalidLinkContent = (
	<Center h="100%" w="100%">
		<Stack>
			<Title order={3} data-testid="invalid-title">
				Invalid link
			</Title>
			<Text>
				This link is invalid.{' '}
				<Anchor href="/settings" data-testid="invalid-settings-link">
					Return to settings
				</Anchor>
			</Text>
		</Stack>
	</Center>
);

const expiredLinkContent = (
	<Center h="100%" w="100%">
		<Stack>
			<Title order={3} data-testid="expired-title">
				Link expired
			</Title>
			<Text>
				This link has expired or is no longer valid.{' '}
				<Anchor href="/settings" data-testid="expired-settings-link">
					Return to settings
				</Anchor>{' '}
				to request a new one.
			</Text>
		</Stack>
	</Center>
);

const VerifyEmailChangePage = async ({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) => {
	const { token } = await searchParams;

	if (!token) {
		return invalidLinkContent;
	}

	const user = await User.findOne({ 'pendingEmailChange.token': token }).exec();
	const pendingChange = user?.pendingEmailChange;

	if (
		!user ||
		!pendingChange ||
		new Date(pendingChange.expiresAt) <= new Date()
	) {
		return expiredLinkContent;
	}

	const currentEmail = user.email;
	const newEmail = pendingChange.email;
	const emailStatus = await checkEmailStatus(currentEmail);

	if (emailStatus === 'social-only') {
		return (
			<Center h="100%" w="100%">
				<Stack>
					<Title order={3} data-testid="set-password-title">
						Set a password to continue
					</Title>
					<SetPasswordForm token={token} />
				</Stack>
			</Center>
		);
	}

	const result = await verifyEmailChange(token);
	if (!result.ok) return expiredLinkContent;

	return (
		<Center h="100%" w="100%">
			<Stack>
				<Title order={3} data-testid="success-title">
					Email updated
				</Title>
				<Text data-testid="success-message">
					Your email has been changed to {newEmail}.
				</Text>
				<SignInWithNewEmailButton />
			</Stack>
		</Center>
	);
};

export default VerifyEmailChangePage;
