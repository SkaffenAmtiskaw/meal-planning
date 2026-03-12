import { Fieldset, Grid, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import type { HydratedDocument } from 'mongoose';
import type { PlannerInterface } from '@/_models/planner';
import type { RecipeInterface } from '@/_models/planner/recipe';
import { zRecipeFormSchema } from '@/_models/planner/recipe';

type Props = {
	planner: HydratedDocument<PlannerInterface>;
	item?: RecipeInterface;
};

export const RecipeForm = ({ item, planner }: Props) => {
	const form = useForm({
		mode: 'uncontrolled',
		validate: zodResolver(zRecipeFormSchema),
	});

	return (
		<form>
			<input
				style={{ display: 'none' }}
				name="plannerId"
				value={planner._id.toString()}
				readOnly
			/>
			<Grid>
				<Grid.Col span={12}>
					<TextInput
						label="Title"
						key={form.key('name')}
						withAsterisk
						{...form.getInputProps('name')}
					/>
				</Grid.Col>
				<Fieldset legend="Source">
					<Grid.Col span={4}>
						<TextInput
							label="Name"
							key={form.key('source.name')}
							{...form.getInputProps('source.name')}
						/>
					</Grid.Col>
					<Grid.Col>
						<TextInput
							label="URL"
							key={form.key('source.url')}
							{...form.getInputProps('source.url')}
						/>
					</Grid.Col>
				</Fieldset>
				<Fieldset legend="Time">
					<Grid.Col span={3}>
						<TextInput
							label="Prep"
							key={form.key('time.prep')}
							{...form.getInputProps('time.prep')}
						/>
					</Grid.Col>
					<Grid.Col span={3}>
						<TextInput
							label="Cook"
							key={form.key('time.cook')}
							{...form.getInputProps('time.cook')}
						/>
					</Grid.Col>
					<Grid.Col span={3}>
						<TextInput
							label="Total"
							key={form.key('time.total')}
							{...form.getInputProps('time.total')}
						/>
					</Grid.Col>
					<Grid.Col span={3}>
						<TextInput
							label="Actual"
							key={form.key('time.actual')}
							{...form.getInputProps('time.actual')}
						/>
					</Grid.Col>
				</Fieldset>
				<Grid.Col span={4}>
					<NumberInput
						label="Servings"
						min={0}
						{...form.getInputProps('servings')}
					/>
				</Grid.Col>
			</Grid>
		</form>
	);
};
