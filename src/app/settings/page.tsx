import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
	Box,
	Container,
	Divider,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core';

import { checkEmailStatus } from '@/_actions/auth';
import { getUser } from '@/_actions/user';
import { auth } from '@/_auth';

import { ChangeEmailForm } from './_components/ChangeEmailForm';
import { ChangeNameForm } from './_components/ChangeNameForm';
import { ChangePasswordForm } from './_components/ChangePasswordForm';
import { DeleteAccountForm } from './_components/DeleteAccountForm';

const SettingsPage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) return redirect('/');

	const email = session.user.email;
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
		<Container py={8}>
			<Title>Settings</Title>
			<SimpleGrid cols={{ base: 1, sm: 2 }} mt="lg">
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
		</Container>
	);
};

export default SettingsPage;
