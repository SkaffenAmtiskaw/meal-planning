'use server';

import { randomUUID } from 'node:crypto';

import { Types } from 'mongoose';
import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { sendInviteEmail } from '@/_auth/emails/sendInviteEmail';
import { PendingInvite, Planner, User } from '@/_models';
import type { AccessLevel } from '@/_models/user';
import type { ActionResult } from '@/_utils/actionResult';
import { catchify } from '@/_utils/catchify';
import { serialize } from '@/_utils/serialize';
import { env } from '@/env';

export interface InviteUserInput {
	plannerId: string;
	email: string;
	accessLevel?: AccessLevel;
}

export interface InviteUserResult {
	inviteId: string;
}

export const inviteUser = async (
	input: InviteUserInput,
): Promise<ActionResult<InviteUserResult>> => {
	const { plannerId, email, accessLevel = 'read' } = input;

	// 1. Validate email format
	const emailResult = z.email().safeParse(email);
	if (!emailResult.success) {
		return { ok: false, error: 'Invalid email format' };
	}

	// 2. Verify caller is authenticated and has 'admin' access to the planner
	const [authResult, authError] = await catchify(() =>
		checkAuth(new Types.ObjectId(plannerId), 'admin'),
	);

	if (authError || !authResult || authResult.type !== 'authorized') {
		return { ok: false, error: 'Unauthorized' };
	}

	// 3. Get the caller's user info from auth result
	const callerUser = authResult.user;

	// 4. Check if email is already a member of this planner
	const [existingUser, userError] = await catchify(() =>
		User.findOne({ email }),
	);

	if (userError) {
		return { ok: false, error: userError.message };
	}

	if (existingUser) {
		const isMember = existingUser.planners.some(
			(p) => p.planner.toString() === plannerId,
		);

		if (isMember) {
			return { ok: false, error: 'User is already a member' };
		}
	}

	// 5. Check if there's already a pending invite for this email/planner combo
	const [existingInvite, inviteError] = await catchify(() =>
		PendingInvite.findOne({
			email,
			planner: new Types.ObjectId(plannerId),
		}),
	);

	if (inviteError) {
		return { ok: false, error: inviteError.message };
	}

	if (existingInvite) {
		return { ok: false, error: 'Pending invite already exists' };
	}

	// 6. Generate secure token using crypto.randomUUID()
	const token = randomUUID();

	// 7. Set expiration to 7 days from now
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 7);

	// 8. Fetch planner to get the name
	const [planner, plannerError] = await catchify(() =>
		Planner.findById(plannerId),
	);

	if (plannerError) {
		return { ok: false, error: plannerError.message };
	}

	const plannerName = planner?.name ?? 'Meal Planner';

	// 9. Create PendingInvite document
	const [invite, createError] = await catchify(() =>
		PendingInvite.create({
			email,
			planner: new Types.ObjectId(plannerId),
			invitedBy: callerUser._id,
			accessLevel,
			token,
			expiresAt,
		}),
	);

	if (createError || !invite) {
		return {
			ok: false,
			error: createError?.message ?? 'Failed to create invite',
		};
	}

	// 10. Determine email type and URL based on whether user exists
	const emailType: 'existing_user' | 'new_user' = existingUser
		? 'existing_user'
		: 'new_user';

	// 11. Different URLs for new vs existing users
	// New users go to /invite for registration flow
	// Existing users go to / to handle invite in-app
	const acceptUrl = existingUser
		? `${env.BETTER_AUTH_URL}/`
		: `${env.BETTER_AUTH_URL}/invite?token=${token}`;

	// 12. Call sendInviteEmail
	const [, emailError] = await catchify(() =>
		sendInviteEmail({
			email,
			plannerName,
			inviterName: callerUser.name || 'Someone',
			acceptUrl,
			type: emailType,
		}),
	);

	if (emailError) {
		return { ok: false, error: emailError.message };
	}

	// 13. Return success with inviteId
	return {
		ok: true,
		data: { inviteId: serialize(invite)._id.toString() },
	};
};
