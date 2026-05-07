import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { addUser } from '@/_actions/user';
import { auth } from '@/_auth';
import { User } from '@/_models/user';
import { zObjectId } from '@/_utils/zObjectId';

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
