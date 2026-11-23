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

	/**
	 * `isSupported` is false on the server, so until the browser has mounted,
	 * draw the switch as if supported, and remove it only once we know.
	 */
	if (mounted && !isSupported) return null;

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
