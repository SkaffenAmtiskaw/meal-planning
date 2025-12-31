'use client';

import { useOneTap } from '@/_hooks';

type Props = {
	children: React.ReactNode;
};

export const OneTapSignInWrapper = ({ children }: Props) => {
	useOneTap();

	return children;
};
