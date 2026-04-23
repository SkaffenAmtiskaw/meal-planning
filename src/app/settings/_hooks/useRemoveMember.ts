'use client';

import { useCallback, useState } from 'react';

import { removeMember } from '@/_actions/planner/removeMember';

export interface UseRemoveMemberResult {
	remove: () => Promise<boolean>;
	isLoading: boolean;
	error: string | null;
}

export const useRemoveMember = (
	plannerId: string,
	memberEmail: string,
): UseRemoveMemberResult => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const remove = useCallback(async (): Promise<boolean> => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await removeMember(plannerId, memberEmail);

			if (result.ok) {
				return true;
			} else {
				setError(result.error ?? 'Failed to remove member');
				return false;
			}
		} catch {
			setError('An unexpected error occurred');
			return false;
		} finally {
			setIsLoading(false);
		}
	}, [plannerId, memberEmail]);

	return {
		remove,
		isLoading,
		error,
	};
};
