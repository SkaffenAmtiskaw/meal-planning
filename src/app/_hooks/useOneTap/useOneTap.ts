'use client';

import { useEffect } from 'react';

import { client } from '@/_auth/client';

export const useOneTap = () => {
	const session = client.useSession();

	useEffect(() => {
		if (!session.data && !session.isPending) {
			void client.oneTap();
		}
	}, [session]);
};
