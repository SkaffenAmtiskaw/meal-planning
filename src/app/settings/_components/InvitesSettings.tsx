import { Stack } from '@mantine/core';

import { acceptInvite } from '@/_actions/planner/acceptInvite';
import { declineInvite } from '@/_actions/planner/declineInvite';
import { getUserInvites } from '@/_actions/planner/getUserInvites';
import { getUser } from '@/_actions/user/getUser';

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
