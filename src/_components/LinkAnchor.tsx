'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Anchor, type AnchorProps } from '@mantine/core';

interface LinkAnchorProps extends Omit<AnchorProps, 'component'> {
	href: string;
	tabIndex?: number;
	children: ReactNode;
}

// A client component because a server component can't pass Link, a function, to Anchor.
export const LinkAnchor = (props: LinkAnchorProps) => (
	<Anchor component={Link} {...props} />
);
