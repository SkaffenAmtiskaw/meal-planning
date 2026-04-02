'use client';

import { useRouter } from 'next/navigation';

import { MenuItem } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

import { client } from '@/_utils/auth';

const SignOutButton = () => {
	const router = useRouter();

	const handleSignOut = async () => {
		await client.signOut();
		router.push('/');
	};

	return (
		<MenuItem
			data-testid="sign-out-button"
			leftSection={<IconLogout size={16} />}
			onClick={handleSignOut}
		>
			Log Out
		</MenuItem>
	);
};

export { SignOutButton };
