- Update bookmark schema to have tags and notes
- User can add tags and notes when creating bookmark
- User can add/edit tags and note when editing bookmark

## Notes

**Tags are already done** (shipped with Add Bookmark): `BookmarkInterface` has `tags`, the form includes `TagCombobox`, and `addBookmark` persists tags.

Remaining work:
- Add `notes?: string` to `bookmark.types.ts` and `bookmark.ts`
- Add a notes textarea to `BookmarkForm`
- Ensure `addBookmark` (and future `editBookmark`) persists notes