This is a DESTRUCTIVE action. The user should understand that. Have them type DELETE (or their email, or something) to confirm the action.

In addition to deleting both the better-auth user/password (if they logged in that way) and the mongoose User, we need to look at planners. I plan to let planners be shared eventually, so we need to make sure any planners that get deleted are _only_ owned by the user being deleted.

