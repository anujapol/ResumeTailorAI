# Data Table Setup Guide

ResumeTailorAI uses n8n's built-in Data Tables to store your system prompt and resume
content — keeping sensitive personal data inside your n8n instance, not in code.

---

## Step 1: Create the Data Table

1. In your n8n instance, go to the left sidebar
2. Click **"Data"** → **"Tables"**
3. Click **"Add Table"**
4. Name it: `agent_config`
5. Add two columns:
   - Column 1: `key` (type: String)
   - Column 2: `value` (type: Text)

---

## Step 2: Add the Three Rows

Add these rows one at a time using the **"Insert Row"** button:

### Row 1
- **key:** `resume_system_prompt`
- **value:** Paste the full contents of `system_prompt_template.txt` with your personal details filled in

### Row 2
- **key:** `resume_primary`
- **value:** Paste the full contents of `resume_primary_template.txt` with your actual resume in plain text

---

## Step 3: Get Your Data Table ID (nanoid)

n8n Data Tables use an internal nanoid — NOT the human-readable table name — in API calls.

1. In n8n, go to **Settings** → **API**
2. Generate an API key if you haven't already
3. Make a GET request to:
   ```
   https://YOUR_N8N_SUBDOMAIN.app.n8n.cloud/api/v1/data-tables
   ```
   With header: `X-N8N-API-KEY: your-api-key`
4. Find your `agent_config` table in the response and copy its `id` field
5. Paste that ID into the Read Config node URL in your workflow

---

## Step 4: Set Up the n8n API Credential

In n8n, go to **Credentials** → **New** → **Header Auth**:
- **Name:** `n8n API Key`
- **Header Name:** `X-N8N-API-KEY`
- **Header Value:** your n8n API key

This credential is used by the Read Config node.

---

## Security Note

Your resume content and system prompt live entirely within your n8n instance.
They are never stored in this GitHub repo or sent anywhere other than the
Anthropic API during workflow execution.
