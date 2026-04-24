'use client';

import { useRouter } from 'next/navigation';

import { Alert, Badge, Button, Grid, Group, Stack, Text } from '@mantine/core';
import { IconCheck, IconClock, IconX } from '@tabler/icons-react';

import type { AcceptInviteResult } from '@/_actions/planner/acceptInvite';
import type { UserInvite } from '@/_actions/planner/getUserInvites';
import { useAsyncStatus } from '@/_hooks';
import type { ActionResult } from '@/_utils/actionResult/ActionResult';
import { isPastDate, isWithinHours, toLocaleDateString } from '@/_utils/date';

import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

export interface InvitesSectionProps {
	invites: UserInvite[];
	onAccept: (input: {
		token: string;
	}) => Promise<ActionResult<AcceptInviteResult>>;
	onDecline: (input: { inviteId: string }) => Promise<ActionResult<void>>;
}

export const InvitesSection = ({
	invites,
	onAccept,
	onDecline,
}: InvitesSectionProps) => {
	const router = useRouter();
	const { status, error, run } = useAsyncStatus();

	const handleAccept = async (token: string) => {
		const result = await run(() => onAccept({ token }));
		if (result?.ok) {
			router.refresh();
		}
	};

	const handleDecline = async (inviteId: string) => {
		const result = await run(() => onDecline({ inviteId }));
		if (result?.ok) {
			router.refresh();
		}
	};

	const isActionSubmitting = status === 'loading';

	return (
		<Stack>
			<Text fw={500} size="lg">
				Pending Invites
			</Text>

			{invites.length === 0 ? (
				<Text c="dimmed">No pending invites</Text>
			) : (
				<Stack gap="md">
					{invites.map((invite) => {
						const isExpiringSoon = isWithinHours(invite.expiresAt, 24);
						const isExpired = isPastDate(invite.expiresAt);
						const showWarning = isExpiringSoon || isExpired;

						return (
							<Grid key={invite.id} align="center">
								<Grid.Col span="auto">
									<Text fw={500}>{invite.plannerName}</Text>
									<Text size="sm" c="dimmed">
										Invited by {invite.invitedBy}
									</Text>
									<Group gap="xs" mt={4}>
										<Text size="sm" c="dimmed">
											Invited {toLocaleDateString(invite.invitedAt)}
										</Text>
										{showWarning && (
											<Group gap={4}>
												<IconClock size={14} />
												<Text size="xs" c={isExpired ? 'red' : 'orange'}>
													{isExpired ? 'Expired' : 'Expires soon'}
												</Text>
											</Group>
										)}
									</Group>
								</Grid.Col>
								<Grid.Col span="content">
									<Group gap="xs">
										<Badge color={getAccessLevelColor(invite.accessLevel)}>
											{invite.accessLevel}
										</Badge>
										<Button
											aria-label={`Accept invitation to join ${invite.plannerName}`}
											data-testid={`accept-button-${invite.id}`}
											color="green"
											size="xs"
											onClick={() => handleAccept(invite.token)}
											disabled={isActionSubmitting}
										>
											<IconCheck size={16} />
										</Button>
										<Button
											aria-label={`Decline invitation to join ${invite.plannerName}`}
											data-testid={`decline-button-${invite.id}`}
											color="red"
											size="xs"
											onClick={() => handleDecline(invite.id)}
											disabled={isActionSubmitting}
										>
											<IconX size={16} />
										</Button>
									</Group>
								</Grid.Col>
							</Grid>
						);
					})}
				</Stack>
			)}

			{error && (
				<Alert color="red" data-testid="action-error" mt="sm">
					{error}
				</Alert>
			)}
		</Stack>
	);
};
