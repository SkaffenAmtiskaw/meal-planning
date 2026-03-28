'use server';

import { redirect } from 'next/navigation';

import { addUser } from '@/_actions';

export const createUser = async (email: string) => {
	// TODO: Error handling
	const user = await addUser(email);

	redirect(`${user.planners[0]._id}/calendar`);
};
