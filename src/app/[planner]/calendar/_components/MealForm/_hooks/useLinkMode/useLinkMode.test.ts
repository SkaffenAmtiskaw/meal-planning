import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useWindowEvent } from '@mantine/hooks';

import { makeDishDraft } from '#fixtures/dish';

import { useLinkMode } from './useLinkMode';

vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));

const dishes = [makeDishDraft({ key: 'a' }), makeDishDraft({ key: 'b' })];

// Runs the hook's keydown listener, as the window would.
const pressKey = (key: string) =>
	act(() =>
		vi
			.mocked(useWindowEvent<'keydown'>)
			.mock.lastCall?.[1].call(window, new KeyboardEvent('keydown', { key })),
	);

describe('useLinkMode', () => {
	it('starts with no dish being linked, and tracks the one entered', () => {
		const { result } = renderHook(() => useLinkMode(dishes));
		expect(result.current[0]).toBeNull();

		act(() => result.current[1].enterLinking('b'));

		expect(result.current[0]).toBe('b');
	});

	it('leaves link mode on exit', () => {
		const { result } = renderHook(() => useLinkMode(dishes));
		act(() => result.current[1].enterLinking('a'));

		act(() => result.current[1].exitLinking());

		expect(result.current[0]).toBeNull();
	});

	it('leaves link mode once the dish being linked is gone', () => {
		const { result, rerender } = renderHook(
			({ current }) => useLinkMode(current),
			{ initialProps: { current: dishes } },
		);
		act(() => result.current[1].enterLinking('a'));

		rerender({ current: [dishes[1]] });

		expect(result.current[0]).toBeNull();
	});

	it('leaves link mode on Esc', () => {
		const { result } = renderHook(() => useLinkMode(dishes));
		act(() => result.current[1].enterLinking('a'));

		pressKey('Escape');

		expect(result.current[0]).toBeNull();
	});

	it('stays in link mode on other keys', () => {
		const { result } = renderHook(() => useLinkMode(dishes));
		act(() => result.current[1].enterLinking('a'));

		pressKey('Enter');

		expect(result.current[0]).toBe('a');
	});
});
