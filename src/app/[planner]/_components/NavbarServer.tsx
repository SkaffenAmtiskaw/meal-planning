import 'server-only';

import { getPlanners } from '@/_actions/planner';

import { Navbar } from './Navbar';

type Props = { id: string };

export const NavbarServer = async ({ id }: Props) => {
	const planners = await getPlanners();

	return (
		<Navbar
			id={id}
			planners={planners.map(({ planner }) => ({
				id: planner._id,
				name: planner.name,
			}))}
		/>
	);
};
