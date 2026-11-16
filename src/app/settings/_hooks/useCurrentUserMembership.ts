'use client';

import { useCallback, useEffect, useState } from 'react';

import { getUser } from '@/_actions/user';

export interface UseCurrentUserMembershipResult {
	email: string | null;
	isOwner: boolean;
	loading: boolean;
	error: string | null;
}

export const useCurrentUserMembership = (
	plannerId: string,
): UseCurrentUserMembershipResult => {
	const [email, setEmail] = useState<string | null>(null);
	const [isOwner, setIsOwner] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const currentUser = await getUser();

			if (currentUser) {
				setEmail(currentUser.email);
				const currentUserMembership = currentUser.planners.find(
					(p) => p.planner === plannerId,
				);
				setIsOwner(currentUserMembership?.accessLevel === 'owner');
			} else {
				setEmail(null);
				setIsOwner(false);
			}
		} catch {
			setError('Failed to load user data');
			setEmail(null);
			setIsOwner(false);
		} finally {
			setLoading(false);
		}
	}, [plannerId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		email,
		isOwner,
		loading,
		error,
	};
};
