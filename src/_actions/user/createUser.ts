'use server';

import { redirect } from 'next/navigation';

import { addUser } from '@/_actions';
import { catchify } from '@/_utils/catchify';

export const createUser = async (email: string) => {
	const [user, error] = await catchify(() => addUser(email));

	if (error || !user)
		return { error: 'Failed to create planner. Please try again.' };

	redirect(`${user.planners[0]._id}/calendar`);
};
