import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { addUser } from '@/_actions/user';
import { auth } from '@/_auth';
import { users } from '@/_models/database/users';

import { SignInPrompt } from './_components/SignInPrompt';

const Page = async ({
	searchParams: _searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return <SignInPrompt />;
	}

	const user = await users.findOne({ email: session.user.email });

	if (user) {
		const cookieStore = await cookies();
		const lastPlannerId = cookieStore.get('lastOpenedPlanner')?.value;
		const isMember = user.planners.some(
			({ planner }) => planner === lastPlannerId,
		);
		const plannerId =
			isMember && lastPlannerId ? lastPlannerId : user.planners[0].planner;
		redirect(`${plannerId}/calendar`);
	}

	const newUser = await addUser(
		session.user.email,
		undefined,
		session.user.name,
	);
	redirect(`${newUser.planners[0].planner}/calendar`);
};

export default Page;
