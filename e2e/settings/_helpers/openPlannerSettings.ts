import type { Page } from '../../_fixtures';

// Opens the planner's accordion on the Planner Settings tab, and returns the tab's panel.
export const openPlannerSettings = async (page: Page, plannerName: string) => {
	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await page.getByRole('button', { name: plannerName, exact: true }).click();

	return page.getByRole('tabpanel', { name: 'Planner Settings' });
};
