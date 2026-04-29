import { renderHook } from '@testing-library/react';

import { afterEach, describe, expect, test } from 'vitest';

import { useLastOpenedPlanner } from './useLastOpenedPlanner';

describe('useLastOpenedPlanner', () => {
	afterEach(() => {
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not yet widely supported
		document.cookie = 'lastOpenedPlanner=; path=/; max-age=0; SameSite=Lax';
	});

	test('sets lastOpenedPlanner cookie on mount', () => {
		renderHook(() => useLastOpenedPlanner('507f1f77bcf86cd799439011'));

		expect(document.cookie).toContain(
			'lastOpenedPlanner=507f1f77bcf86cd799439011',
		);
	});

	test('updates cookie when id changes', () => {
		const { rerender } = renderHook(({ id }) => useLastOpenedPlanner(id), {
			initialProps: { id: '507f1f77bcf86cd799439011' },
		});

		rerender({ id: '507f1f77bcf86cd799439022' });

		expect(document.cookie).toContain(
			'lastOpenedPlanner=507f1f77bcf86cd799439022',
		);
	});
});
