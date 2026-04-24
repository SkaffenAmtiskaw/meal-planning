import { mockSend } from '@mocks/resend';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendInviteEmail } from './sendInviteEmail';

vi.mock('resend', async () => await import('@mocks/resend'));

const MOCK_EMAIL = 'invite@example.com';
const MOCK_PLANNER_NAME = 'My Meal Plan';
const MOCK_INVITER_NAME = 'John Doe';
const MOCK_ACCEPT_URL = 'https://app.example.com/accept?token=abc123';

describe('sendInviteEmail', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('sends email to existing user with correct subject and content', async () => {
		await sendInviteEmail({
			email: MOCK_EMAIL,
			plannerName: MOCK_PLANNER_NAME,
			inviterName: MOCK_INVITER_NAME,
			acceptUrl: MOCK_ACCEPT_URL,
			type: 'existing_user',
		});

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'from@example.com',
				to: MOCK_EMAIL,
				subject: `You've been invited to join ${MOCK_PLANNER_NAME} on Meal Planner`,
				html: expect.stringContaining(MOCK_INVITER_NAME),
			}),
		);
	});

	it('sends email to new user with signup instructions', async () => {
		await sendInviteEmail({
			email: MOCK_EMAIL,
			plannerName: MOCK_PLANNER_NAME,
			inviterName: MOCK_INVITER_NAME,
			acceptUrl: MOCK_ACCEPT_URL,
			type: 'new_user',
		});

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'from@example.com',
				to: MOCK_EMAIL,
				html: expect.stringContaining('create an account'),
			}),
		);
	});

	it('includes the accept URL in the email body', async () => {
		await sendInviteEmail({
			email: MOCK_EMAIL,
			plannerName: MOCK_PLANNER_NAME,
			inviterName: MOCK_INVITER_NAME,
			acceptUrl: MOCK_ACCEPT_URL,
			type: 'existing_user',
		});

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				html: expect.stringContaining(MOCK_ACCEPT_URL),
			}),
		);
	});

	it('throws when Resend API fails', async () => {
		const error = new Error('Resend API error');
		mockSend.mockRejectedValueOnce(error);

		await expect(
			sendInviteEmail({
				email: MOCK_EMAIL,
				plannerName: MOCK_PLANNER_NAME,
				inviterName: MOCK_INVITER_NAME,
				acceptUrl: MOCK_ACCEPT_URL,
				type: 'existing_user',
			}),
		).rejects.toThrow('Resend API error');
	});
});
