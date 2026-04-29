'use client';

import { useRouter } from 'next/navigation';

import { signUpWithInvite } from '@/_actions/planner/signUpWithInvite';
import { RegistrationForm } from '@/_components/RegistrationForm';

export interface InviteRegistrationFormProps {
	email: string;
	plannerName: string;
	token: string;
}

export const InviteRegistrationForm: React.FC<InviteRegistrationFormProps> = ({
	email,
	plannerName,
	token,
}) => {
	const router = useRouter();

	const handleSubmit = async ({
		name,
		password,
	}: {
		name: string;
		password: string;
	}) => {
		const result = await signUpWithInvite({
			token,
			password,
			name,
		});

		if (!result.success) {
			throw new Error(result.error);
		}

		// Redirect on success
		if (result.redirectUrl) {
			router.push(result.redirectUrl);
		}
	};

	return (
		<RegistrationForm
			email={email}
			onSubmit={handleSubmit}
			submitLabel="Create Account"
			passwordLabel="Create a password"
			showChangeEmail={false}
			message={`In order to join ${plannerName} you must create an account.`}
		/>
	);
};
