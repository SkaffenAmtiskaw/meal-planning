'use client';

import { Burger } from '@mantine/core';

import { useToggleContext } from './ToggleContext';

interface BurgerToggleProps {
	color: string;
}

export const BurgerToggle = ({ color }: BurgerToggleProps) => {
	const { toggle } = useToggleContext();
	return <Burger onClick={toggle} color={color} />;
};
