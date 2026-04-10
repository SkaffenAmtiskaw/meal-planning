import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { addUser } from '@/_actions';
import { auth } from '@/_auth';
import { User, zObjectId } from '@/_models';

import { SignInPrompt } from './_components/SignInPrompt';

const Page = async () => {
	/**
	 * 1. If the user is not signed in, make them sign in.
	 * 2. If the user has a query param of "invite", add that meal plan to their user.
	 * 3. If the user is signed in, check if they have an existing meal plan. If so, redirect them to /planner.
	 * 4. If the user is signed in but does not have an existing meal plan, create one and redirect.
	 */

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return <SignInPrompt />;
	}

	// TODO: Handle invites here.

	const user = await User.findOne({ email: session.user.email }).exec();

	if (user) {
		const cookieStore = await cookies();
		const lastPlannerId = cookieStore.get('lastOpenedPlanner')?.value;
		const parsed = zObjectId.safeParse(lastPlannerId);
		const validLast =
			parsed.success &&
			user.planners.some(({ planner }) => String(planner) === lastPlannerId);
		const plannerId = validLast
			? lastPlannerId
			: String(user.planners[0].planner);
		redirect(`${plannerId}/calendar`);
	}

	const newUser = await addUser(
		session.user.email,
		undefined,
		session.user.name,
	);
	redirect(`${String(newUser.planners[0].planner)}/calendar`);
};

export default Page;
