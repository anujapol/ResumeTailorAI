# Google Sheets Tracker Setup Guide

---

## Step 1: Create the Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it: `Job Application Tracker`
4. Rename the default tab (bottom of screen) to: `Job Tracker`

---

## Step 2: Add Column Headers

In Row 1, add these headers in order (one per cell, A through O):

| Col | Header |
|-----|--------|
| A | # |
| B | Date of Application |
| C | Company |
| D | Estimated Level |
| E | Team Name |
| F | URL |
| G | Application Status |
| H | Referral Reached Out To |
| I | Stage of Interview |
| J | First Follow Up Date |
| K | Second Follow Up Date |
| L | Third Follow Up Date |
| M | Next Step |
| N | Next Step Date |
| O | Resume Drive Link |

---

## Step 3: Auto-number Column A

Click cell **A2** and enter this formula:
```
=IF(B2="","",ROW()-1)
```
This auto-fills the row number only when a date is present — no manual numbering needed.

---

## Step 4: Add Dropdown Validation for Application Status (Column G)

1. Click column G header to select the whole column
2. **Data** → **Data Validation** → **Add Rule**
3. Criteria: **Dropdown**
4. Options: `Draft`, `Applied`, `Interviewing`, `Offer`, `Rejected`, `Withdrawn`

---

## Step 5: Get Your Spreadsheet ID

From your sheet's URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```
Copy the ID between `/d/` and `/edit` — paste this into the workflow's
**Log to Job Tracker Sheet** node → **Document ID** field.

---

## Step 6: Set Up Google Sheets OAuth2 Credential in n8n

1. In n8n → **Credentials** → **New** → **Google Sheets OAuth2 API**
2. Follow the OAuth flow to connect your Google account
3. Name it something memorable (e.g. `Google Sheets OAuth2`)
4. Use this credential name in the **Log to Job Tracker Sheet** node

Make sure the Google account you authenticate with has **Editor** access to the spreadsheet.
