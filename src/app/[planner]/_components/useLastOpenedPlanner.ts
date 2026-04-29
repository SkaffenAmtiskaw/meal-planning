'use client';

import { useEffect } from 'react';

export const useLastOpenedPlanner = (id: string) => {
	useEffect(() => {
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not yet widely supported
		document.cookie = `lastOpenedPlanner=${id}; path=/; max-age=31536000; SameSite=Lax`;
	}, [id]);
};
