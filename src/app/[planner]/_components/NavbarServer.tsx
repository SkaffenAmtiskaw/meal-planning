import 'server-only';

import { getPlanners } from '@/_actions/planner';
import { Navbar } from '@/_components';

type Props = { id: string };

export const NavbarServer = async ({ id }: Props) => {
	const planners = await getPlanners();

	return (
		<Navbar
			id={id}
			planners={planners.map(({ planner }) => ({
				id: String(planner._id),
				name: planner.name ?? '',
			}))}
		/>
	);
};
