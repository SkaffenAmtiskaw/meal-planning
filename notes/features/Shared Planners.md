1. A user should invite a user (by email) from the planner settings page/modal.
2. They should also be able to view a list of pending invites, and cancel them.
3. Once accepted, the user should able to view a list of users on the planner, and change their permissions.
4. Invited users will be added at the lowest access level (read-only) - the owner can then change it.
5. When the email belongs to a pre-existing user, that user should get an email, but also see a notification of some sort when they log into the app. The notification should have a link to the settings page. They should have a list of pending invites in their user settings where they can confirm or reject the invite.
6. When the email belongs to someone who is not a pre-existing user, they should receive an email inviting them to create an account. Once they have done so they will be automatically added to the planner.
7. If the owner of a shared planner deletes their email, ownership should be transferred to the user with the next highest access.

**Note** - This feature will be hard to fully implement without implementing [[Planner Access Levels|planner access levels]]. We may need to work out a plan to work back and forth between the two implementing small pieces of each.