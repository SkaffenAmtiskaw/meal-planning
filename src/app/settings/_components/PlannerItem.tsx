'use client';

import {
	Accordion,
	Alert,
	Badge,
	Button,
	Divider,
	Group,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';

import type { AccessLevel } from '@/_models/user';

import { InviteForm } from './InviteForm';
import { MemberListContainer } from './MemberListContainer';
import { PendingInvitesList } from './PendingInvitesList';
import { useRenamePlanner } from './useRenamePlanner';

import { useInvites } from '../_hooks/useInvites';
import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

type Props = {
	id: string;
	name: string;
	accessLevel: AccessLevel;
};

const SHOW_MEMBERS_ACCESS_LEVELS: AccessLevel[] = ['owner', 'admin'];

export const PlannerItem = ({ id, name, accessLevel }: Props) => {
	const {
		editing,
		name: editName,
		setName,
		loading,
		error,
		enterEditing,
		cancel,
		save,
	} = useRenamePlanner(id, name);

	const {
		invites,
		loading: invitesLoading,
		error: invitesError,
		inviteStatus,
		inviteError,
		cancelStatus,
		cancelError,
		inviteUser,
		cancelInvite,
	} = useInvites(id);

	const handleInvite = async (email: string) => {
		await inviteUser(email);
	};

	const handleCancel = async (inviteId: string) => {
		await cancelInvite(inviteId);
	};

	return (
		<Accordion>
			<Accordion.Item value={id}>
				<Accordion.Control>
					<Group justify="space-between">
						<span>{name}</span>
						{accessLevel !== 'owner' && (
							<Badge
								data-testid="access-level-badge"
								size="sm"
								color={getAccessLevelColor(accessLevel)}
							>
								{accessLevel}
							</Badge>
						)}
					</Group>
				</Accordion.Control>
				<Accordion.Panel>
					{SHOW_MEMBERS_ACCESS_LEVELS.includes(accessLevel) ? (
						// Owner/Admin view
						<Stack>
							{/* Name editing section */}
							<Group align="flex-end">
								<TextInput
									label="Planner name"
									value={editName}
									onChange={(e) => setName(e.currentTarget.value)}
									disabled={!editing}
									data-testid="planner-name-input"
								/>
								{!editing ? (
									<Button onClick={enterEditing} data-testid="rename-button">
										Rename
									</Button>
								) : (
									<Group>
										<Button
											loading={loading}
											onClick={save}
											data-testid="save-name-button"
										>
											Save
										</Button>
										<Button
											variant="subtle"
											onClick={cancel}
											data-testid="cancel-rename-button"
										>
											Cancel
										</Button>
									</Group>
								)}
							</Group>
							{error && (
								<Alert color="red" data-testid="rename-error">
									{error}
								</Alert>
							)}

							{invitesError && (
								<Alert color="red" data-testid="invites-error">
									{invitesError}
								</Alert>
							)}

							<Divider />

							{/* MemberList section */}
							<MemberListContainer plannerId={id} />

							<Divider />

							{/* Invite Section */}
							<Stack>
								<Text size="sm" fw={500}>
									Invite New Member
								</Text>
								<InviteForm
									status={inviteStatus}
									error={inviteError}
									onInvite={handleInvite}
								/>
							</Stack>

							<Divider />

							{/* Pending Invites Section */}
							<Stack>
								<Text size="sm" fw={500}>
									Pending Invites
								</Text>
								<PendingInvitesList
									invites={invites}
									loading={invitesLoading}
									cancelStatus={cancelStatus}
									cancelError={cancelError}
									onCancel={handleCancel}
								/>
							</Stack>

							<Divider />

							{/* Leave Planner button */}
							<Button
								variant="subtle"
								color="red"
								data-testid="leave-planner-button"
							>
								Leave Planner
							</Button>
						</Stack>
					) : (
						// Read/Write view
						<Stack align="center" py="md">
							<Text size="sm" c="dimmed">
								You have {accessLevel} access to this planner
							</Text>
							<Button
								variant="filled"
								color="red"
								data-testid="leave-planner-button"
							>
								Leave Planner
							</Button>
						</Stack>
					)}
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
};
