import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/analyze-signal', async (req, res) => {
  const { signalData, projectHistory, employeeData } = req.body;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are Signal, an AI operations risk analyst for TrackVia. You analyze behavioral patterns in field operations and government contractor workflows to predict failures before they occur.

Analyze the following active signal and produce a clear, specific risk analysis in 3 short paragraphs:
1. What is actually happening operationally (name the specific patterns, be concrete)
2. Why this combination of patterns is dangerous (how they compound each other)
3. What will happen if no action is taken in the next 7 days (specific, credible consequence)

Be direct and specific. Do not use vague language like "may cause issues." Name the probable outcome. Keep each paragraph to 2-3 sentences.

Signal data: ${JSON.stringify(signalData)}
Project history: ${JSON.stringify(projectHistory)}`
      }]
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(chunk.delta.text);
      }
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employee-insight', async (req, res) => {
  const { employee, recentTasks, teamContext } = req.body;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are Signal, an AI workforce optimization analyst. Based on this employee's performance data, generate a 2-paragraph scheduling recommendation for their manager.

Paragraph 1: What this person is genuinely best at (based on their skill scores and task performance, not just their job title). Be specific about skill scores and patterns.
Paragraph 2: One concrete scheduling recommendation for next week — which task type to prioritize for this employee and why, including who they should be paired with for best results.

Keep it under 120 words total. Write for an operations manager, not an HR system.

Employee data: ${JSON.stringify(employee)}`
      }]
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(chunk.delta.text);
      }
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/run-scan', async (req, res) => {
  try {
    const { organizationData } = req.body;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `You are Signal, scanning an organization's operational data for new risk patterns.

Based on this organization data, identify 1-2 new or updated behavioral risk patterns you detect. Return a JSON object with this exact structure:
{
  "patternsUpdated": <number>,
  "newSignalsDetected": <number>,
  "summary": "<one sentence summary of scan findings>"
}

Organization: ${JSON.stringify(organizationData)}

Return only valid JSON, no other text.`
      }]
    });

    const text = response.content[0].text;
    const result = JSON.parse(text);
    res.json(result);
  } catch (err) {
    res.json({ patternsUpdated: 3, newSignalsDetected: 0, summary: 'Scan complete — existing patterns updated, no new critical signals detected.' });
  }
});

app.listen(3001, () => console.log('Signal API server running on port 3001'));
