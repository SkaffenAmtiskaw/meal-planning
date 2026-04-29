import type React from 'react';

import { Text, Title } from '@mantine/core';

import { validateInviteToken } from '@/_actions/planner/validateInviteToken';
import { LinkButton } from '@/_components';

import { AuthLayoutHeader, AuthLayoutRoot } from '../_components/AuthLayout';
import { ExpiredInviteView } from './_components/ExpiredInviteView';
import { InviteRegistrationFlow } from './_components/InviteRegistrationFlow';

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
			<AuthLayoutRoot>
				<AuthLayoutHeader>
					In order to join {result.plannerName} you must create an account.
				</AuthLayoutHeader>
				<InviteRegistrationFlow email={result.email} token={token ?? ''} />
			</AuthLayoutRoot>
		);
	}

	// Token is expired - render expired view
	if (!result.valid && result.reason === 'expired') {
		return (
			<AuthLayoutRoot>
				<ExpiredInviteView email={result.email ?? ''} />
			</AuthLayoutRoot>
		);
	}

	// Token is invalid or missing - render error state
	return (
		<AuthLayoutRoot>
			<Title>Invalid Invite</Title>
			<Text>This invite link is invalid or has already been used.</Text>
			<LinkButton href="/" variant="cta">
				Go to Sign In
			</LinkButton>
		</AuthLayoutRoot>
	);
}
