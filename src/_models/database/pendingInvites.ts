import { checkedCollection } from './checkedCollection';
import { rawDatabase } from './connection';

import type { PendingInviteInterface } from '../sharing/pendingInvite.types';
import { zPendingInvite } from '../sharing/pendingInvite.types';

export const pendingInvites = checkedCollection(
	rawDatabase.collection<PendingInviteInterface>('pendinginvites'),
	zPendingInvite,
);
