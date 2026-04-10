**This work must be planned out so each step can be verified.**

1. A user should invite a user (by email) from the planner settings page/modal.
2. They should also be able to view a list of pending invites, and cancel them.
3. Once accepted, the user should able to view a list of users on the planner, and change their permissions.
4. Invited users will be added at the lowest access level (read-only) - the owner can then change it.
5. When the email belongs to a pre-existing user, that user should get an email, but also see a notification of some sort when they log into the app. The notification should have a link to the settings page. They should have a list of pending invites in their user settings where they can confirm or reject the invite.
6. When the email belongs to someone who is not a pre-existing user, they should receive an email inviting them to create an account. Once they have done so they will be automatically added to the planner.
7. If the owner of a shared planner deletes their email, ownership should be transferred to the user with the next highest access.

## Remaining Work

### Deferred from Planner Access Levels

- Add `members: [{ user: ObjectId, accessLevel }]` to the `Planner` model so planners know who has access (required for listing users and managing permissions in the UI)
- Pass the current user's access level through `PlannerContext` so client components can read it
- Hide write controls (Add Recipe, Add Meal, etc.) for `read` users
- Hide planner settings nav item for non-`admin` users

### Invite Flow

- Planner settings UI: invite by email, list pending invites, cancel invites
- Pending invite model (email, planner, token, expiry)
- In-app notification for existing users with pending invites (link to settings)
- Email to existing users when invited
- Email to new users with sign-up link; auto-add to planner on account creation
- Settings UI: list users on planner, change their access level
- Ownership transfer when owner deletes their account
