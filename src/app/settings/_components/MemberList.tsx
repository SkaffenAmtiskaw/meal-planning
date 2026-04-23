'use client';

import { useEffect, useState } from 'react';

import { Alert, Grid, Stack, Text } from '@mantine/core';

import { getPlannerMembers } from '@/_actions/planner/getPlannerMembers';
import type { PlannerMember } from '@/_actions/planner/getPlannerMembers.types';
import { getUser } from '@/_actions/user';

import { AccessLevelSelect } from './AccessLevelSelect';

interface MemberListProps {
	plannerId: string;
}

export const MemberList = ({ plannerId }: MemberListProps) => {
	const [members, setMembers] = useState<PlannerMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [updateError, setUpdateError] = useState<string | null>(null);
	const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
	const [currentUserIsOwner, setCurrentUserIsOwner] = useState(false);

	useEffect(() => {
		const fetchMembers = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch both members and current user info
				const [membersResult, currentUser] = await Promise.all([
					getPlannerMembers(plannerId),
					getUser(),
				]);

				if (membersResult.error) {
					setError(membersResult.error);
					setMembers([]);
				} else {
					setMembers(membersResult.members);

					// Determine current user's email and if they are owner
					if (currentUser) {
						// Type assertion for currentUser since getUser() returns serialized user
						const typedUser = currentUser as unknown as {
							email: string;
							planners: Array<{
								planner: { toString(): string };
								accessLevel: string;
							}>;
						};

						setCurrentUserEmail(typedUser.email);
						const currentUserMembership = typedUser.planners.find(
							(p) => p.planner.toString() === plannerId,
						);
						setCurrentUserIsOwner(
							currentUserMembership?.accessLevel === 'owner',
						);
					}
				}
			} catch {
				setError('Failed to load members');
				setMembers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchMembers();
	}, [plannerId]);

	const handleUpdate = () => {
		setUpdateError(null);
		// Optionally refresh member list
		const fetchMembers = async () => {
			const result = await getPlannerMembers(plannerId);
			if (!result.error) {
				setMembers(result.members);
			}
		};
		fetchMembers();
	};

	const handleError = (errorMessage: string) => {
		setUpdateError(errorMessage);
	};

	// Determine if a member's access can be modified by the current user
	const canModifyMember = (member: PlannerMember): boolean => {
		// Cannot modify yourself
		if (member.email === currentUserEmail) {
			return false;
		}
		// Cannot modify owner
		if (member.accessLevel === 'owner') {
			return false;
		}
		// Admin cannot modify other admins
		if (!currentUserIsOwner && member.accessLevel === 'admin') {
			return false;
		}
		return true;
	};

	if (loading) {
		return <Text>Loading members...</Text>;
	}

	if (error) {
		return (
			<Alert color="red" data-testid="member-list-error">
				{error}
			</Alert>
		);
	}

	return (
		<Stack>
			{members.map((member) => (
				<Grid key={member.email} align="center">
					<Grid.Col span="auto">
						<Text fw={500}>{member.name}</Text>
						<Text size="sm" c="dimmed">
							{member.email}
						</Text>
					</Grid.Col>
					<Grid.Col span="content">
						{canModifyMember(member) ? (
							<AccessLevelSelect
								plannerId={plannerId}
								memberEmail={member.email}
								currentAccessLevel={member.accessLevel}
								viewerIsOwner={currentUserIsOwner}
								onUpdate={handleUpdate}
								onError={handleError}
							/>
						) : (
							<AccessLevelSelect
								plannerId={plannerId}
								memberEmail={member.email}
								currentAccessLevel={member.accessLevel}
								viewerIsOwner={currentUserIsOwner}
								onUpdate={handleUpdate}
								onError={handleError}
								hidden
							/>
						)}
					</Grid.Col>
				</Grid>
			))}
			{updateError && (
				<Alert color="red" data-testid="update-error" mt="sm">
					{updateError}
				</Alert>
			)}
		</Stack>
	);
};
