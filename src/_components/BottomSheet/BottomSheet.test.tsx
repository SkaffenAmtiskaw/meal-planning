import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { type SwipeDirection, useEscapeLayer, useSwipe } from '@/_hooks';

import { BottomSheet } from './BottomSheet';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

// Swipes the handle and header the way the swipe hook reports it.
function swipe(direction: SwipeDirection): void {
	act(() => vi.mocked(useSwipe).mock.lastCall?.[0].onSwipe(direction));
}

describe('BottomSheet', () => {
	it('closes on a down swipe', () => {
		const onClose = vi.fn();
		render(
			<BottomSheet opened onClose={onClose} title="Jump to date">
				Content
			</BottomSheet>,
		);

		swipe('down');

		expect(onClose).toHaveBeenCalledOnce();
	});

	it.each<SwipeDirection>([
		'left',
		'right',
	])('stays open on a %s swipe', (direction) => {
		const onClose = vi.fn();
		render(
			<BottomSheet opened onClose={onClose} title="Jump to date">
				Content
			</BottomSheet>,
		);

		swipe(direction);

		expect(onClose).not.toHaveBeenCalled();
	});

	it.each([
		true,
		false,
	])('takes Esc from a modal it sits in only while open (open: %s)', (opened) => {
		render(
			<BottomSheet opened={opened} onClose={vi.fn()} title="Jump to date">
				Content
			</BottomSheet>,
		);

		expect(useEscapeLayer).toHaveBeenLastCalledWith(opened);
	});
});
