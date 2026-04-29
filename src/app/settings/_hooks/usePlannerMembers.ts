'use client';

import { useCallback, useEffect, useState } from 'react';

import { getPlannerMembers } from '@/_actions/planner/getPlannerMembers';
import type { PlannerMember } from '@/_actions/planner/getPlannerMembers.types';

export interface UsePlannerMembersResult {
	members: PlannerMember[];
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

export const usePlannerMembers = (
	plannerId: string,
): UsePlannerMembersResult => {
	const [members, setMembers] = useState<PlannerMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const result = await getPlannerMembers(plannerId);

			if (result.error) {
				setError(result.error);
				setMembers([]);
			} else {
				setMembers(result.members);
			}
		} catch {
			setError('Failed to load members');
			setMembers([]);
		} finally {
			setLoading(false);
		}
	}, [plannerId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const refresh = useCallback(async () => {
		const result = await getPlannerMembers(plannerId);
		if (!result.error) {
			setMembers(result.members);
		}
	}, [plannerId]);

	return {
		members,
		loading,
		error,
		refresh,
	};
};
