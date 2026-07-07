# Gmail Digest

A small standalone app that scans your Gmail inbox, summarizes what's going on, and flags which threads actually need a response from you (vs. FYI-only).

It's a single-user local tool: Express server + Google OAuth (read-only Gmail access) + Claude for the summarization, with a plain HTML/JS frontend. No database — the OAuth token is saved to a local `tokens.json` file (gitignored).

## Setup

1. Install dependencies:
   ```
   cd gmail-digest
   npm install
   ```

2. Create a Google Cloud OAuth client:
   - Go to https://console.cloud.google.com/ and create (or select) a project.
   - **APIs & Services → Library**: enable the **Gmail API**.
   - **APIs & Services → OAuth consent screen**: configure it (External is fine for personal use; add yourself as a test user).
   - **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
     - Application type: **Web application**
     - Authorized redirect URI: `http://localhost:3002/auth/google/callback`
   - Copy the generated **Client ID** and **Client Secret**.

3. Copy `.env.example` to `.env` and fill in:
   ```
   ANTHROPIC_API_KEY=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:3002/auth/google/callback
   ```

4. Start the app:
   ```
   npm start
   ```

5. Open http://localhost:3002, click **Connect Gmail**, sign in and grant read-only access, then click **Scan Inbox**.

## How it works

- Only requests the `gmail.readonly` scope — it can read your inbox but can't send, delete, or modify anything.
- Fetches inbox threads from the last N days (you pick the window), pulling subject/sender/date/snippet for each.
- Sends the compact thread list to Claude, which returns:
  - An overall plain-English summary of what's happening in your inbox.
  - **Needs your response** — threads expecting a reply, RSVP, signature, or decision, each with an urgency (high/medium/low) and why.
  - **FYI** — notifications/newsletters/threads where no action is expected.
- Each item links straight back to the thread in Gmail.

## Notes

- This is intentionally a single-user local tool (token stored in a plain file) — not built for multi-user/production deployment.
- Click **Disconnect** to revoke local access and delete the stored token.
