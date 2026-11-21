# Project Conventions
This doc is for anyone writing code in `src/`. It explains how the code is organized and the conventions it follows, with the reason for each. It assumes you know Next.js's App Router and React. A map of the repo's folders is in `docs/project_structure.md`.

# Naming Conventions
Files that Next.js names, such as `page.tsx` and `global-error.tsx`, keep the names Next.js gives them. Every other file name is camelCase, or UpperCamelCase for a React component's file, as is usual in JavaScript and TypeScript.

Except in the two kinds of file below, a file's name leaves out what its directory already says, such as `users.ts` rather than `authUsers.ts` for the better-auth functions in `src/_auth/`. The directory already shows what area a file belongs to, so repeating it only makes the name longer. The two kinds of file that keep their directory's name:
- **A module's main file in a directory of its own,** such as `src/_hooks/useEditMode/useEditMode.ts`, because the directory exists to hold that one module with its tests and parts.
- **A React component's file,** such as `AuthLayout/AuthLayoutHeader.tsx`, because it shares its component's name. A component's name has to say what it is wherever the component is rendered, where its directory isn't shown.

The names a file exports are a separate choice. They're read at the call site, without the path. So an export such as `findAuthUser` keeps "Auth", which tells better-auth's users apart from the app's own.

# Comments
A comment longer than one line is a `/** */` block, because an editor can fold the block away. A one-line comment uses `//`.

# Imports
When a path alias is shorter than the relative path, import through it, such as `@/_components` rather than `../../../../_components`. The aliases are in `tsconfig.json`, such as `@/` for `src/` and `#mocks/` for `test/mocks/`. An alias reads the same from any file, and doesn't break when the importing file moves.

# Barrel Files
A barrel file only re-exports. Coverage leaves barrel files out (see `docs/unit_tests.md`), so logic in one has no tests.

A barrel never makes code available further than it already is, as "Generic vs Domain-Specific Code" below describes.

A file of server code that isn't a `'use server'` action, such as one that imports `server-only` or a package that runs only on the server, stays out of any barrel that client code imports. Client code pulls in everything a barrel re-exports, and server code there fails `pnpm build` in client code. Server code imports the file itself instead. The types other files import from it go in its directory's `types.ts`, which the barrel can re-export (see "Where Types Live" below). This interim rule holds until server-only code moves to the planned data access layer.

# Test Mocks
Shared unit-test mocks live in `test/mocks/` (see `docs/unit_tests.md`, "Shared Mocks"), never in `src/`. Coverage counts every file in `src/` as app code, so a mock there would need tests of its own.

# Generic vs Domain-Specific Code
`src/_components`, `src/_hooks` and `src/_utils` hold only generic code, meaning small, reusable pieces that know nothing about the app's domain, such as meals, planners, invites or tags. Generic code is named for what it does, such as `catchify` or `ConfirmButton`, rather than for a purpose in the app. A name tied to one use makes code look domain-specific, so the next person who needs it won't think to look in the generic folders.

The app's machinery isn't generic, even when it knows nothing about the domain. Machinery is the code that sets up and runs a part of the app, such as its connection to an outside service. A reader looking for how the app reports errors or signs users in looks for a folder named for that job, and a reader looking for a reusable piece shouldn't have to sort through the app's machinery to find it. So machinery goes where the rules below put domain code, with its job, such as error reporting or auth, treated as its domain. The PostHog error reporting is in `src/_reporting/`, and the better-auth client is in `src/_auth/`.

Code that knows about the domain lives near the code that uses it, so its place shows which code depends on it. A `_`-prefixed folder's contents can be used from anywhere inside its parent folder. So where domain code goes depends on how widely it's used, in these cases:
- **If every file using it is inside one folder below `src/`,** it goes under the deepest folder that contains them all, in a `_`-prefixed folder there such as `_components`, `_hooks` or `_utils`. `TagCombobox` is used only by the recipe pages, so it belongs in `src/app/[planner]/recipes/_components/`. `Header` is used across the app's pages, so it's in `src/app/_components/`.
- **If it's used from across `src/`:**
  - **If the code that produces it has a domain folder,** it goes there as a plain file, so a reader looking at that code finds what it produces beside it. `noSessionError` holds the error `getUser` throws, and both actions and pages check for it, so it belongs beside `getUser` in `src/_actions/user/`.
  - **Otherwise,** create a src-level folder named for the code's domain, such as `src/_<domain>/`, when the first such file is written. One shared folder for all such code would be reached into from every part of the app, so where a file sits would no longer show which code depends on it.

> [!NOTE]
> The `_`-prefixed folders in `src/`, such as `_actions/`, `_auth/` and `_models/`, can each be used from anywhere in `src/`. A domain folder inside one of them, such as `_actions/sharing/`, isn't `_`-prefixed, so it has the same scope as the folder it's in. A file there is as available to a page as to another action. Only a `_`-prefixed folder nested inside it, such as `_actions/sharing/_utils/`, narrows the scope to that domain folder.

A barrel re-exports only code that its importers could already import directly, so it never widens that code's scope. Re-exporting code from a nested `_`-prefixed folder to importers outside it would hide which code depends on it.

# Where Types Live
A type lives with the module that owns it, so it's found where that code is and changes along with it. Placing types this way keeps a type from being visible further than the code that uses it, and keeps types from piling up in one file that every part of the app reaches into. Two kinds of type have fixed homes instead, described at the end.

When a type passes between modules, it belongs to the one that decides its shape. So a type that describes one module's input or output belongs to that module, and a component's input belongs to the component, even when a route builds the value it's given. `useFormFeedback` decides which states a form's `Status` can have, so the type belongs to the hook, not to `SubmitButton` and `FormFeedbackAlert`, which take it.

If only the owning module's file uses a type, it stays in that file, unexported. A module's own test doesn't count, so a type that only its test also imports stays in the module's file, exported. If other files import it, it goes in the `types.ts` of the module's directory, with the imported types of the directory's other modules, so a reader looking for a type has one file per directory to check. `PlannerMember` is what `getPlannerMembers` returns, and the settings page imports it, so it lives in `src/_actions/sharing/types.ts`.

If no single module decides a type's shape, where it goes depends on which files use it. If they're all inside one folder below `src/`, it goes in the `types.ts` of the deepest folder that contains them all. If they're spread across `src/`, it goes where "Generic vs Domain-Specific Code" puts domain code used across `src/`. `SavedItem` holds the parts of a saved item the calendar reads, and the calendar route's components, hooks and utilities each read it without deciding its shape. Only files under `src/app/[planner]/calendar/` use it, so it lives in `src/app/[planner]/calendar/types.ts`.

The two fixed homes are for types whose home doesn't depend on who uses them. A generic helper type with no domain knowledge, such as `Optionalize`, belongs in `src/_utils/` with the other generic utilities. A database document type stays in `src/_models/` beside the Zod schema it's inferred from, so the type and the schema that checks stored data can't drift apart.

# Hooks and Their Supporting Components
Some components exist only to support a hook, such as a context provider or a Client Component wrapper that runs a hook for a Server Component. Such a component lives with its hook, in a directory named after the hook inside a `_hooks` directory. The two are only ever used together, so keeping them in one place means nobody has to search several directories for them. Other hooks built on the same context go in that directory too, because they need the same provider. Where the `_hooks` directory goes is set by "Generic vs Domain-Specific Code" above.

# Architecture
## Single Concern
Single concern is a primary concern in this codebase. Each module (component, hook, utility, action) does one job. Two jobs are separate if each can be described without mentioning the other.
- When new behavior is a different job from the one an existing module does, it should be built as a new component, hook or utility. It should never be added to the existing module, even when that module is where the behavior is used.
- Existing code shouldn't be kept simply because it exists. If a module does more than one job, it should be refactored before anything new is built on it.

## Prefer Server Components
A component is a Server Component unless it needs something only the browser can do. A Server Component sends no JavaScript to the browser and fetches its data on the server, so the page stays small and its data arrives with it.

A component needs `'use client'` when it uses state, event handlers such as `onClick`, lifecycle logic such as `useEffect`, a browser-only API such as `localStorage`, or a hook built on any of these. (Next.js docs, Server and Client Components: "When to use Server and Client Components?") A loading state doesn't need it either: a `<Suspense>` boundary around a Server Component shows its fallback until the component's data arrives. A third-party component that needs the browser, and doesn't mark itself `'use client'`, is wrapped in a Client Component of the app's own, because it fails when a Server Component renders it.

**Keep the client boundary small:** add `'use client'` to the smallest component that needs it, not to a parent that only contains it, because everything a Client Component imports is sent to the browser too. For example, a mostly static layout with a search bar stays a Server Component, and only the search bar is a Client Component. (Next.js docs, Server and Client Components: "Reducing JS bundle size".)

## Modals
A modal splits into three parts with separate jobs: what owns its open state, what it's opened with, and a frame that draws the content inside it. Keeping them apart lets the same content show outside a modal, and lets a modal show the latest data after a save.

**What owns a modal's open state depends on what the modal needs.** The cases, from the strongest need to the weakest:
- **If someone should be able to link to it or close it with Back,** the URL owns it. A server page reads the search params and renders the modal, as the recipes page does with `?status=edit&type=recipe&item=…`.
- **If it opens from several places on one page,** that page's modal context owns it, as `CalendarModalProvider` does on the calendar. The page renders the modal once, and every trigger opens that same one through `useCalendarModal`, so month view and week view open one meal detail modal. The URL could own it too, but then every open would wait on a round trip to the server.
- **Otherwise,** the button that opens it owns it, with Mantine's `useDisclosure`, as `ConfirmButton` does.

**A modal opens with an id or a starting value, never a copy of the data.** The meal detail modal opens with `{ mealId }`, and Add Meal with `{ initialDate }`. The modal reads the record itself from the data the page renders. A server action re-renders the page after a save, so a modal that reads from the page shows the change. A copy taken when the modal opened goes stale: a meal moved to another day would still show its old date.

That page data reaches the modal through a separate context for the data, such as `CalendarDaysProvider`, which the meal detail modal reads through `useCalendarDays`. The modal context holds only which modal is open and what it opened with, because page data in the modal context would give that context a second job.

**The frame owns how the modal looks and what happens after a save.** It holds the modal's title, close button and size, so each is set in one place. After a save, a URL-owned modal navigates to the same page without the modal's search params, and any other modal closes. If nothing else would show a modal's content, as with `ConfirmModal`'s message and buttons, frame and content can be one component, with a callback for each button, such as `onClose` and `onConfirm`, so its caller decides what they do. Otherwise, the content is its own component, which takes `onCancel` and `onSuccess` and never closes the modal or navigates itself. `AddMealModal` is the frame around `AddMealForm`, and on the recipes page `ModalWrapper` is the frame around `RecipeForm` and `BookmarkForm`.

> [!NOTE]
> Content that knows it's in a modal can't be used anywhere else, and the steps after a save end up spread between the content and its frame. `RecipeForm` shows why: a single recipe's page (`/[planner]/recipes/[recipeId]`) renders it outside any modal, inside `RecipeEditForm`, whose callbacks go back to that recipe's page.

# Planner Access in Server Actions and Reads
A server action or read that touches a planner's data, such as its meals, saved recipes, tags or members, checks the signed-in user's access before it reads or writes. Pages and layouts that load a planner's data count as reads. Without the check, anyone with a planner's id could read or change it.

The check is `checkAuth(plannerId, level)` from `@/_actions/auth/checkAuth`. It returns whether the signed-in user is a member of that planner with at least that access level, rather than throwing. So the caller stops unless the result's `type` is `'authorized'`. The level depends on the call:
- **Reading or managing the planner's settings, members or invites,** such as renaming it or listing its members: `'admin'`.
- **A change to the planner's content,** such as a meal: `'write'`.
- **Any other read, or leaving the planner:** `'read'`.

An export from a `'use server'` file is a server action, which the browser can call with any arguments, even if the app only calls it from server code. So each one checks access itself, rather than relying on its caller to have checked.

# Error Reporting
Production reports its errors to PostHog. An error that's thrown and never caught reports itself, on the server through `onRequestError` in `src/instrumentation.ts` and in the browser through `posthog-js`. The code has to report only what never reaches those two. Everywhere outside production, reporting is off, so none of the calls below send anything locally or in tests.

**Caught failures.** When server code catches a failure and returns it as a value rather than throwing it, the code reports the failure only if it was unexpected. An unexpected failure, such as a failed database query or a send that Resend refused, is reported by awaiting `reportError` from `@/_reporting/reportError`. An expected one, such as a missing session, a user error from better-auth or invalid input, isn't reported. Each report can open a PostHog issue that someone then has to look into. Browser code doesn't call `reportError`: a server action that fails has already reported on the server.

**Error boundaries.** An `error.tsx` or `global-error.tsx` reports the error it catches with `posthog.captureException` from `posthog-js`, in a `useEffect` that depends on `error`. An error a boundary catches never reaches `posthog-js`'s global handler, so without that call it goes unreported.

**The relay and `proxy.ts`.** `src/app/relay/` passes `posthog-js`'s requests on to PostHog through the app's own domain, so ad blockers don't stop them. If the app adds a `proxy.ts`, its matcher should leave out `/relay`, because a matcher that includes it runs the proxy on every request `posthog-js` sends, including its request for the PostHog script.

# Stored Data
The app stores its data in MongoDB. Each stored document's shape is defined once, as a zod schema in `src/_models/`, and its TypeScript type is inferred from that schema. With one definition, a change to a shape is one edit, and the type can't drift from the schema that writes are checked against.

**The app's code reads and writes its collections only through the data module in `src/_models/database/`.** The module owns the MongoDB client and gives out a wrapper for each collection, whose inserts and updates check what they write against the schema. So a new action gets the check without doing anything, and can't leave it out. Reads aren't checked. The few kinds of code that have to work below the schemas use the module's raw database handle instead, as described below.

> [!NOTE]
> An insert checks the whole document. An update checks each value it sets, pushes or unsets against the part of the schema at that path, and this holds for a nested path such as `'calendar.$.meals'` too. Reads skip the check because what's stored was checked on the way in, and checking it again would only let one bad document break a whole page.

**A failed check is a bug.** If the data module's check fails, the action's code is wrong, so the module throws. The error is then reported as "Error Reporting" describes, like any other unexpected failure. The check is a backstop: an action parses its own input with zod before it writes, as `addMeal` does.

**The E2E factories and the dev seed write through the same module,** so test data follows the same rules as the app's, and a test can't pass on data the app would refuse to store. The factories and the seed run outside Next.js, so the module doesn't import `server-only`. It does import `mongodb`, so it stays out of any barrel that client code imports, as "Barrel Files" describes.

**Indexes live in the data module.** Each is defined beside its collection, and the module's setup creates it. The app and the factories both run that setup, because the E2E database starts empty.

**Some code works below the schemas, through the module's raw database handle.** It's code the collection wrappers can't serve, for one of three reasons. The data it handles may not match the schemas, as with a release task that moves stored data from one shape to another, because the data doesn't match until it's moved. A library may own the data's shape, as better-auth does. Or the code may work on whole collections rather than on the app's documents, as a tool that clears a database or checks a restored backup does.

> [!NOTE]
> better-auth's setup gets the raw handle rather than a client of its own, so the app keeps one connection. Without a client, better-auth runs no transactions, which the E2E tests' standalone MongoDB server can't run.

**better-auth's data goes through one file in `src/_auth/`.** better-auth owns its collections (`user`, `account`, `session` and `verification`) and their shape. App code reaches them only through that file's functions, which wrap better-auth's internal adapter, so better-auth stays the only code that knows how its data is stored. Its collections keep the ObjectIds better-auth gives them. The app never handles those ids, because it links each of its users to a better-auth user by email.

> [!NOTE]
> The internal adapter, `auth.$context.internalAdapter`, isn't part of better-auth's public API, so an upgrade may change it. Keeping every use in that one file means an upgrade touches only that file.

**Ids are strings.** Every `_id` in the app's own collections, and every reference to one, is a string. It's the same value in a URL, an action, a query, the database and the browser, so nothing converts an id from one form to another. A missed conversion fails quietly: MongoDB never treats a string as equal to an ObjectId, so the query just matches nothing.

**A new subdocument carries its own id.** Each stored subdocument except a calendar day has a required `_id` in its schema, with no default. Meals, dishes, saved items, tags and planner memberships are all subdocuments. The code that creates one builds it as a value of its stored type, and sets `_id` to a new id from the data module. A calendar day has no `_id`, and is found by its `date`, which is unique within a planner. A day stays when its last meal is removed, so its `meals` may be empty.

> [!NOTE]
> The driver's types don't check a value pushed onto a nested path, so building the new value as its stored type is what makes a missing id fail to compile. A zod default would fill in a new id whenever a value without one is written. Then an update that writes a whole subdocument and leaves out its `_id` would quietly give it a new one, and break whatever refers to it.

**An empty optional field is left out.** A writer never stores an optional field as `null` or `""`, so a field is either there with a value or not there at all, and code that reads it has one case to handle. Zod's `.optional()` alone accepts `""`, so an optional string's schema also rejects the empty string.

A Biome rule in `biome.jsonc` lets only the data module and the release tasks import `mongodb`. Its overrides are also the list of files that may use the module's raw database handle, so a new file that works below the schemas is added there.
