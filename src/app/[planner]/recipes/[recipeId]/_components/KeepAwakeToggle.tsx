'use client';

import { useEffect, useState } from 'react';

import { Switch } from '@mantine/core';

import { useWakeLock } from 'react-screen-wake-lock';

export const KeepAwakeToggle = () => {
	const [mounted, setMounted] = useState(false);
	const { isSupported, released, request, release } = useWakeLock({
		reacquireOnPageVisible: true,
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	/* v8 ignore start */
	if (!mounted) return null;
	/* v8 ignore stop */
	if (!isSupported) return null;

	const enabled = released === false;

	const handleChange = async (checked: boolean) => {
		if (checked) {
			await request('screen');
		} else {
			await release();
		}
	};

	return (
		<Switch
			checked={enabled}
			data-testid="keep-awake-toggle"
			label="Keep screen awake"
			onChange={(e) => void handleChange(e.currentTarget.checked)}
		/>
	);
};
