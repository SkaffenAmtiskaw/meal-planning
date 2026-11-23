'use client';

import { useEffect } from 'react';

export const useSaveTimeZone = () => {
	useEffect(() => {
		const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not yet widely supported
		document.cookie = `timeZone=${timeZone}; path=/; max-age=31536000; SameSite=Lax`;
	}, []);
};
