import { newId } from '@/_models/database/newId';
import { pendingInvites } from '@/_models/database/pendingInvites';
import type { PendingInviteInterface } from '@/_models/sharing';

import { uniqueEmail } from './uniqueEmail';
import { withoutUndefined } from './withoutUndefined';

type CreatePendingInviteOptions = Pick<
	PendingInviteInterface,
	'planner' | 'invitedBy'
> &
	Partial<Omit<PendingInviteInterface, 'planner' | 'invitedBy'>>;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Writes a pending invite with the same defaults inviteUser gives one.
export const createPendingInvite = async ({
	email = uniqueEmail(),
	accessLevel = 'read',
	token = crypto.randomUUID(),
	expiresAt = new Date(Date.now() + SEVEN_DAYS_MS),
	...rest
}: CreatePendingInviteOptions) => {
	const invite = {
		_id: newId(),
		email,
		accessLevel,
		token,
		expiresAt,
		...withoutUndefined(rest),
	};
	await pendingInvites.insertOne(invite);
	return invite;
};
