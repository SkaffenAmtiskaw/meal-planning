'use client';

import { useRouter } from 'next/navigation';

import { MenuItem } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

import { THEME_COLORS } from '@/_theme/colors';
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
			leftSection={<IconLogout size={16} color={THEME_COLORS.navy} />}
			onClick={handleSignOut}
		>
			Log Out
		</MenuItem>
	);
};

export { SignOutButton };
