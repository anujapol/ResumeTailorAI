# Railway API Deployment Guide

The `docx-api/` folder contains a Node.js Express service that converts
Claude's JSON output into a formatted Word document (.docx). This runs
on Railway because n8n Cloud's Code node does not allow the `docx` npm library.

---

## Why a Separate API?

n8n Cloud sandboxes Code nodes with a strict npm module whitelist.
The `docx` library — required for Word document generation — is not permitted.
The solution is a thin microservice that n8n calls via HTTP Request,
exactly like any other external API.

---

## Step 1: Fork or Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/ResumeTailorAI.git
cd ResumeTailorAI
```

---

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **GitHub Repository**
3. Select your forked repo
4. Railway auto-detects Node.js and deploys automatically (~2 minutes)

---

## Step 3: Generate a Public URL

1. In Railway, click your deployed service
2. Go to **Settings** → **Networking**
3. Click **Generate Domain**
4. Copy the URL: `https://YOUR_APP.up.railway.app`

---

## Step 4: Test the API

Open in browser — you should see:
```json
{"status": "Resume Builder API running"}
```

---

## Step 5: Update the Workflow

In your n8n **Build .docx File** node, update the URL to:
```
https://YOUR_APP.up.railway.app/build-resume
```

---

## Cost

Railway's free trial gives $5 credits. After that, this lightweight
API costs approximately $1/month on the Hobby plan — it only runs
for a few seconds per resume generation request.

---

## Updating the API

To change resume formatting (fonts, spacing, layout):

```bash
# Edit docx-api/server.js locally
git add .
git commit -m "update formatting"
git push
```

Railway auto-redeploys on every push. No n8n changes needed.
