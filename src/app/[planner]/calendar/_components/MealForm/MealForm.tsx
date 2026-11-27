'use client';

import type { MealInput } from '@/_actions/calendar/types';
import { FormFeedbackAlert } from '@/_components';
import { useFormFeedback } from '@/_hooks';
import type { ActionResult } from '@/_utils/actionResult';

import classes from './MealForm.module.css';

import {
	hasRequiredFields,
	useMealDishes,
	useMealFormContext,
} from '../_hooks/useMealForm';
import { DishList } from './_components/DishList/DishList';
import { MealFields } from './_components/MealFields/MealFields';
import { MealFormFooter } from './_components/MealFormFooter/MealFormFooter';
import { MealFormLayout } from './_components/MealFormLayout/MealFormLayout';
import { SavedRecipesColumn } from './_components/SavedRecipesColumn/SavedRecipesColumn';
import { DishLinkingProvider, useDishLinking } from './_hooks/useDishLinking';
import { toMealInput } from './_utils/toMealInput';

type MealFormProps = {
	// The frame decides what saving calls, so the form never knows whether it's adding or editing.
	save: (input: MealInput) => Promise<ActionResult>;
	// Gets the meal as it was saved, so the frame's message uses what went to the server.
	onSuccess: (saved: MealInput) => void;
	onCancel: () => void;
};

/**
 * The meal form: its fields, its dishes and the footer that saves it. Its
 * values come from the MealFormProvider its frame wraps it in, and the frame,
 * such as AddMealModal, decides what happens around it.
 */
export const MealForm = ({ save, onSuccess, onCancel }: MealFormProps) => {
	const form = useMealFormContext();
	const { dishCount, linkedIds } = useMealDishes();
	const linking = useDishLinking();
	// Calls onSuccess as soon as the save works, so the frame can close at once.
	const { status, countdown, errorMessage, wrap } = useFormFeedback({
		successDuration: 0,
	});

	// Runs only once the values pass, so a nameless dish stops the save with its mark.
	const handleSubmit = form.onSubmit((values) => {
		const input = toMealInput(values);
		return wrap(
			() => save(input),
			() => onSuccess(input),
		)();
	});

	return (
		<form onSubmit={handleSubmit} className={classes.form}>
			<DishLinkingProvider value={linking}>
				<MealFormLayout
					alert={
						<FormFeedbackAlert status={status} errorMessage={errorMessage} />
					}
					meal={<MealFields />}
					dishes={<DishList onAddDish={linking.addDishWithList} />}
					saved={
						<SavedRecipesColumn
							linkingDish={linking.linkingDish}
							searchRef={linking.searchRef}
							linkedIds={linkedIds}
							onCancelLinking={linking.exitLinking}
							onPick={linking.pickSavedItem}
						/>
					}
					footer={
						<MealFormFooter
							dishCount={dishCount}
							status={status}
							countdown={countdown}
							canSubmit={hasRequiredFields(form.values)}
							onCancel={onCancel}
						/>
					}
				/>
			</DishLinkingProvider>
		</form>
	);
};
