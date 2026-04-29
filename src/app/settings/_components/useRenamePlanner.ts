'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updatePlannerName } from '@/_actions/planner';
import { useEditMode } from '@/_hooks';

export const useRenamePlanner = (id: string, currentName: string) => {
	const router = useRouter();
	const [editing, { enterEditing, exitEditing }] = useEditMode();
	const [name, setName] = useState(currentName);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const save = async () => {
		setLoading(true);
		setError(null);
		const result = await updatePlannerName(id, name);
		setLoading(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		exitEditing();
		router.refresh();
	};

	const cancel = () => {
		setName(currentName);
		exitEditing();
		setError(null);
	};

	return { editing, name, setName, loading, error, enterEditing, cancel, save };
};
