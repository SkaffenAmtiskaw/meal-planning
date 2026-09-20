import { Stack } from '@mantine/core';

import {
	acceptInvite,
	declineInvite,
	getUserInvites,
} from '@/_actions/sharing';
import { getUser } from '@/_actions/user';

import { InvitesSection } from './InvitesSection';

export async function InvitesSettings() {
	const user = await getUser();
	const email = user?.email;

	if (!email) {
		return (
			<Stack>
				<InvitesSection
					invites={[]}
					onAccept={acceptInvite}
					onDecline={declineInvite}
				/>
			</Stack>
		);
	}

	const result = await getUserInvites(email);
	const invites = result.invites;

	return (
		<Stack>
			<InvitesSection
				invites={invites}
				onAccept={acceptInvite}
				onDecline={declineInvite}
			/>
		</Stack>
	);
}
