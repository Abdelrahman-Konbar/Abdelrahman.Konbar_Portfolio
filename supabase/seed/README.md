# Approved-content import

Generate a reviewable snapshot from the approved local content before the first hosted import:

```powershell
corepack pnpm run content:export
```

The generated `approved-content.json` is intentionally ignored. Review it, then use an owner-only import command in a development project to insert data with stable IDs and `on conflict do nothing`. This prevents reruns from overwriting subsequent remote editorial changes.

Import order: `site_settings`, `experience_entries`, `expertise_entries`, `projects`, `media_assets`, `project_media`, then `case_study_blocks`. Publish only records whose source material has been approved for public display. Do not generate media rows for the current placeholders.
