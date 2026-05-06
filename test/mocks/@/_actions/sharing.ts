/**
 * Shared mock for @/_actions/sharing.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/sharing', async () => await import('@mocks/@/_actions/sharing'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(acceptInvite).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const acceptInvite = vi.fn(async () => ({
	ok: true as const,
	data: { plannerId: '507f1f77bcf86cd799439011' },
}));

export const cancelInvite = vi.fn(async () => ({ success: true as const }));

export const declineInvite = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const getPendingInvites = vi.fn(async () => ({
	invites: [] as PendingInvite[],
}));

export const getPlannerMembers = vi.fn(async () => ({
	members: [] as PlannerMember[],
}));

export const getUserInvites = vi.fn(async () => ({
	invites: [] as UserInvite[],
}));

export const inviteUser = vi.fn(async () => ({
	ok: true as const,
	data: { inviteId: '507f1f77bcf86cd799439012' },
}));

export const leavePlanner = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const removeMember = vi.fn(async () => ({ ok: true as const }));

export const signUpWithInvite = vi.fn(async () => ({
	success: true as const,
	redirectUrl: '/',
}));

export const updateMemberAccess = vi.fn(async () => ({ ok: true as const }));

export const validateInviteToken = vi.fn(async () => ({
	valid: true as const,
	email: 'user@example.com',
	plannerName: "Test User's Planner",
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingInvite {
	id: string;
	email: string;
	accessLevel: 'read' | 'write' | 'admin' | 'owner';
	invitedAt: string;
	expiresAt: string;
}

export interface PlannerMember {
	name: string;
	email: string;
	accessLevel: 'read' | 'write' | 'admin' | 'owner';
}

export interface UserInvite {
	id: string;
	plannerId: string;
	plannerName: string;
	invitedBy: string;
	accessLevel: 'read' | 'write' | 'admin' | 'owner';
	invitedAt: string;
	expiresAt: string;
	token: string;
}

export interface GetUserInvitesResult {
	invites: UserInvite[];
	error?: string;
}

export interface AcceptInviteResult {
	plannerId: string;
}

export interface InviteUserResult {
	inviteId: string;
}

export interface CancelInviteResult {
	success: boolean;
	error?: string;
}

export interface ValidateInviteTokenResult {
	valid: boolean;
	email?: string;
	plannerName?: string;
	reason?: 'expired' | 'invalid';
}

export interface SignUpWithInviteResult {
	success: boolean;
	error?: string;
	redirectUrl?: string;
}

export interface RemoveMemberResult {
	ok: boolean;
	error?: string;
}
