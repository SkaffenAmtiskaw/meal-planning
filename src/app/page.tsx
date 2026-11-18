import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/_auth';

import { SignInPrompt } from './_components/SignInPrompt';
import { getLastOpenedPlannerId } from './_utils/getLastOpenedPlannerId';
import { getOrCreateUser } from './_utils/getOrCreateUser';

const Page = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return <SignInPrompt />;
	}

	const user = await getOrCreateUser(session.user.email, session.user.name);
	const plannerId = await getLastOpenedPlannerId(user.planners);
	redirect(`/${plannerId}/calendar`);
};

export default Page;
