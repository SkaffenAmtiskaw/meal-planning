# Button Feedback
- The continue button after entering your email in the login workflow doesn't have any user feedback. It should indicate a loading indicator when pressed, and an error message if something has gone wrong. (Rare but not impossible - DB failures can happen.)
- All other buttons in the login workflow should also be evaluated to determine if they need feedback.
- Any patterns re-used across multiple buttons should be made into a reusable hook/component.

# Name Label
- "Your name" should be renamed to "User Name" - it's not necessarily meant to be their actual name.