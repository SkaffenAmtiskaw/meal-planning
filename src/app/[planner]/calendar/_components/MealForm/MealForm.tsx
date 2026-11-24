'use client';

import { type FormEvent, useEffect, useEffectEvent } from 'react';

import type { MealInput } from '@/_actions/calendar/types';
import { FormFeedbackAlert } from '@/_components';
import { useFormFeedback } from '@/_hooks';
import type { ActionResult } from '@/_utils/actionResult';

import type { MealDraft, MealFormStatus } from './types';
import classes from './MealForm.module.css';

import { DishList } from './_components/DishList/DishList';
import { MealFields } from './_components/MealFields/MealFields';
import { MealFormFooter } from './_components/MealFormFooter/MealFormFooter';
import { MealFormLayout } from './_components/MealFormLayout/MealFormLayout';
import { useMealDraft } from './_hooks/useMealDraft';
import { canSubmitMeal } from './_utils/canSubmitMeal';
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
		removeDish,
		renameDish,
		setReference,
		setNote,
		unlinkDish,
	} = useMealDraft(initialDraft);
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
			linking: false,
		});
	}, [draft.date, draft.mealName]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
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
						onAddDish={addDish}
						onRenameDish={renameDish}
						onRemoveDish={removeDish}
						onUnlinkDish={unlinkDish}
						onSetReference={setReference}
						onSetNote={setNote}
					/>
				}
				footer={
					<MealFormFooter
						dishCount={draft.dishes.length}
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
