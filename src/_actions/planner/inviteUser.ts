'use server';

import { randomUUID } from 'node:crypto';

import { Types } from 'mongoose';

import { getUser } from '@/_actions';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { sendInviteEmail } from '@/_auth/emails/sendInviteEmail';
import { PendingInvite, Planner, User } from '@/_models';
import type { AccessLevel } from '@/_models/user';
import { serialize } from '@/_utils/serialize';

export interface InviteUserInput {
	plannerId: string;
	email: string;
	accessLevel?: AccessLevel;
}

export interface InviteUserResult {
	success: boolean;
	error?: string;
	inviteId?: string;
}

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const inviteUser = async (
	input: InviteUserInput,
): Promise<InviteUserResult> => {
	try {
		const { plannerId, email, accessLevel = 'read' } = input;

		// 1. Validate email format
		if (!EMAIL_REGEX.test(email)) {
			return { success: false, error: 'Invalid email format' };
		}

		// 2. Verify caller is authenticated and has 'admin' access to the planner
		const authResult = await checkAuth(new Types.ObjectId(plannerId), 'admin');

		if (authResult.type !== 'authorized') {
			return { success: false, error: 'Unauthorized' };
		}

		// 3. Get the caller's user info
		const callerUser = await getUser();

		if (!callerUser) {
			return { success: false, error: 'Unauthorized' };
		}

		// 4. Check if email is already a member of this planner
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			const isMember = existingUser.planners.some(
				(p) => p.planner.toString() === plannerId,
			);

			if (isMember) {
				return { success: false, error: 'User is already a member' };
			}
		}

		// 5. Check if there's already a pending invite for this email/planner combo
		const existingInvite = await PendingInvite.findOne({
			email,
			planner: new Types.ObjectId(plannerId),
		});

		if (existingInvite) {
			return { success: false, error: 'Pending invite already exists' };
		}

		// 6. Generate secure token using crypto.randomUUID()
		const token = randomUUID();

		// 7. Set expiration to 7 days from now
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		// 8. Fetch planner to get the name
		const planner = await Planner.findById(plannerId);
		const plannerName = planner?.name ?? 'Meal Planner';

		// 9. Create PendingInvite document
		const invite = await PendingInvite.create({
			email,
			planner: new Types.ObjectId(plannerId),
			invitedBy: callerUser._id,
			accessLevel,
			token,
			expiresAt,
		});

		// 10. Determine email type based on whether user exists
		const emailType: 'existing_user' | 'new_user' = existingUser
			? 'existing_user'
			: 'new_user';

		// 11. Call sendInviteEmail
		await sendInviteEmail({
			email,
			plannerName,
			inviterName: callerUser.name || 'Someone',
			acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`,
			type: emailType,
		});

		// 12. Return success with inviteId
		return {
			success: true,
			inviteId: serialize(invite)._id.toString(),
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An error occurred',
		};
	}
};
