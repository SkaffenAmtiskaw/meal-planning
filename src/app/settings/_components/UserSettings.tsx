import { Box, Divider, SimpleGrid, Stack, Text, Title } from '@mantine/core';

import { checkEmailStatus } from '@/_actions/auth';
import { getUser } from '@/_actions/user';

import { ChangeEmailForm } from './ChangeEmailForm';
import { ChangeNameForm } from './ChangeNameForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { DeleteAccountForm } from './DeleteAccountForm';
import { InvitesSettings } from './InvitesSettings';

export const UserSettings = async ({ email }: { email: string }) => {
	const [emailStatus, user] = await Promise.all([
		checkEmailStatus(email),
		getUser(),
	]);

	const pendingEmailChange = user?.pendingEmailChange
		? {
				email: user.pendingEmailChange.email,
				expiresAt: user.pendingEmailChange.expiresAt,
			}
		: undefined;

	return (
		<>
			<SimpleGrid cols={{ base: 1, sm: 2 }}>
				<Stack>
					<Title order={3}>Profile</Title>
					<ChangeNameForm currentName={user?.name ?? 'New User'} />
				</Stack>
				<Stack>
					<Title order={3}>Email</Title>
					<ChangeEmailForm
						currentEmail={email}
						pendingEmailChange={pendingEmailChange}
					/>
				</Stack>
				<Stack>
					<Title order={3}>Security</Title>
					{emailStatus === 'has-password' ? (
						<ChangePasswordForm email={email} />
					) : (
						<Text data-testid="social-only-message">
							You signed in with Google. Use the sign-in page to set a password.
						</Text>
					)}
				</Stack>
			</SimpleGrid>

			<Divider mt="xl" />
			<Stack mt="lg">
				<Title order={3}>Pending Invites</Title>
				<InvitesSettings />
			</Stack>

			<Divider mt="xl" />
			<Box
				mt="lg"
				p="md"
				style={{
					border: '1px solid var(--mantine-color-red-6)',
					borderRadius: 'var(--mantine-radius-md)',
				}}
			>
				<Stack>
					<Title order={3}>Danger Zone</Title>
					<DeleteAccountForm />
				</Stack>
			</Box>
		</>
	);
};
