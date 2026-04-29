import { AuthLayoutHeader, AuthLayoutRoot } from './AuthLayout';
import { SignInFlow } from './SignInFlow';

export const SignInPrompt = () => {
	return (
		<AuthLayoutRoot>
			<AuthLayoutHeader>
				In order to use the meal planner, you must sign in.
			</AuthLayoutHeader>
			<SignInFlow />
		</AuthLayoutRoot>
	);
};
