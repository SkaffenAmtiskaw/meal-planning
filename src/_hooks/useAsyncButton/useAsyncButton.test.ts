import { act, renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { useAsyncButton } from './useAsyncButton';

describe('useAsyncButton', () => {
	test('returns loading=false and error=null initially', () => {
		const { result } = renderHook(() => useAsyncButton());

		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	test('sets loading=true while fn is running and false after it resolves', async () => {
		const { result } = renderHook(() => useAsyncButton());

		let resolve!: () => void;
		const deferred = new Promise<void>((res) => {
			resolve = res;
		});

		let runPromise!: Promise<void>;
		act(() => {
			runPromise = result.current.run(async () => {
				await deferred;
			});
		});

		expect(result.current.loading).toBe(true);

		await act(async () => {
			resolve();
			await runPromise;
		});

		expect(result.current.loading).toBe(false);
	});

	test('sets error when fn throws an Error', async () => {
		const { result } = renderHook(() => useAsyncButton());

		await act(async () => {
			await result.current.run(async () => {
				throw new Error('something broke');
			});
		});

		expect(result.current.error).toBe('something broke');
		expect(result.current.loading).toBe(false);
	});

	test('sets fallback error message when fn throws a non-Error', async () => {
		const { result } = renderHook(() => useAsyncButton());

		await act(async () => {
			await result.current.run(async () => {
				// biome-ignore lint/suspicious/noExplicitAny: intentional non-Error throw for test
				throw 'raw string' as any;
			});
		});

		expect(result.current.error).toBe('An unexpected error occurred');
	});

	test('clears previous error when run is called again', async () => {
		const { result } = renderHook(() => useAsyncButton());

		await act(async () => {
			await result.current.run(async () => {
				throw new Error('first error');
			});
		});

		expect(result.current.error).toBe('first error');

		await act(async () => {
			await result.current.run(async () => {});
		});

		expect(result.current.error).toBeNull();
	});
});
