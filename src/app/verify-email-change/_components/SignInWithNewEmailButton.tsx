'use client';

import { useRouter } from 'next/navigation';

import { Anchor } from '@mantine/core';

import { client } from '@/_utils/auth';

export const SignInWithNewEmailButton = () => {
	const router = useRouter();

	const handleClick = async () => {
		await client.signOut();
		router.push('/');
	};

	return (
		<Anchor component="button" data-testid="sign-in-link" onClick={handleClick}>
			Sign in with your new email
		</Anchor>
	);
};
