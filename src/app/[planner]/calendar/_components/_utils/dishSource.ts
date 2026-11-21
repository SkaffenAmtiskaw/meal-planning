import type { ResolvedDish } from '../../_utils/types';

type DishSource = ResolvedDish['source'];

export const isUrlSource = (source: DishSource): source is { url: string } =>
	typeof source === 'object' && 'url' in source;

export const isRefSource = (source: DishSource): source is { ref: string } =>
	typeof source === 'object' && 'ref' in source;

export const isSavedSource = (source: DishSource): source is { _id: string } =>
	typeof source === 'object' && '_id' in source;
