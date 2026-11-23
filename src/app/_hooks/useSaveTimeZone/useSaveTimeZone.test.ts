import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useSaveTimeZone } from './useSaveTimeZone';

describe('useSaveTimeZone', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not yet widely supported
		document.cookie = 'timeZone=; path=/; max-age=0; SameSite=Lax';
	});

	test("saves the browser's time zone in the timeZone cookie on mount", () => {
		vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
			timeZone: 'Asia/Tokyo',
		} as Intl.ResolvedDateTimeFormatOptions);

		renderHook(() => useSaveTimeZone());

		expect(document.cookie).toContain('timeZone=Asia/Tokyo');
	});
});
