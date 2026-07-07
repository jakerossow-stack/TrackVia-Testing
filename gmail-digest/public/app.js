const connectionStatus = document.getElementById('connectionStatus');
const connectionLabel = document.getElementById('connectionLabel');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const controls = document.getElementById('controls');
const scanBtn = document.getElementById('scanBtn');
const daysSelect = document.getElementById('daysSelect');
const results = document.getElementById('results');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');
const overallSummary = document.getElementById('overallSummary');
const threadCount = document.getElementById('threadCount');
const needsResponseList = document.getElementById('needsResponseList');
const fyiList = document.getElementById('fyiList');

function gmailLink(threadId) {
  return `https://mail.google.com/mail/u/0/#all/${threadId}`;
}

function renderCard(item, { withUrgency }) {
  const card = document.createElement('div');
  card.className = 'card';

  const top = document.createElement('div');
  top.className = 'card-top';
  const subject = document.createElement('span');
  subject.className = 'card-subject';
  subject.textContent = item.subject;
  top.appendChild(subject);
  card.appendChild(top);

  const from = document.createElement('span');
  from.className = 'card-from';
  from.textContent = item.from;
  card.appendChild(from);

  const reason = document.createElement('p');
  reason.className = 'card-reason';
  reason.textContent = item.reason;
  card.appendChild(reason);

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  if (withUrgency) {
    const badge = document.createElement('span');
    badge.className = `badge ${item.urgency || 'low'}`;
    badge.textContent = item.urgency || 'low';
    footer.appendChild(badge);
  } else {
    footer.appendChild(document.createElement('span'));
  }

  const link = document.createElement('a');
  link.className = 'open-link';
  link.href = gmailLink(item.threadId);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Open in Gmail →';
  footer.appendChild(link);

  card.appendChild(footer);
  return card;
}

function renderList(container, items, options) {
  container.innerHTML = '';
  if (!items || items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Nothing here.';
    container.appendChild(empty);
    return;
  }
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  const sorted = options.withUrgency
    ? [...items].sort((a, b) => (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3))
    : items;
  sorted.forEach((item) => container.appendChild(renderCard(item, options)));
}

async function refreshConnectionStatus() {
  const res = await fetch('/auth/status');
  const { connected } = await res.json();
  connectionStatus.classList.toggle('connected', connected);
  connectionStatus.classList.toggle('disconnected', !connected);
  connectionLabel.textContent = connected ? 'Gmail connected' : 'Gmail not connected';
  connectBtn.hidden = connected;
  disconnectBtn.hidden = !connected;
  controls.hidden = !connected;
  return connected;
}

connectBtn.addEventListener('click', () => {
  window.location.href = '/auth/google';
});

disconnectBtn.addEventListener('click', async () => {
  await fetch('/auth/disconnect', { method: 'POST' });
  results.hidden = true;
  await refreshConnectionStatus();
});

scanBtn.addEventListener('click', async () => {
  errorBox.hidden = true;
  results.hidden = true;
  loading.hidden = false;
  scanBtn.disabled = true;

  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: Number(daysSelect.value) }),
    });

    if (res.status === 401) {
      await refreshConnectionStatus();
      throw new Error('Gmail connection expired — please reconnect.');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Scan failed.');

    overallSummary.textContent = data.overallSummary;
    threadCount.textContent = `Scanned ${data.threadCount} thread(s).`;
    renderList(needsResponseList, data.needsResponse, { withUrgency: true });
    renderList(fyiList, data.fyi, { withUrgency: false });
    results.hidden = false;
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
  } finally {
    loading.hidden = true;
    scanBtn.disabled = false;
  }
});

refreshConnectionStatus();
