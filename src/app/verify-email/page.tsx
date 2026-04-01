import { redirect } from 'next/navigation';

import { Center, Stack, Text, Title } from '@mantine/core';

import { ResendVerificationForm } from './_components/ResendVerificationForm';

const VerifyEmailPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) => {
	const { error } = await searchParams;

	if (!error) {
		redirect('/');
	}

	return (
		<Center h="100%" w="100%">
			<Stack>
				<Title order={3}>Verification link expired</Title>
				<Text>
					This link is no longer valid. Enter your email below to receive a new
					one.
				</Text>
				<ResendVerificationForm />
			</Stack>
		</Center>
	);
};

export default VerifyEmailPage;
