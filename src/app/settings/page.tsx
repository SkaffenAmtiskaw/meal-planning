import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
	Container,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTab,
	Title,
} from '@mantine/core';

import { auth } from '@/_auth';

import { PlannerList } from './_components/PlannerList';
import { UserSettings } from './_components/UserSettings';

const SettingsPage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) return redirect('/');

	return (
		<Container py={8}>
			<Title>Settings</Title>
			<Tabs defaultValue="user" mt="lg">
				<TabsList>
					<TabsTab value="user">User Settings</TabsTab>
					<TabsTab value="planners">Planner Settings</TabsTab>
				</TabsList>
				<TabsPanel value="user" pt="lg">
					<UserSettings email={session.user.email} />
				</TabsPanel>
				<TabsPanel value="planners" pt="lg">
					<PlannerList />
				</TabsPanel>
			</Tabs>
		</Container>
	);
};

export default SettingsPage;
