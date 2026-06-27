# Lead form → GitHub Issue (no login for visitors)

A tiny Cloudflare Worker that receives the website contact form and creates a
GitHub Issue in `BrotherSupport/ai_consultant`. Visitors **do not** need a
GitHub account — they just fill the form and see an inline "thanks".

```
visitor form  ──POST JSON──▶  Cloudflare Worker (holds token)
                              └─▶ GitHub API: create issue (+ label "lead")
                              ◀── { ok: true, url }
visitor sees: 「已收到，我們會盡快聯繫你」
```

---

## 1. Create a GitHub token (least privilege)

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Resource owner**: `BrotherSupport`  ·  **Repository access**: *Only select repositories* → `ai_consultant`.
3. **Repository permissions** → **Issues: Read and write**. (Nothing else needed.)
4. Set a short expiry and **Generate**. Copy the `github_pat_…` value.

> Tip: a fine-grained token scoped to this one repo + Issues only means a leak
> can, at worst, open issues here — not touch anything else.

## 2. Deploy the Worker (dashboard, no CLI)

1. Cloudflare dashboard → **Workers & Pages → Create → Create Worker**. Name it e.g. `ai-consultant-lead`.
2. **Edit code**, delete the sample, paste the contents of [`worker.js`](./worker.js), **Deploy**.
3. Worker → **Settings → Variables → Add variable**:
   - **Secret** `GITHUB_TOKEN` = the token from step 1  (click *Encrypt*).
   - *(optional)* Plain var `REPO` = `BrotherSupport/ai_consultant` (already the default).
   - *(optional)* Plain var `ALLOWED_ORIGINS` = `https://brothersupport.github.io` (default). Add your custom domain here later, comma-separated.
4. Copy the Worker URL, e.g. `https://ai-consultant-lead.<your-subdomain>.workers.dev`.

## 3. Point the site at the Worker

In **`index.html`** and **`ai_agent.html`**, find:

```js
const WORKER_URL = ''; // paste your Cloudflare Worker URL here
```

Paste your URL between the quotes, commit, push. Done — the forms now submit
without any login. (While `WORKER_URL` is empty, the forms fall back to opening
a prefilled GitHub issue, which *does* require a login.)

## 4. Test

```bash
curl -X POST https://ai-consultant-lead.<your-subdomain>.workers.dev \
  -H 'Content-Type: application/json' \
  -d '{"industry":"製造","company":"測試公司","contact":"test@example.com","pain":"報價太慢","source":"CURL"}'
# → {"ok":true,"url":"https://github.com/BrotherSupport/ai_consultant/issues/123","number":123}
```

---

## Optional: deploy with Wrangler (CLI) instead

```bash
npm i -g wrangler
cd worker
wrangler deploy worker.js --name ai-consultant-lead
wrangler secret put GITHUB_TOKEN   # paste token when prompted
```

## Notes
- **Spam**: a hidden honeypot field is dropped server-side. For heavier traffic,
  add Cloudflare Turnstile (free) — ask and I'll wire it in.
- **Privacy**: issues are public if the repo is public. To keep leads private,
  set `REPO` to a private repo you own (the token must have access to it).
- **Cost**: Cloudflare Workers free tier = 100k requests/day. Plenty.
