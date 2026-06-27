# Setup: Google Sheet as the live quote database

The site reads quotes live from a Google Sheet. To add quotes, edit the sheet
directly — anything in the sheet is live on the next page load. No accounts, no
submission form, no approval step. A small read-only Apps Script serves the
sheet's contents to the site as JSON (so the sheet itself can stay private).

## 1. Create the sheet

1. Make a new Google Sheet. Rename the first tab to **`Quotes`** (exact name).
2. **File → Import** the included `quotes-import.csv`:
   - Import location: **Replace current sheet**
   - This gives you the header row + all 82 existing quotes.
   - Columns: `text | person | note | group_id`
   - `group_id` groups a multi-person exchange into one card (blank = standalone).

## 2. Add the Apps Script

1. In the sheet: **Extensions → Apps Script**.
2. Delete the starter code, paste the contents of `apps-script/Code.gs`, save.
3. **Deploy → New deployment → type: Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize when prompted. Copy the **Web app URL** (ends in `/exec`).

## 3. Point the site at it

In `app.js`, set:

```js
const ENDPOINT = "https://script.google.com/macros/s/XXXX/exec";
```

Commit and push. The site now reads from the sheet.
(Until you set this, the site falls back to the committed `quotes.json`.)

## Adding / editing quotes

- **Share the sheet** with whoever you want to be able to add quotes (Share →
  give them **Editor** access). They don't need anything else.
- Add a row: fill in `text` and `person`. `note` is optional context.
- It goes **live on the next page refresh** — no approval step.
- A row with a blank `text` or `person` is skipped.
- To make two rows a single conversation card, give them the same `group_id`
  (any unique-ish string, e.g. `g83`).
- Delete a row to remove a quote.

> Note: editors can add or change anything, including others' rows. Only share
> with people you trust to edit directly.

## Notes

- **Re-deploying the script:** you only need to redeploy if you change
  `Code.gs`. Editing sheet *data* needs no redeploy.
- **`quotes.json`** stays in the repo only as a fallback (used if `ENDPOINT` is
  unset or the fetch fails). The sheet is the source of truth once `ENDPOINT` is
  set; re-export from the sheet occasionally if you want a git backup.
