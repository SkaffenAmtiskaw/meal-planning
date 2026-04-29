import type React from 'react';

import { Text, Title } from '@mantine/core';

import { validateInviteToken } from '@/_actions/planner/validateInviteToken';
import { AuthCard, LinkButton } from '@/_components';

import { ExpiredInviteView } from './_components/ExpiredInviteView';
import { InviteRegistrationForm } from './_components/InviteRegistrationForm';

interface PageProps {
	searchParams: Promise<{ token?: string }>;
}

export default async function Page({
	searchParams,
}: PageProps): Promise<React.JSX.Element> {
	const { token } = await searchParams;

	// Validate the token server-side
	const result = await validateInviteToken(token ?? '');

	// Token is valid - render registration form
	if (result.valid && result.email && result.plannerName) {
		return (
			<AuthCard>
				<InviteRegistrationForm
					email={result.email}
					plannerName={result.plannerName}
					token={token ?? ''}
				/>
			</AuthCard>
		);
	}

	// Token is expired - render expired view
	if (!result.valid && result.reason === 'expired') {
		return (
			<AuthCard>
				<ExpiredInviteView email={result.email ?? ''} />
			</AuthCard>
		);
	}

	// Token is invalid or missing - render error state
	return (
		<AuthCard>
			<Title>Invalid Invite</Title>
			<Text>This invite link is invalid or has already been used.</Text>
			<LinkButton href="/" variant="cta">
				Go to Sign In
			</LinkButton>
		</AuthCard>
	);
}
