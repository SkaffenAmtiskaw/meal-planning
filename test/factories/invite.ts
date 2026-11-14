import type { PendingInviteInterface } from '@/_models/sharing';
import { PendingInvite } from '@/_models/sharing';

import { uniqueEmail } from './uniqueEmail';

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
}: CreatePendingInviteOptions) =>
	await PendingInvite.create({
		email,
		accessLevel,
		token,
		expiresAt,
		...rest,
	});
