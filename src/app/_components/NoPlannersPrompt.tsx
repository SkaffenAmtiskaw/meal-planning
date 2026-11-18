import { AuthLayoutHeader, AuthLayoutRoot } from './AuthLayout';

export const NoPlannersPrompt = () => {
	return (
		<AuthLayoutRoot>
			<AuthLayoutHeader>You don't have any planners yet.</AuthLayoutHeader>
		</AuthLayoutRoot>
	);
};
