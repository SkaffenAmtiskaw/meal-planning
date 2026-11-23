import { getSavedItem } from '@/_actions/library/getSavedItem';
import type { PlannerInterface } from '@/_models/types';

import { ModalWrapper } from './ModalWrapper';
import type { RecipesModal } from './types';

type Props = {
	planner: PlannerInterface;
	item?: string;
	status?: 'add' | 'edit';
	type?: 'bookmark' | 'recipe';
};

const getModal = async ({
	item: itemId,
	planner,
	status,
	type,
}: Props): Promise<RecipesModal | null> => {
	if (status === 'add' && (type === 'bookmark' || type === 'recipe')) {
		return { status, type };
	}

	if (status === 'edit' && itemId) {
		const item = await getSavedItem(planner._id, itemId);
		if (!item) return null;

		if (type === 'bookmark' && 'url' in item) {
			return { status, type, item };
		}
		if (type === 'recipe' && !('url' in item)) {
			return { status, type, item };
		}
	}

	return null;
};

export const Modal = async (props: Props) => {
	const modal = await getModal(props);
	if (!modal) return null;

	const { planner } = props;

	return (
		<ModalWrapper {...modal} plannerId={planner._id} tags={planner.tags} />
	);
};
