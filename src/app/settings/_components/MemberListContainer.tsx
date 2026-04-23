'use client';

import { useState } from 'react';

import { Alert, Text } from '@mantine/core';

import { MemberList } from './MemberList';

import { useCurrentUserMembership } from '../_hooks/useCurrentUserMembership';
import { usePlannerMembers } from '../_hooks/usePlannerMembers';

interface MemberListContainerProps {
	plannerId: string;
}

export const MemberListContainer = ({
	plannerId,
}: MemberListContainerProps) => {
	const {
		members,
		loading: membersLoading,
		error: membersError,
		refresh,
	} = usePlannerMembers(plannerId);
	const {
		email: currentUserEmail,
		isOwner: currentUserIsOwner,
		loading: userLoading,
		error: userError,
	} = useCurrentUserMembership(plannerId);
	const [updateError, setUpdateError] = useState<string | null>(null);

	const loading = membersLoading || userLoading;
	const error = membersError ?? userError;

	const handleError = (errorMessage: string) => {
		setUpdateError(errorMessage);
	};

	const handleUpdate = () => {
		setUpdateError(null);
		refresh();
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
		<MemberList
			members={members}
			currentUserEmail={currentUserEmail}
			currentUserIsOwner={currentUserIsOwner}
			plannerId={plannerId}
			onUpdate={handleUpdate}
			onError={handleError}
			updateError={updateError}
		/>
	);
};
