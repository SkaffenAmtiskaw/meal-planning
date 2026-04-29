import { SegmentedControl } from '@mantine/core';

import {
	DESKTOP_VIEWS,
	MOBILE_VIEWS,
	type ViewType,
} from '../../_hooks/useViewType';

type Props = {
	isMobile: boolean | undefined;
	value: ViewType;
	onChange: (v: ViewType) => void;
};

export const ViewSwitcher = ({ isMobile, value, onChange }: Props) => (
	<SegmentedControl
		data-testid="view-switcher"
		data={isMobile ? MOBILE_VIEWS : DESKTOP_VIEWS}
		value={value}
		onChange={(v) => onChange(v as ViewType)}
	/>
);
