import { emailsTo, expect, latestEmailTo, test } from '../_fixtures';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';
import { trySignInWithPassword } from './_helpers/trySignInWithPassword';

const PASSWORD = 'e2e-password';

test('a confirmed delete signs the user out, removes the account and sends the deletion email', async ({
	context,
	page,
}) => {
	const { user } = await signInToNewPlanner(context, {
		accessLevel: 'owner',
		user: { password: PASSWORD },
	});
	await page.goto('/settings');

	await page.getByLabel('Type DELETE to confirm').fill('DELETE');
	await page.getByRole('button', { name: 'Delete account' }).click();

	await expect(page).toHaveURL('/');
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

	expect(await trySignInWithPassword(page, user.email, PASSWORD)).toBe(false);

	// The deletion email has no link to follow.
	const email = await latestEmailTo(user.email);
	expect(email.subject).toBe('Your Meal Planner account has been deleted');

	// The email is free to sign up with again. better-auth answers a sign-up for a taken email as if it
	// worked, without sending the verification email, so the check waits for that email.
	const signUp = await page.request.post('/api/auth/sign-up/email', {
		data: { email: user.email, password: PASSWORD, name: user.name },
		headers: { origin: new URL(page.url()).origin },
	});
	expect(signUp.ok()).toBe(true);
	await expect.poll(async () => (await emailsTo(user.email)).length).toBe(2);
});
