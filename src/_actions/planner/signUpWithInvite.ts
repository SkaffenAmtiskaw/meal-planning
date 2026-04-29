'use server';

import { addUser } from '@/_actions/user/addUser';
import { auth } from '@/_auth';
import { PendingInvite } from '@/_models';
import { catchify } from '@/_utils/catchify';

import { validateInviteToken } from './validateInviteToken';

export interface SignUpWithInviteInput {
	token: string;
	password: string;
	name?: string;
}

export interface SignUpWithInviteResult {
	success: boolean;
	error?: string;
	redirectUrl?: string;
}

export const signUpWithInvite = async (
	input: SignUpWithInviteInput,
): Promise<SignUpWithInviteResult> => {
	// Step 1: Validate the token
	const validation = await validateInviteToken(input.token);
	if (!validation.valid) {
		return { success: false, error: 'Invalid or expired invite' };
	}

	// Step 2: Get invite details
	const [invite, inviteError] = await catchify(() =>
		PendingInvite.findOne({ token: input.token }),
	);
	if (inviteError || !invite) {
		return { success: false, error: 'Invite not found' };
	}

	// Normalize name
	const normalizedName = (input.name || 'New User').trim();

	// Step 3: Create Better Auth user using Admin API
	const [betterAuthUser, createError] = await catchify(() =>
		auth.api.createUser({
			body: {
				email: invite.email,
				password: input.password,
				name: normalizedName,
				data: {
					emailVerified: true,
				},
			},
		}),
	);

	if (createError || !betterAuthUser) {
		return {
			success: false,
			error:
				createError instanceof Error
					? createError.message
					: 'Failed to create user',
		};
	}

	// Step 4: Create our app user
	const [, addUserError] = await catchify(() =>
		addUser({
			email: invite.email,
			plannerId: invite.planner,
			name: normalizedName,
			skipPlannerCreation: true,
			accessLevel: invite.accessLevel,
			emailVerified: true,
		}),
	);

	if (addUserError) {
		// Rollback: Delete Better Auth user
		await catchify(() =>
			auth.api.removeUser({ body: { userId: betterAuthUser.user.id } }),
		);
		return {
			success: false,
			error:
				addUserError instanceof Error
					? addUserError.message
					: 'Failed to add user to planner',
		};
	}

	// Step 5: Delete the invite
	await catchify(() => PendingInvite.deleteOne({ _id: invite._id }));

	// Step 6: Return success
	return {
		success: true,
		redirectUrl: `/?invite_success=true&planner=${invite.planner.toString()}`,
	};
};
