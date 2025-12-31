'use client';

import { Button } from '@mantine/core';
import { IconBrandGoogleFilled } from '@tabler/icons-react';

import { client } from '@/_utils/auth';

export const SignIn = () => {
	const signIn = async () =>
		await client.signIn.social({
			provider: 'google',
		});

	return (
		<Button leftSection={<IconBrandGoogleFilled />} onClick={signIn}>
			Sign In
		</Button>
	);
};
