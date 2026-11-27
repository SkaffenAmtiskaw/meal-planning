'use client';

import { useState } from 'react';

import { useWindowEvent } from '@mantine/hooks';

import { useEscapeLayer } from '@/_hooks';

type Handlers = {
	enterLinking: (key: string) => void;
	exitLinking: () => void;
};

/**
 * The dish being linked to a saved recipe on desktop, or null. Follows
 * useEditMode's shape. Link mode ends on exit, on Esc, and once the dish is no
 * longer in `dishes`, whatever removed it.
 */
export const useLinkMode = (
	dishes: ReadonlyArray<{ key: string }>,
): [string | null, Handlers] => {
	const [enteredKey, setEnteredKey] = useState<string | null>(null);
	const linkingKey = dishes.some((dish) => dish.key === enteredKey)
		? enteredKey
		: null;
	// Esc leaves link mode, not the whole form.
	useEscapeLayer(linkingKey !== null);

	const exitLinking = () => setEnteredKey(null);

	// Mantine's modal listens on the window too, so a frame turns off its own Esc close while linking.
	useWindowEvent('keydown', (event) => {
		if (event.key === 'Escape' && linkingKey !== null) {
			exitLinking();
		}
	});

	return [linkingKey, { enterLinking: setEnteredKey, exitLinking }];
};
