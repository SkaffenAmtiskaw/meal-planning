import { addUser } from '@/_actions/user';
import { users } from '@/_models/database/users';

/**
 * The signed-in user's document. On first sign-in there is none yet, so it
 * creates one, with a new planner the user owns.
 */
export const getOrCreateUser = async (email: string, name: string) =>
	(await users.findOne({ email })) ?? (await addUser(email, undefined, name));
