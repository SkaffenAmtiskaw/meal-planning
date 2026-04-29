'use client';

import Link from 'next/link';

import { Button, type ButtonProps } from '@mantine/core';

interface LinkButtonProps extends Omit<ButtonProps, 'component'> {
	href: string;
}

export const LinkButton = (props: LinkButtonProps) => {
	const { ...buttonProps } = props;
	return <Button component={Link} {...buttonProps} />;
};
