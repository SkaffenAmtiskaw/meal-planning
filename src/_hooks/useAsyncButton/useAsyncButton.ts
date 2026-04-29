'use client';

import { useState } from 'react';

export const useAsyncButton = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const run = async (fn: () => Promise<void>) => {
		setLoading(true);
		setError(null);
		try {
			await fn();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred',
			);
		} finally {
			setLoading(false);
		}
	};

	return { loading, error, run };
};
