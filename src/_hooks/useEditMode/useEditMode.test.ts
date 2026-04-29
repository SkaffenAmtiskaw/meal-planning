import { act, renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { useEditMode } from './useEditMode';

describe('use edit mode', () => {
	test('should initialize the state as false by default', () => {
		const { result } = renderHook(() => useEditMode());

		const [editing] = result.current;

		expect(editing).toBe(false);
	});

	test('should take an optional argument with the initial state', () => {
		const { result } = renderHook(() => useEditMode(true));

		const [editing] = result.current;

		expect(editing).toBe(true);
	});

	test('should allow the user to turn on editing', async () => {
		const { result } = renderHook(() => useEditMode());

		const [, { enterEditing }] = result.current;

		await act(async () => enterEditing());

		const [editing] = result.current;

		expect(editing).toBe(true);
	});

	test('should allow the user to turn on editing', async () => {
		const { result } = renderHook(() => useEditMode(true));

		const [, { exitEditing }] = result.current;

		await act(async () => exitEditing());

		const [editing] = result.current;

		expect(editing).toBe(false);
	});
});
