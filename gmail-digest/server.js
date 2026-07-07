import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.join(__dirname, 'tokens.json');
const PORT = process.env.PORT || 3002;
const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/auth/google/callback`
);

function loadTokens() {
  if (!fs.existsSync(TOKENS_PATH)) return null;
  return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
}

function saveTokens(tokens) {
  const merged = { ...(loadTokens() || {}), ...tokens };
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(merged, null, 2));
}

const storedTokens = loadTokens();
if (storedTokens) oauth2Client.setCredentials(storedTokens);

oauth2Client.on('tokens', (tokens) => saveTokens(tokens));

app.get('/auth/status', (req, res) => {
  res.json({ connected: !!loadTokens() });
});

app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GMAIL_SCOPES,
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Google auth error: ${error}`);
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    saveTokens(tokens);
    res.redirect('/');
  } catch (err) {
    res.status(500).send(`Auth failed: ${err.message}`);
  }
});

app.post('/auth/disconnect', (req, res) => {
  if (fs.existsSync(TOKENS_PATH)) fs.unlinkSync(TOKENS_PATH);
  oauth2Client.setCredentials({});
  res.json({ ok: true });
});

async function fetchInboxThreads(days, maxThreads) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const { data: listData } = await gmail.users.threads.list({
    userId: 'me',
    q: `in:inbox newer_than:${days}d`,
    maxResults: maxThreads,
  });

  const threads = listData.threads || [];

  return Promise.all(
    threads.map(async (thread) => {
      const { data } = await gmail.users.threads.get({
        userId: 'me',
        id: thread.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });

      const messages = data.messages || [];
      const lastMessage = messages[messages.length - 1];
      const headers = Object.fromEntries(
        (lastMessage?.payload?.headers || []).map((h) => [h.name, h.value])
      );

      return {
        threadId: thread.id,
        subject: headers.Subject || '(no subject)',
        from: headers.From || 'unknown sender',
        date: headers.Date || '',
        snippet: thread.snippet || '',
        messageCount: messages.length,
        unread: messages.some((m) => m.labelIds?.includes('UNREAD')),
        important: messages.some((m) => m.labelIds?.includes('IMPORTANT')),
      };
    })
  );
}

async function summarizeThreads(threads) {
  const prompt = `You are an email triage assistant. You will be given a JSON array of email threads from someone's Gmail inbox (subject, sender, date, a snippet of the latest message, whether it's unread/important, and how many messages are in the thread).

Analyze them and return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "overallSummary": "<2-4 sentence plain-English summary of what's going on in the inbox right now>",
  "needsResponse": [
    { "threadId": "<id>", "subject": "<subject>", "from": "<sender>", "urgency": "high" | "medium" | "low", "reason": "<one concise sentence on why this needs a response or action, and by when if there's a deadline>" }
  ],
  "fyi": [
    { "threadId": "<id>", "subject": "<subject>", "from": "<sender>", "reason": "<one concise sentence on what this is, no action needed>" }
  ]
}

Guidelines:
- "needsResponse" = anything expecting a reply, an RSVP/calendar response, a signature/form, a decision, or that blocks someone else if ignored.
- "fyi" = newsletters, notifications, automated digests, and threads where no action is expected of the recipient.
- Every thread must end up in exactly one of the two lists.
- Urgency "high" = time-sensitive or blocking; "medium" = should be done soon but not urgent; "low" = optional/minor.
- Be specific and concrete in "reason" — reference actual content, not generic language.

Threads:
${JSON.stringify(threads)}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

app.post('/api/scan', async (req, res) => {
  if (!loadTokens()) {
    return res.status(401).json({ error: 'not_connected' });
  }

  try {
    const days = Math.min(Math.max(parseInt(req.body.days, 10) || 7, 1), 30);
    const maxThreads = Math.min(Math.max(parseInt(req.body.maxThreads, 10) || 40, 1), 50);

    const threads = await fetchInboxThreads(days, maxThreads);

    if (threads.length === 0) {
      return res.json({
        overallSummary: `No inbox threads found in the last ${days} day(s).`,
        needsResponse: [],
        fyi: [],
        threadCount: 0,
      });
    }

    const digest = await summarizeThreads(threads);
    res.json({ ...digest, threadCount: threads.length });
  } catch (err) {
    console.error(err);
    if (err.code === 401 || err.message?.includes('invalid_grant')) {
      return res.status(401).json({ error: 'not_connected' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Gmail Digest server running on http://localhost:${PORT}`));
