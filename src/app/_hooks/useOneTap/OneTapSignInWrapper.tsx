'use client';

import { useOneTap } from './useOneTap';

type Props = {
	children: React.ReactNode;
};

export const OneTapSignInWrapper = ({ children }: Props) => {
	useOneTap();

	return children;
};
