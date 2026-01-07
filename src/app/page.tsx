import { Button, Center, Stack, Typography } from '@mantine/core';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { addUser } from '@/_actions';
import { SignIn } from '@/_components';
import { User } from '@/_models';
import { auth } from '@/auth';

const Page = async () => {
	/**
	 * 1. If the user is not signed in, make them sign in.
	 * 2. If the user has a query param of "invite", add that meal plan to their user.
	 * 3. If the user is signed in, check if they have an existing meal plan. If so, redirect them to /planner.
	 * 4. If the user is signed in but does not have an existing meal plan, prompt them to create one.
	 */

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// TODO: Fix the Sign In button(???)
	if (!session) {
		return (
			<Center h="100vw" w="100vh">
				<Stack bg="var(--mantine-color-blue-light)" p={24} align="center">
					<Typography>
						<p>In order to use the meal planner, you must sign in.</p>
					</Typography>
					<SignIn />
				</Stack>
			</Center>
		);
	}

	// TODO: Handle invites here.

	const user = await User.findOne({ email: session.user.email }).exec();

	if (user) {
		redirect(`${user.planner[0]._id}/calendar`);
	}

	// TODO: Error handling
	const handleCreateUser = async () => {
		'use server';

		const user = await addUser(session.user.email);

		redirect(`${user.planner[0]._id}/calendar`);
	};

	return (
		<Center h="100vw" w="100vh">
			<Stack bg="var(--mantine-color-blue-light)" p={24} align="center">
				<Typography>
					<p>It looks like you have not created a meal plan yet.</p>
				</Typography>
				<Button onClick={handleCreateUser}>Get Started</Button>
			</Stack>
		</Center>
	);
};

export default Page;
