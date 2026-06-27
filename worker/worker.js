/**
 * Cloudflare Worker — receives the website contact form and creates a GitHub Issue.
 * Visitors do NOT need a GitHub account or any login.
 *
 * Setup (see worker/README.md):
 *   1. Create a fine-grained Personal Access Token with "Issues: Read and write"
 *      on the BrotherSupport/ai_consultant repo.
 *   2. Deploy this file as a Worker.
 *   3. Add an encrypted secret:  GITHUB_TOKEN = <your token>
 *   4. (optional) Add plain vars: REPO, ALLOWED_ORIGINS
 *   5. Paste the Worker URL into WORKER_URL in index.html and ai_agent.html.
 */

const DEFAULT_REPO = 'BrotherSupport/ai_consultant';
const DEFAULT_ORIGINS = 'https://brothersupport.github.io';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(',').map((s) => s.trim());
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);

    let data;
    try { data = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400, cors); }

    // Honeypot — bots fill the hidden "website" field. Pretend success and drop it.
    if (data.website) return json({ ok: true }, 200, cors);

    const oneLine = (s, n) => String(s || '').replace(/[\r\n]+/g, ' ').slice(0, n).trim();
    const industry = oneLine(data.industry, 60) || '未指定';
    const company = oneLine(data.company, 80);
    const contact = oneLine(data.contact, 120);
    const pain = String(data.pain || '').slice(0, 2000).trim();
    const source = oneLine(data.source, 40) || 'WEB';

    if (!pain && !contact && !company) {
      return json({ error: '請至少填寫聯絡方式或需求' }, 400, cors);
    }

    const repo = env.REPO || DEFAULT_REPO;
    if (!env.GITHUB_TOKEN) return json({ error: 'Worker missing GITHUB_TOKEN' }, 500, cors);

    const ghHeaders = {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'ai-consultant-lead-worker',
      'Content-Type': 'application/json',
    };

    // Best-effort: make sure the "lead" label exists (ignore "already exists" 422).
    await fetch(`https://api.github.com/repos/${repo}/labels`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ name: 'lead', color: '7C3AED', description: '網站諮詢表單' }),
    }).catch(() => {});

    const title = `AI 導入諮詢 · ${company || industry}`;
    const body = [
      '### 來源頁面', source, '',
      '### 產業類別', industry, '',
      '### 公司名稱', company || '（未填）', '',
      '### 聯絡方式', contact || '（未填）', '',
      '### 想解決的痛點', pain || '（未填）', '',
      '---', `_由 ai-consultant 網站於 ${new Date().toISOString()} 自動建立_`,
    ].join('\n');

    const gh = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ title, body, labels: ['lead'] }),
    });

    if (!gh.ok) {
      const detail = (await gh.text()).slice(0, 300);
      return json({ error: 'GitHub API error', status: gh.status, detail }, 502, cors);
    }

    const issue = await gh.json();
    return json({ ok: true, url: issue.html_url, number: issue.number }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
