import { AuthLayoutHeader, AuthLayoutRoot } from './AuthLayout';
import { CreatePlannerButton } from './CreatePlannerButton';

export const NoPlannersPrompt = () => {
	return (
		<AuthLayoutRoot>
			<AuthLayoutHeader>You don't have any planners yet.</AuthLayoutHeader>
			<CreatePlannerButton />
		</AuthLayoutRoot>
	);
};
