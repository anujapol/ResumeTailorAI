# ResumeTailorAI ⚡
### *Submit a job description. Get a tailored resume in your inbox in 90 seconds.*

An end-to-end job application automation system built on n8n, Claude AI, and Google Workspace. Paste a job description into a form — ResumeTailorAI generates a fully tailored, ATS-optimized Word resume, saves it to Google Drive, and logs the application in a tracker. Automatically.

---

## The Problem

Senior job seekers applying to multiple roles face a painful, repetitive cycle:
- Read job description → manually rewrite resume to match keywords
- Save file with correct naming convention
- Open tracker → copy-paste company, role, URL, date, follow-up dates
- Repeat for every application

At 45-60 minutes per application, a serious job search of 20+ applications per month costs **15-20 hours of manual, low-value work** — time that should be spent on interview prep, networking, and thinking.

---

## The Solution

ResumeTailorAI automates the entire intake-to-tracking pipeline using:
- **n8n** as the automation workflow orchestrator
- **Claude AI** (Anthropic) as the resume optimization engine
- **Railway** as the document generation microservice
- **Google Workspace** (Drive + Sheets) as the output and tracking layer

One form submission triggers the entire chain. Human judgment is reserved for review and approval — not formatting and filing.

---

## Architecture

```
[n8n Form] → [Prepare Fields] → [Read Config from Data Table]
     → [Flatten Config] → [Claude AI — Generate Tailored Resume JSON]
     → [Railway API — Build .docx] → [Google Drive — Save Resume]
     → [Google Sheets — Log Application] → [Form Confirmation]
```

| Layer | Tool | Purpose |
|-------|------|---------|
| Automation workflow | n8n Cloud | Orchestrates all steps end-to-end |
| AI generation | Anthropic Claude API | ATS optimization, bullet rewriting, JSON output |
| Document generation | Node.js on Railway | Converts Claude's JSON to formatted Word .docx |
| Resume storage | Google Drive | Organized folder of tailored resumes |
| Application tracking | Google Sheets | Live tracker with follow-up dates auto-populated |
| Config storage | n8n Data Tables | Stores system prompt and master resume (no code exposure) |

---

## What Gets Automated

| Task | Before | After |
|------|--------|-------|
| Resume tailoring | 30-45 min manual rewrite | ~60s Claude generation |
| File naming + saving | Manual | Automatic (`Name - Company - Team.docx`) |
| Tracker entry | Manual copy-paste | Auto-logged with all fields |
| Follow-up date calculation | Manual | Auto-populated (Day 3, Day 7, Day 12) |
| ATS keyword check | Manual scan | Built into Claude's optimization pass |

**Estimated time saved: 12-18 hours/month** for an active job search of 15-20 applications.

---

## Features

- **ATS-optimized resume generation** — Claude rewrites bullets to match JD keywords, reorders by relevance, and enforces a 40-word bullet limit
- **Structured Word document output** — formatting matches a professional template (correct fonts, indentation, page 2 header, italic role descriptions, right-tab dates)
- **Automatic application tracking** — every submission logged with company, level, team, URL, status, and three follow-up dates
- **Model selection** — choose between Claude Sonnet (fast, cost-efficient) and Claude Opus (highest quality) per application
- **Config stored securely in n8n** — your resume and system prompt never touch the codebase

---

## Tech Stack

```
n8n Cloud          — workflow automation (no-code orchestration layer)
Anthropic Claude   — LLM for resume optimization and JSON generation
Node.js + Express  — microservice for .docx generation (Railway)
docx npm library   — programmatic Word document creation
Google Drive API   — file storage via OAuth2
Google Sheets API  — tracker logging via OAuth2
n8n Data Tables    — internal config/resume storage
```

---

## Repo Structure

```
ResumeTailorAI/
├── workflow.json                    # n8n workflow — import this directly
├── system_prompt_template.txt       # Claude system prompt (fill in your details)
├── resume_primary_template.txt      # Master resume template (plain text)
├── docx-api/
│   ├── server.js                    # Express API — docx generation logic
│   ├── package.json
│   └── .gitignore
└── setup/
    ├── data_table_setup.md          # How to set up n8n Data Tables
    ├── google_sheets_setup.md       # Tracker column setup + sheet ID
    └── railway_deployment.md        # Deploy the docx API to Railway
```

---

## Prerequisites

Before you start, you need accounts on:

| Service | Free tier available? | Used for |
|---------|---------------------|----------|
| [n8n Cloud](https://n8n.io) | Yes (Starter) | Workflow automation |
| [Anthropic API](https://console.anthropic.com) | Pay-as-you-go (~$0.01/resume) | AI resume generation |
| [Railway](https://railway.app) | $5 trial, then $1/mo | .docx generation API |
| [Google Account](https://google.com) | Yes | Drive + Sheets |
| [GitHub](https://github.com) | Yes | Repo for Railway deployment |

---

## Setup Guide — Step by Step

### Step 1 — Deploy the .docx API to Railway

The document generation service needs to run before the n8n workflow can use it.

1. Fork this repo on GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **GitHub Repository**
3. Select your forked repo — Railway auto-detects Node.js and deploys (~2 min)
4. In Railway: **Settings** → **Networking** → **Generate Domain**
5. Copy your URL: `https://YOUR_APP.up.railway.app`
6. Test it in your browser — you should see `{"status": "Resume Builder API running"}`

Detailed instructions: [`setup/railway_deployment.md`](setup/railway_deployment.md)

---

### Step 2 — Set Up Google Drive

1. In Google Drive, create a folder called `Job Search Resumes`
2. Open the folder — copy the ID from the URL:
   ```
   https://drive.google.com/drive/folders/YOUR_FOLDER_ID_IS_HERE
   ```
3. Keep this ID handy — you'll paste it into the workflow

---

### Step 3 — Set Up Google Sheets Tracker

1. Create a new Google Sheet named `Job Application Tracker`
2. Rename the default tab to `Job Tracker`
3. Add the column headers in Row 1 (exact names matter):

```
# | Date of Application | Company | Estimated Level | Team Name | URL |
Application Status | Referral Reached Out To | Stage of Interview |
First Follow Up Date | Second Follow Up Date | Third Follow Up Date |
Next Step | Next Step Date | Resume Drive Link
```

4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```

Detailed instructions: [`setup/google_sheets_setup.md`](setup/google_sheets_setup.md)

---

### Step 4 — Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account (separate from Claude.ai — different billing)
3. **Billing** → **Buy Credits** — $5 covers ~500 resume generations at Sonnet pricing
4. **API Keys** → **Create Key** — copy it

---

### Step 5 — Set Up n8n Data Tables

This is where your master resume and system prompt live — inside your n8n instance, not in code.

1. In n8n: **Data** → **Tables** → **Add Table** → name it `agent_config`
2. Add columns: `key` (String) and `value` (Text)
3. Insert two rows:
   - `resume_system_prompt` → paste your filled-in `system_prompt_template.txt`
   - `resume_primary` → paste your resume in plain text using `resume_primary_template.txt` as a guide
4. Get your Data Table nanoid (the internal ID — not the name):
   ```
   GET https://YOUR_SUBDOMAIN.app.n8n.cloud/api/v1/data-tables
   Header: X-N8N-API-KEY: your-n8n-api-key
   ```
   Find `agent_config` in the response and copy its `id` value

Detailed instructions: [`setup/data_table_setup.md`](setup/data_table_setup.md)

---

### Step 6 — Import and Configure the n8n Workflow

1. In n8n: **Workflows** → **Import** → upload `workflow.json`
2. Open the workflow and update these values:

| Node | Field | What to paste |
|------|-------|---------------|
| **Read Config** | URL | Replace `YOUR_N8N_SUBDOMAIN` and `YOUR_DATA_TABLE_NANOID` |
| **Read Config** | Credential | Your n8n API Key Header Auth credential |
| **Generate Resume JSON** | Credential | Your Anthropic API credential |
| **Build .docx File** | URL | Your Railway URL + `/build-resume` |
| **Save to Google Drive** | Folder ID | Your Drive folder ID |
| **Save to Google Drive** | File Name | Replace `YOUR_NAME` with your name |
| **Save to Google Drive** | Credential | Your Google Drive OAuth2 credential |
| **Log to Job Tracker Sheet** | Document ID | Your Google Sheet ID |
| **Log to Job Tracker Sheet** | Credential | Your Google Sheets OAuth2 credential |

3. Set up credentials in n8n (**Credentials** → **New**) for:
   - **Anthropic API** — paste your API key
   - **Header Auth** (for n8n API) — Header: `X-N8N-API-KEY`, Value: your n8n API key
   - **Google Drive OAuth2** — follow OAuth flow
   - **Google Sheets OAuth2** — follow OAuth flow

---

### Step 7 — Test the Workflow

1. Click **Execute workflow** in n8n
2. n8n will display your form URL — open it in a browser
3. Fill in a real job description and submit
4. Watch all nodes turn green one by one (~60-90 seconds)
5. Check Google Drive for your tailored `.docx`
6. Check Google Sheets — a new row should appear with all fields populated

---

## Common Setup Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `dataTableId must match format "nanoid"` | Used table name instead of internal ID | Fetch `/api/v1/data-tables` to get the actual nanoid |
| `Module 'docx' is disallowed` | n8n Cloud blocks the docx library in Code nodes | Use the Railway microservice — this is already handled in the workflow |
| `Referenced node doesn't exist` | Expression references a deleted/renamed node | Update the expression to use the current node name |
| `Requested entity was not found` (Sheets) | Truncated or incorrect Sheet ID | Copy the full ID directly from the sheet URL |
| Claude returns "resume content was missing" | Data table key names are case-sensitive | Keys must be lowercase: `resume_primary`, not `RESUME_PRIMARY` |
| `Unused Respond to Webhook node` | Wrong terminal node type for Form Trigger | Use Form Completion node, not generic Respond to Webhook |
| `JSON parameter needs to be valid JSON` | Sending raw string as JSON body | Use "Specify Body: Using Fields Below" with a named `text` parameter |

---

## Customization

> **Recommended before first use:** ResumeTailorAI is designed to be fully personalized to your profile. The three files below are the ones you are most likely to want to customize — treat them as your primary configuration layer.

**`system_prompt_template.txt` (highest impact)**
This is the brain of the system. Fill in your name, title, years of experience, target roles, core expertise, and key impact metrics. The more specific and accurate your profile here, the better Claude tailors every resume. Revisit this whenever your target role type changes.

**`resume_primary_template.txt` (highest impact)**
Your master resume in plain text. This is what Claude uses as the source of truth for every tailored output. Keep it current — add new roles, updated metrics, and recent projects as your career evolves. The richer this is, the better the output quality.

**`docx-api/server.js` (formatting layer)**
Controls the exact Word document layout — fonts, sizes, margins, bullet indentation, tab stops, page 2 header, section headers. If your resume template differs from the default (Calibri, 0.6" margins, right-tab dates), edit this file and push to GitHub. Railway auto-redeploys in ~1 minute with no n8n changes needed.

**Add more roles to the form dropdown** — edit the Job Submission Form node in n8n, add options to the Target Role Title field.

**Change the Claude model default** — edit the dropdown options in the form or hardcode the model in the Generate Resume JSON node.

**Adjust follow-up date cadence** — in the Log to Job Tracker Sheet node, change the `plus({days: X})` values to match your preferred outreach timing.

---

## Roadmap

The following features are planned for future releases:

### v2 — Job Discovery + Notifications
- **Job Discovery Agent** — daily scrape of target company career pages, Claude scores each role for fit against your profile, sends a digest email with ranked matches
- **Slack / email notifications** — alert when a new matching role is found, or when a follow-up date is reached

### v3 — Outreach Automation
- **Cold outreach generator** — after resume is approved, Claude drafts a personalized cold email and LinkedIn message to the hiring manager, saved as Gmail drafts
- **Recruiter response drafter** — paste a recruiter message, get a response drafted and ready to send

### v4 — Interview Prep Integration
- **Company dossier generator** — deep research on company, team, recent news, and interviewer LinkedIn profiles, compiled into a structured prep doc
- **STAR story builder** — maps your experience bullets to behavioral competencies, generates practice questions and sample answers

---

## Cost Estimate

Running ResumeTailorAI for an active job search of ~20 applications/month:

| Service | Cost |
|---------|------|
| n8n Cloud Starter | Free |
| Anthropic API (Claude Sonnet, ~1500 tokens/resume) | ~$0.20/month |
| Railway (docx API) | $1/month |
| Google Workspace | Free |
| **Total** | **~$1.20/month** |

---

## License

MIT — use freely, adapt for your own job search, and build on top of it.

---

## Contributing

PRs welcome, especially for the v2 roadmap items. Open an issue first to discuss scope.

---

*Built to solve a real problem. Dogfooded extensively.*
