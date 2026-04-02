import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { Container, Text, Title } from '@mantine/core';

import { checkEmailStatus } from '@/_actions/auth';
import { auth } from '@/_auth';

import { ChangePasswordForm } from './_components/ChangePasswordForm';

const SettingsPage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) return redirect('/');

	const email = session.user.email;
	const emailStatus = await checkEmailStatus(email);

	return (
		<Container py={8}>
			<Title>Settings</Title>
			<Title order={3} mt="lg">
				Security
			</Title>
			<Title order={4} mt="md">
				Password
			</Title>
			{emailStatus === 'has-password' ? (
				<ChangePasswordForm email={email} />
			) : (
				<Text data-testid="social-only-message">
					You signed in with Google. Use the sign-in page to set a password.
				</Text>
			)}
		</Container>
	);
};

export default SettingsPage;
