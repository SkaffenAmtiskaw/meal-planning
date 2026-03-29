'use client';

import { Switch } from '@mantine/core';

import { useWakeLock } from 'react-screen-wake-lock';

export const KeepAwakeToggle = () => {
	const { isSupported, released, request, release } = useWakeLock({
		reacquireOnPageVisible: true,
	});

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
