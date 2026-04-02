import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';

import { checkEmailStatus } from '@/_actions/auth';
import { getUser } from '@/_actions/user';
import { auth } from '@/_auth';

import { ChangeEmailForm } from './_components/ChangeEmailForm';
import { ChangePasswordForm } from './_components/ChangePasswordForm';

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
		</Container>
	);
};

export default SettingsPage;
