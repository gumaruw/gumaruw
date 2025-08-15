// index.js - Cloudflare Worker for a dynamic "random joke" SVG badge
const jokes = [
  "Why did the developer go broke? Because he used up all his cache.",
  "Why do data scientists love tea? Because it comes with a good 'chai' of thought.",
  "I asked my model to tell a joke. It returned: '404: joke not found.'",
  "Why did the neural net get promoted? It had great layers of responsibility.",
  "Why does the programmer always mix up Christmas and Halloween? Because Oct 31 == Dec 25.",
  "My code loves exercise. It runs, compiles, and occasionally sleeps.",
  "Why was the dataset so chill? It had good normalization.",
  "I tried to train a model to be humble — it still overfit.",
  "Why did the ML engineer carry a broom? For sweeping hyperparameters.",
  "What do you call an optimistic model? One with a positive bias."
];

function randInt(max) {
  // cryptographically random
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
}

function truncate(s, n=72) {
  if (s.length <= n) return s;
  return s.slice(0, n-1).trimEnd() + '…';
}

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  // choose random joke
  const joke = jokes[randInt(jokes.length)];
  const text = truncate(joke, 72);
  const escaped = escapeHtml(text);

  // SVG dimensions and small font size for "smaller characters"
  const width = 520;
  const height = 40;
  const padding = 12;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escaped}">
    <style>
      .bg { fill: #0f172a; }
      .pill { fill: rgba(255,255,255,0.06); rx: 6; ry: 6; }
      .text { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; font-size:12px; fill: #e6edf3; }
      .label { font-weight:600; font-size:11px; fill:#9aa8b2; }
    </style>

    <rect width="100%" height="100%" class="bg" rx="6" ry="6" />
    <g transform="translate(${padding}, ${height/2})">
      <rect x="0" y="-14" width="${width - padding*2}" height="28" class="pill" />
      <text class="label" x="10" y="6">joke</text>
      <text class="text" x="58" y="6">${escaped}</text>
    </g>
  </svg>`;

  const headers = {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    // no caching so every reload gets a new joke
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*'
  };

  return new Response(svg, { status: 200, headers });
}
