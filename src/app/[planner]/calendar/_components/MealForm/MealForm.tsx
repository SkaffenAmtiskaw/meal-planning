'use client';

import {
	type FormEvent,
	useEffect,
	useEffectEvent,
	useRef,
	useState,
} from 'react';

import type { MealInput } from '@/_actions/calendar/types';
import type { SavedItem } from '@/_actions/library/types';
import { FormFeedbackAlert } from '@/_components';
import { useFormFeedback, useIsMobile } from '@/_hooks';
import type { ActionResult } from '@/_utils/actionResult';

import type { DishDraft, MealDraft, MealFormStatus } from './types';
import classes from './MealForm.module.css';

import { DishList } from './_components/DishList/DishList';
import { MealFields } from './_components/MealFields/MealFields';
import { MealFormFooter } from './_components/MealFormFooter/MealFormFooter';
import { MealFormLayout } from './_components/MealFormLayout/MealFormLayout';
import { SavedRecipesColumn } from './_components/SavedRecipesColumn/SavedRecipesColumn';
import { useLinkMode } from './_hooks/useLinkMode';
import { useMealDraft } from './_hooks/useMealDraft';
import { useOpenDishList } from './_hooks/useOpenDishList';
import { useSavedSearch } from './_hooks/useSavedSearch';
import { canSubmitMeal } from './_utils/canSubmitMeal';
import { findNamelessDishes } from './_utils/findNamelessDishes';
import { isBlankDish } from './_utils/isBlankDish';
import { linkedItemIds } from './_utils/linkedItemIds';
import { toMealInput } from './_utils/toMealInput';

type MealFormProps = {
	initialDraft: MealDraft;
	// The frame decides what saving calls, so the form never knows whether it's adding or editing.
	save: (input: MealInput) => Promise<ActionResult>;
	// Gets the meal as it was saved, so the frame's message uses what went to the server.
	onSuccess: (saved: MealInput) => void;
	onCancel: () => void;
	onStatusChange?: (status: MealFormStatus) => void;
};

/**
 * The meal form: its fields, its dishes and the footer that saves it. A frame,
 * such as AddMealModal, wraps it and decides what happens around it.
 */
export const MealForm = ({
	initialDraft,
	save,
	onSuccess,
	onCancel,
	onStatusChange,
}: MealFormProps) => {
	const {
		draft,
		setField,
		addDish,
		addLinkedDish,
		removeDish,
		renameDish,
		setReference,
		setNote,
		unlinkDish,
		linkDish,
		chooseRecipe,
	} = useMealDraft(initialDraft);
	const { search, setSearch, resetForLinking } = useSavedSearch();
	const [linkingKey, { enterLinking, exitLinking }] = useLinkMode(draft.dishes);
	const [openListKey, { openList, closeList }] = useOpenDishList();
	const linkingDish =
		draft.dishes.find((dish) => dish.key === linkingKey) ?? null;
	const searchRef = useRef<HTMLInputElement>(null);
	const isMobile = useIsMobile();
	// Calls onSuccess as soon as the save works, so the frame can close at once.
	const { status, countdown, errorMessage, wrap } = useFormFeedback({
		successDuration: 0,
	});

	const reportStatus = useEffectEvent((next: MealFormStatus) =>
		onStatusChange?.(next),
	);
	useEffect(() => {
		reportStatus({
			date: draft.date,
			mealName: draft.mealName,
			linking: linkingKey !== null,
		});
	}, [draft.date, draft.mealName, linkingKey]);

	/**
	 * Links a dish from the Saved recipes column, with the search filled with its
	 * name and the cursor in it. A phone has no column, so it opens the dish's
	 * saved list instead.
	 */
	const startLinking = (dish: DishDraft) => {
		if (isMobile) {
			openList(dish.key);
			return;
		}
		enterLinking(dish.key);
		resetForLinking(dish.name);
		searchRef.current?.focus();
	};

	// On a phone, a new dish opens its saved list, so a saved recipe is the first thing offered.
	const addDishWithList = () => {
		const key = addDish();
		if (isMobile) {
			openList(key);
		}
	};

	// The phone list's Use: the dish takes the recipe, and its list closes.
	const chooseFromList = (key: string, item: SavedItem) => {
		chooseRecipe(key, item);
		closeList();
	};

	// The column's action: links the recipe to the dish being linked, or adds it as a new dish.
	const pickSavedItem = (item: SavedItem) => {
		if (linkingKey === null) {
			addLinkedDish(item);
			return;
		}
		linkDish(linkingKey, item);
		exitLinking();
	};

	/**
	 * Leaving link mode, whether by a pick, Cancel, Esc or deleting the dish,
	 * empties the search the form filled, so the column shows every recipe again.
	 * Set while rendering, as React's docs advise for state that follows a change.
	 */
	const [prevLinkingKey, setPrevLinkingKey] = useState(linkingKey);
	if (linkingKey !== prevLinkingKey) {
		setPrevLinkingKey(linkingKey);
		if (linkingKey === null) {
			setSearch('');
		}
	}

	/**
	 * The dishes a stopped save found with no name. A row shows the error only
	 * while its dish is still nameless, so naming it clears the error at once,
	 * and a dish that loses its name later isn't marked until the next save.
	 */
	const [flaggedKeys, setFlaggedKeys] = useState<ReadonlySet<string>>(
		() => new Set(),
	);
	const namelessDishes = findNamelessDishes(draft.dishes);
	const namelessKeys = new Set(
		namelessDishes
			.map((dish) => dish.key)
			.filter((key) => flaggedKeys.has(key)),
	);

	const linkedIds = linkedItemIds(draft.dishes);
	// A blank row isn't saved, so it isn't counted.
	const dishCount = draft.dishes.filter((dish) => !isBlankDish(dish)).length;

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (namelessDishes.length > 0) {
			setFlaggedKeys(new Set(namelessDishes.map((dish) => dish.key)));
			return;
		}
		const input = toMealInput(draft);
		void wrap(
			() => save(input),
			() => onSuccess(input),
		)();
	};

	return (
		<form onSubmit={handleSubmit} className={classes.form}>
			<MealFormLayout
				alert={
					<FormFeedbackAlert status={status} errorMessage={errorMessage} />
				}
				meal={<MealFields values={draft} onFieldChange={setField} />}
				dishes={
					<DishList
						dishes={draft.dishes}
						dishCount={dishCount}
						namelessKeys={namelessKeys}
						linkingKey={linkingKey}
						linkedIds={linkedIds}
						openListKey={openListKey}
						onAddDish={addDishWithList}
						onRenameDish={renameDish}
						onRemoveDish={removeDish}
						onUnlinkDish={unlinkDish}
						onSetReference={setReference}
						onSetNote={setNote}
						onStartLinking={startLinking}
						onOpenList={openList}
						onCloseList={closeList}
						onChooseRecipe={chooseFromList}
					/>
				}
				saved={
					<SavedRecipesColumn
						search={search}
						onSearchChange={setSearch}
						searchRef={searchRef}
						linkedIds={linkedIds}
						linkingDishName={linkingDish?.name ?? null}
						onCancelLinking={exitLinking}
						onPick={pickSavedItem}
					/>
				}
				footer={
					<MealFormFooter
						dishCount={dishCount}
						status={status}
						countdown={countdown}
						canSubmit={canSubmitMeal(draft)}
						onCancel={onCancel}
					/>
				}
			/>
		</form>
	);
};
