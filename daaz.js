/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
const S = {
  type: null,
  scale: null,
  team: null,
  priority: [],
  extra: ''
};

const TYPE_MAP = {
  web_app:       'Web Application (SaaS, dashboard, or portal)',
  mobile_app:    'Mobile App (iOS / Android / cross-platform)',
  api_backend:   'API / Backend service (REST, GraphQL, microservices)',
  ecommerce:     'E-Commerce platform or marketplace',
  realtime:      'Real-time application (chat, live updates, multiplayer)',
  ml_ai:         'AI / ML Platform (model serving, pipelines, inference)',
  data_platform: 'Data / Analytics Platform (ETL, BI, warehousing)',
  cms:           'Content site or CMS (blog, media, documentation)'
};
const SCALE_MAP = {
  mvp:    'MVP / Prototype — under 1,000 users, validate fast',
  small:  'Small scale — 1,000 to 50,000 monthly active users',
  medium: 'Medium scale — 50,000 to 1,000,000 monthly active users',
  large:  'Large scale — 1M+ users, global distribution'
};
const TEAM_MAP = {
  solo:        'Solo developer, wearing all hats',
  small_team:  'Small generalist team of 2–5 developers',
  specialized: 'Specialized team with dedicated frontend, backend, and ops roles',
  enterprise:  'Enterprise team of 10+ developers with governance requirements'
};
const PRI_MAP = {
  speed_dev:   'Fast development velocity',
  performance: 'High runtime performance',
  scalability: 'Horizontal scalability',
  cost:        'Low cost / open-source preference',
  dx:          'Developer experience (DX)',
  security:    'Security and compliance',
  hiring:      'Large talent pool for hiring',
  longevity:   'Long-term ecosystem stability',
  ecosystem:   'Rich library and tooling ecosystem'
};

/* ═══════════════════════════════════════════
   STEP NAVIGATION
═══════════════════════════════════════════ */
function goStep(n) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${n}`).classList.add('active');
  updateStepBar(n);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepBar(active) {
  const labels = ['', 'Project', 'Scale', 'Team', 'Priorities', 'Context'];
  for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById(`sd${i}`);
    const lbl = document.getElementById(`sl${i}`);
    const con = document.getElementById(`sc${i}`);
    dot.className = 'step-dot';
    lbl.className = 'step-label';
    if (i < active) {
      dot.classList.add('done');
      dot.innerHTML = '';
      lbl.classList.add('done');
      if (con) con.classList.add('done');
    } else if (i === active) {
      dot.classList.add('active');
      dot.innerHTML = `<span>${i}</span>`;
      lbl.classList.add('active');
      if (con) con.classList.remove('done');
    } else {
      dot.innerHTML = `<span>${i}</span>`;
      if (con) con.classList.remove('done');
    }
    lbl.textContent = labels[i];
  }
}

/* ═══════════════════════════════════════════
   OPTION SELECTION
═══════════════════════════════════════════ */
function pick(el, field, step) {
  el.closest('.option-grid').querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  S[field] = el.dataset.val;
  document.getElementById(`next${step}`).disabled = false;
}

function togglePriority(el) {
  const val = el.dataset.val;
  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    S.priority = S.priority.filter(v => v !== val);
  } else {
    if (S.priority.length >= 3) return;
    el.classList.add('selected');
    S.priority.push(val);
  }
  const n = S.priority.length;
  document.getElementById('next4').disabled = n === 0;
  document.getElementById('prog4').textContent = `${n} / 3 selected`;
}

/* ═══════════════════════════════════════════
   ANALYSIS
═══════════════════════════════════════════ */
function buildPrompt() {
  const extra = document.getElementById('extraCtx').value.trim();
  S.extra = extra;

  return `You are DevPath, a senior software architect AI advisor. Your job is to recommend the top 3 tech stacks for a software project. You are UNBIASED — you score objectively based on fit, not trends or vendor partnerships.

PROJECT PROFILE:
- Project type: ${TYPE_MAP[S.type]}
- Expected scale: ${SCALE_MAP[S.scale]}
- Team: ${TEAM_MAP[S.team]}
- Top priorities (weighted heavily): ${S.priority.map(p => PRI_MAP[p]).join(', ')}
${extra ? `- Additional context from the user: ${extra}` : '- No additional context provided.'}

YOUR TASK:
Recommend exactly 3 tech stacks ranked #1 (best fit) to #3. Be specific about actual technologies.

SCORING RUBRIC (0–100, relative to each other and to the priorities given):
- speed: How quickly can this stack go from idea to deployed feature?
- performance: Runtime throughput, latency, and efficiency at stated scale
- scalability: How well does it grow from current scale to 10× scale?
- cost: Total cost of ownership, hosting, licensing, and operational cost
- dx: Developer experience — tooling, docs, debugging, onboarding

RESPOND ONLY IN VALID JSON. No markdown, no extra text, no code fences. Use this exact schema:

{
  "stacks": [
    {
      "rank": 1,
      "name": "string (e.g. Next.js + PostgreSQL + Railway)",
      "tagline": "string (one sentence, who this is ideal for)",
      "layers": [
        "Frontend: ...",
        "Backend: ...",
        "Database: ...",
        "Auth: ...",
        "Infra / Hosting: ..."
      ],
      "scores": {
        "speed": 0,
        "performance": 0,
        "scalability": 0,
        "cost": 0,
        "dx": 0
      },
      "strengths": "string (2–3 sentences explaining why this stack fits this specific project profile)",
      "weaknesses": "string (2–3 sentences being honest about where this stack falls short for this use case)"
    },
    { "rank": 2, ... },
    { "rank": 3, ... }
  ],
  "vs_12": {
    "dimension": "string (e.g. 'Development speed vs. long-term scalability')",
    "stack1_advantage": "string (1–2 sentences on where stack 1 wins over stack 2)",
    "stack2_advantage": "string (1–2 sentences on where stack 2 wins over stack 1)"
  },
  "vs_13": {
    "dimension": "string",
    "stack1_advantage": "string",
    "stack3_advantage": "string"
  },
  "why_1_over_2": "string (3–4 sentences: specific, evidence-based reasoning referencing the user's exact priorities)",
  "why_1_over_3": "string (2–3 sentences: key differentiator that makes #1 the clear winner over #3)",
  "verdict": "string (3–5 sentences: direct, confident final recommendation. Reference specific technologies by name. Address the user's context.)"
}`;
}

async function analyze() {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('stepLoading').classList.add('active');

  const messages = [
    'Analyzing your requirements...',
    'Evaluating candidate stacks...',
    'Running tradeoff analysis...',
    'Scoring across 5 dimensions...',
    'Composing your report...'
  ];
  let mi = 0;
  const statusEl = document.getElementById('loaderStatus');
  const ticker = setInterval(() => {
    mi = (mi + 1) % messages.length;
    statusEl.textContent = messages[mi];
  }, 2200);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: buildPrompt() }]
      })
    });

    clearInterval(ticker);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const raw = (data.content || []).map(b => b.text || '').join('');
    const clean = raw.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(clean);
    renderResult(parsed);

  } catch (e) {
    clearInterval(ticker);
    document.getElementById('stepLoading').classList.remove('active');
    document.getElementById('stepResult').classList.add('active');
    document.getElementById('resultContent').innerHTML = `
      <div class="error-panel">
        <div class="error-title">Analysis failed</div>
        <div class="error-body">
          Something went wrong while generating your recommendation.
          Check that your API key is valid and has access to the Claude claude-sonnet-4-20250514 model.
        </div>
        <div class="error-code">${e.message}</div>
      </div>`;
  }
}

/* ═══════════════════════════════════════════
   RENDER RESULTS
═══════════════════════════════════════════ */
function layerClass(layer) {
  const l = layer.toLowerCase();
  if (l.startsWith('frontend')) return 'frontend';
  if (l.startsWith('backend')) return 'backend';
  if (l.startsWith('database') || l.startsWith('db')) return 'database';
  if (l.startsWith('infra') || l.startsWith('hosting') || l.startsWith('deploy')) return 'infra';
  return '';
}

function renderResult(data) {
  document.getElementById('stepLoading').classList.remove('active');
  document.getElementById('stepResult').classList.add('active');

  const scoreMeta = [
    { key: 'speed',        label: 'Speed to build',   cls: 'fill-speed' },
    { key: 'performance',  label: 'Performance',       cls: 'fill-performance' },
    { key: 'scalability',  label: 'Scalability',       cls: 'fill-scalability' },
    { key: 'cost',         label: 'Cost efficiency',   cls: 'fill-cost' },
    { key: 'dx',           label: 'Developer XP',      cls: 'fill-dx' }
  ];

  let html = `
    <div class="result-intro">
      <div class="result-eyebrow">Analysis complete</div>
      <h2 class="result-title">Your top 3 recommended stacks</h2>
      <p class="result-sub">
        Ranked by fit to your project profile. Scores are relative to each other.
        Expand each card to see honest weaknesses.
      </p>
    </div>
  `;

  // Stacks
  data.stacks.forEach(s => {
    const isRec = s.rank === 1;
    html += `<div class="stack-card${isRec ? ' recommended' : ''}">`;

    // Header
    html += `<div class="stack-header">
      <div class="stack-rank-badge rank-${s.rank}">#${s.rank}</div>
      <div class="stack-name-col">
        <div class="stack-name">
          ${escHtml(s.name)}
          ${isRec ? '<span class="rec-chip">Recommended</span>' : ''}
        </div>
        <div class="stack-tagline">${escHtml(s.tagline)}</div>
      </div>
    </div>`;

    // Layers
    html += `<div class="layer-wrap">`;
    (s.layers || []).forEach(l => {
      html += `<div class="layer-chip ${layerClass(l)}">${escHtml(l)}</div>`;
    });
    html += `</div>`;

    // Score bars
    html += `<div class="scores-wrap" id="scores_${s.rank}">`;
    scoreMeta.forEach(m => {
      const v = s.scores?.[m.key] ?? 0;
      html += `<div class="score-row">
        <span class="score-label">${m.label}</span>
        <div class="score-track"><div class="score-fill ${m.cls}" data-target="${v}" style="width:0%"></div></div>
        <span class="score-num">${v}</span>
      </div>`;
    });
    html += `</div>`;

    // Strengths + collapsible weaknesses
    const uid = `wk${s.rank}`;
    html += `<div class="stack-body" style="margin-top:16px;">
      <strong>Why it fits:</strong> ${escHtml(s.strengths)}
    </div>
    <button class="toggle-btn" onclick="toggleWeak('${uid}',this)">▸ Show weaknesses</button>
    <div class="collapsible" id="${uid}">
      <hr class="stack-divider">
      <div class="stack-body">
        <strong>Honest weaknesses:</strong> ${escHtml(s.weaknesses)}
      </div>
    </div>`;

    html += `</div>`; // .stack-card
  });

  // Comparison
  if (data.vs_12 || data.vs_13) {
    html += `<div class="comparison-section"><div class="section-label">Side-by-side comparison</div>`;

    if (data.vs_12 && data.stacks[0] && data.stacks[1]) {
      const n1 = data.stacks[0].name.split(' ')[0];
      const n2 = data.stacks[1].name.split(' ')[0];
      html += `<div class="comparison-card">
        <div class="comp-title">#1 ${escHtml(data.stacks[0].name)} vs #2 ${escHtml(data.stacks[1].name)}</div>
        <div class="vs-grid">
          <div class="vs-col">
            <div class="vs-head">${escHtml(n1)} advantage</div>
            <div class="vs-body vs-win">${escHtml(data.vs_12.stack1_advantage)}</div>
          </div>
          <div class="vs-separator"><div class="vs-pill">vs</div></div>
          <div class="vs-col">
            <div class="vs-head">${escHtml(n2)} advantage</div>
            <div class="vs-body vs-lose">${escHtml(data.vs_12.stack2_advantage)}</div>
          </div>
        </div>
      </div>`;
    }

    if (data.vs_13 && data.stacks[0] && data.stacks[2]) {
      const n1 = data.stacks[0].name.split(' ')[0];
      const n3 = data.stacks[2].name.split(' ')[0];
      html += `<div class="comparison-card">
        <div class="comp-title">#1 ${escHtml(data.stacks[0].name)} vs #3 ${escHtml(data.stacks[2].name)}</div>
        <div class="vs-grid">
          <div class="vs-col">
            <div class="vs-head">${escHtml(n1)} advantage</div>
            <div class="vs-body vs-win">${escHtml(data.vs_13.stack1_advantage)}</div>
          </div>
          <div class="vs-separator"><div class="vs-pill">vs</div></div>
          <div class="vs-col">
            <div class="vs-head">${escHtml(n3)} advantage</div>
            <div class="vs-body">${escHtml(data.vs_13.stack3_advantage)}</div>
          </div>
        </div>
      </div>`;
    }

    html += `</div>`; // .comparison-section
  }

  // Reasoning
  if (data.why_1_over_2 || data.why_1_over_3) {
    html += `<div class="reasoning-section"><div class="section-label">Precise reasoning</div>`;
    if (data.why_1_over_2) {
      html += `<div class="reason-card">
        <div class="reason-head">Why #1 over #2</div>
        <div class="reason-body">${escHtml(data.why_1_over_2)}</div>
      </div>`;
    }
    if (data.why_1_over_3) {
      html += `<div class="reason-card">
        <div class="reason-head">Why #1 over #3</div>
        <div class="reason-body">${escHtml(data.why_1_over_3)}</div>
      </div>`;
    }
    html += `</div>`;
  }

  // Verdict
  if (data.verdict) {
    html += `<div class="verdict-card">
      <div class="verdict-label">Final verdict</div>
      <div class="verdict-text">${escHtml(data.verdict)}</div>
    </div>`;
  }

  document.getElementById('resultContent').innerHTML = html;

  // Animate score bars after DOM insert
  setTimeout(() => {
    document.querySelectorAll('.score-fill[data-target]').forEach(el => {
      const t = parseFloat(el.dataset.target);
      el.style.width = t + '%';
    });
  }, 80);
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function toggleWeak(id, btn) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  btn.textContent = el.classList.contains('open') ? '▾ Hide weaknesses' : '▸ Show weaknesses';
}

function restart() {
  S.type = null; S.scale = null; S.team = null; S.priority = []; S.extra = '';
  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.tag-pill').forEach(t => t.classList.remove('selected'));
  document.getElementById('extraCtx').value = '';
  document.getElementById('prog4').textContent = '0 / 3 selected';
  ['next1','next2','next3','next4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  });
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('step1').classList.add('active');
  updateStepBar(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}