/* "Ask my AI" — answers only from Manish's resume + verified links.
   If an AI endpoint is configured (api/chat on Vercel/Netlify), it uses Claude.
   Otherwise (e.g. GitHub Pages) it falls back to an in-browser resume engine.
   Conversation is remembered in this browser only (localStorage). */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const body = document.body;
  const fab = $('.ai-fab'), panel = $('#ai-panel'), log = $('.ai__log'), form = $('.ai__form'), input = $('#ai-input'), sugg = $('.ai__suggest');
  if (!fab || !panel) return;

  const STORE = 'manish-ai-chat-v1';
  const host = location.hostname;
  let endpoint = window.AI_ENDPOINT !== undefined ? window.AI_ENDPOINT
    : (location.protocol === 'file:' || host.endsWith('github.io') || host === 'localhost' || host === '127.0.0.1') ? '' : 'api/chat';

  const L = {
    email: '<a href="mailto:manish.agrawal.np@gmail.com">manish.agrawal.np@gmail.com</a>',
    wa: '<a href="https://wa.me/919565408829" target="_blank" rel="noopener">WhatsApp +91 95654 08829</a>',
    wa2: '<a href="https://wa.me/9779807000251" target="_blank" rel="noopener">WhatsApp +977 980 700 0251</a>',
    gh: '<a href="https://github.com/manish-brt" target="_blank" rel="noopener">github.com/manish-brt</a>',
    li: '<a href="https://www.linkedin.com/in/manish-agrawal/" target="_blank" rel="noopener">LinkedIn</a>',
    so: '<a href="https://stackoverflow.com/users/12272522/manish" target="_blank" rel="noopener">Stack Overflow</a>',
    saral: '<a href="https://play.google.com/store/apps/details?id=com.saral.application&hl=en_IN" target="_blank" rel="noopener">Saral on Google Play</a>',
    pbA: '<a href="https://play.google.com/store/apps/details?id=org.plasticbank.app" target="_blank" rel="noopener">Android</a>',
    pbI: '<a href="https://apps.apple.com/us/app/plasticbank/id1293745049" target="_blank" rel="noopener">iOS</a>',
    dh: '<a href="https://www.doctorhippo.in" target="_blank" rel="noopener">doctorhippo.in</a>',
    sb: '<a href="https://snookbill.com">snookbill.com</a>',
    rl: '<a href="https://myrentloop.com">myrentloop.com</a>',
  };

  /* ---------- in-browser knowledge base (resume facts only) ---------- */
  const KB = [
    { k: ['who', 'about', 'yourself', 'introduce', 'summary', 'manish', 'background', 'tell'], a: `Manish Agrawal is a Senior Mobile Application Developer with about 7 years of experience (May 2018 – April 2025). That includes over two years specialising in hybrid apps with Ionic, React Native, Flutter and KMM. He's known for driving user growth through feature work and performance tuning, collaborating with product teams and running code reviews. He is now building his own products, SnookBill (${L.sb}) and MyRentLoop (${L.rl}).` },
    { k: ['snookbill', 'snooker', 'pool', 'billiards', 'gaming', 'futsal', 'club', 'venue', 'billing'], a: `SnookBill (${L.sb}) is Manish's own product: billing software for snooker and pool clubs, gaming zones and futsal courts in Nepal and India. It has:\n• Live timers billed per minute, hour or game\n• Split bills, loser-pays, customer khata and open tabs\n• Kitchen orders, staff roles and payroll, analytics and a daily 6 AM report\n• A club page with online bookings, tournaments, thermal/PDF invoices and Google Drive backups\nIt runs in any browser on phone, tablet or PC and offers a 14-day free trial.` },
    { k: ['myrentloop', 'rentloop', 'rent', 'landlord', 'landlords', 'tenant', 'tenants', 'meter', 'property'], a: `MyRentLoop (${L.rl}) is Manish's own product: a rent, meter and bill manager for landlords in Nepal ("Collect rent, not headaches"). It has:\n• Electricity and water readings with NEA slab rates\n• Bulk bills shared on WhatsApp, with scheduled reminders\n• eSewa, Khalti and FonePay QR codes on every bill\n• A tenant app, expenses and profit tracking, and a 3D building view\n• Nepali, Hindi and English with the Bikram Sambat calendar, and it works offline\nIt's free for up to 2 units.` },
    { k: ['products', 'product', 'saas', 'startup', 'building', 'founder', 'own', 'side'], a: `Manish builds and runs his own products:\n• SnookBill (${L.sb}): billing for snooker clubs, gaming zones and futsal courts in Nepal and India\n• MyRentLoop (${L.rl}): rent, meter and bill management for landlords in Nepal\nBoth are live. Ask me about either one for details.` },
    { k: ['experience', 'years', 'long', 'career', 'worked', 'work', 'jobs', 'companies', 'history', 'timeline'], a: `Career timeline:\n• Senior Android Developer — Advantium Technologies, Delhi (Jun 2022 – Apr 2025)\n• Ionic Developer (freelance) — Rumsan, Kathmandu (Nov 2023 – Nov 2024)\n• Software Developer (freelance/remote) — Sep 2020 – Apr 2022\n• Software Developer — Fi Ellements Pvt. Ltd, Gurugram (May 2018 – Aug 2020)` },
    { k: ['advantium', 'saral', 'senior', 'dau', 'downloads', 'users', 'scale', 'scaled', 'biggest', 'impact', 'achievement'], a: `At Advantium Technologies (Jun 2022 – Apr 2025) Manish scaled the Android Saral App to 10k+ daily active users and 10L+ (1 million+) downloads. He built major modules — Social Media, Greetings, Man Ki Baat, Tiffin pe Charcha and WhatsApp — using MVVM + Clean Architecture with Kotlin, Jetpack (Room, ViewModel, LiveData, Navigation), Retrofit, Glide and Firebase, and improved retention with Firebase Analytics, Clarity and notifications. Link: ${L.saral}` },
    { k: ['rumsan', 'plastic', 'bank', 'ionic', 'mentor', 'mentored', 'team', 'lead', 'led', 'leadership'], a: `At Rumsan (freelance, Nov 2023 – Nov 2024) Manish led the from-scratch revamp of the Plastic Bank mobile apps with Ionic React + Capacitor — ${L.pbA} (10K+ downloads) and ${L.pbI} — and mentored a team of 3 developers.` },
    { k: ['doctorhippo', 'telemedicine', 'doctor', 'health', 'freelance', 'remote', 'spark', 'educorp', 'elearning', 'exoplayer', 'video'], a: `As a freelance/remote developer (Sep 2020 – Apr 2022):\n• DoctorHippo (telemedicine) — built the platform with Ionic React + Capacitor so patients can book offline/online consultations. ${L.dh}\n• Spark Educorp (eLearning) — improved and fixed the native Android app; integrated ExoPlayer and YouTube Player for video lectures.` },
    { k: ['fi', 'ellements', 'gurugram', 'celebrity', 'univox', 'carzeva', 'laundry', 'leasekey', 'pashuchikitsa', 'first', 'early'], a: `At Fi Ellements Pvt. Ltd, Gurugram (May 2018 – Aug 2020) Manish built: Celebrity App (React Native), Univox Community (Ionic Angular — Android 1L+ downloads + iOS), and native Android (Java) apps Carzeva, Let's Laundry, LeaseKey and Pashuchikitsa. He was named Most Promising Employee of the Month in September 2018.` },
    { k: ['projects', 'project', 'apps', 'portfolio', 'built', 'shipped', 'links', 'link'], a: `His own products: SnookBill (${L.sb}) and MyRentLoop (${L.rl}).\nClient work with live links:\n• Saral App — ${L.saral}\n• Plastic Bank — ${L.pbA} · ${L.pbI}\n• DoctorHippo — ${L.dh}\nAlso shipped: Univox Community, Celebrity App, Spark Educorp, Carzeva, Let's Laundry, LeaseKey and Pashuchikitsa (public listings for these are no longer available). Code: ${L.gh}` },
    { k: ['skills', 'stack', 'tech', 'technologies', 'tools', 'know', 'languages', 'expertise'], a: `Skills:\n• Android — Kotlin, Java, Jetpack Compose, MVVM/MVI/MVP, Clean Architecture, Coroutines, Flows, Room, Hilt/Dagger, Retrofit, WorkManager, CameraX, ExoPlayer, Firebase, CI/CD\n• Cross-platform — Ionic (React/Angular, Capacitor, Cordova), React Native (Expo), Flutter, Kotlin & Compose Multiplatform\n• Web/Backend — TypeScript, JavaScript, React, Node.js, Python (Django), REST, MySQL\n• AI — LLMs, RAG, LangChain, Gemini (Gemma), Google ML Kit, Claude, Cursor, Streamlit, Gradio` },
    { k: ['android', 'kotlin', 'java', 'compose', 'jetpack', 'native', 'mvvm', 'architecture', 'clean', 'hilt', 'room', 'coroutines'], a: `Native Android is Manish's core: Kotlin and Java, Jetpack (Compose, Room/SQLite, ViewModel, Navigation, Paging, WorkManager, CameraX), Coroutines, Flows, LiveData, Dagger/Hilt, Retrofit, Glide, ExoPlayer, Firebase, Material Design, JUnit, deep links, offline-first and CI/CD — usually with MVVM/MVI and Clean Architecture.` },
    { k: ['flutter', 'react', 'native', 'cross', 'platform', 'hybrid', 'kmp', 'kmm', 'multiplatform', 'capacitor', 'cordova', 'expo'], a: `Cross-platform: Ionic (React & Angular with Capacitor/Cordova), React Native (JavaScript/TypeScript, Expo), Flutter (Dart), Kotlin Multiplatform (KMP) and Compose Multiplatform (CMP). He's shipped production apps with Ionic (Plastic Bank, DoctorHippo, Univox) and React Native (Celebrity App).` },
    { k: ['ai', 'llm', 'rag', 'langchain', 'gemini', 'ml', 'machine', 'claude', 'cursor', 'gradio', 'streamlit'], a: `AI skills listed on Manish's resume: Google Antigravity, Google ML Kit, Cursor, Claude, LLMs, RAG, LangChain, Gemini (Gemma), Python, Streamlit and Gradio.` },
    { k: ['web', 'backend', 'node', 'django', 'python', 'typescript', 'javascript', 'mysql', 'api'], a: `Web/backend: TypeScript, JavaScript, ReactJS, Node.js, Python (Django), REST APIs, Apache and MySQL.` },
    { k: ['education', 'degree', 'college', 'university', 'study', 'studied', 'mnnit', 'btech', 'cpi', 'graduate'], a: `Manish holds a Bachelor's in Electronics and Communication Engineering from Motilal Nehru National Institute of Technology (MNNIT), Allahabad, India (Jun 2014 – Aug 2018), with a CPI of 7.29.` },
    { k: ['achievements', 'awards', 'award', 'sat', 'compex', 'scholarship', 'employee', 'month', 'recognition'], a: `Achievements:\n• 10k+ DAU and 10 lakh downloads — Saral Android App, Advantium Technologies (May 2024)\n• Most Promising Employee of the Month — Fi Ellements (Sep 2018)\n• Qualified the COMPEX exam held by the Embassy of India (2014) — scholarship\n• SAT II score 2040/2400 (May 2014), qualifying under the DASA scheme` },
    { k: ['contact', 'email', 'reach', 'hire', 'phone', 'whatsapp', 'call', 'number', 'available', 'availability', 'freelance', 'job', 'open'], a: `You can reach Manish at ${L.email}, on ${L.wa} or ${L.wa2}, or by phone at +91 95654 08829 / +977 980 700 0251. He's also on ${L.li} and ${L.gh}. He's currently open to opportunities; for details like role type and rates, please ask him directly. His résumé (PDF) is linked in the hero and contact sections.` },
    { k: ['resume', 'résumé', 'cv', 'pdf', 'download'], a: `You can download Manish's résumé (PDF) with the Résumé button in the hero or the contact section of this page.` },
    { k: ['location', 'where', 'based', 'live', 'country', 'relocate', 'timezone', 'address'], a: `Manish hasn't shared his location here. He works with teams remotely and has worked with companies in Delhi, Gurugram and Kathmandu. To discuss work arrangements, reach him at ${L.email}.` },
    { k: ['github', 'linkedin', 'stackoverflow', 'stack', 'overflow', 'social', 'profiles', 'code', 'repos', 'open', 'source'], a: `Profiles: ${L.gh} · ${L.li} · ${L.so}` },
    { k: ['blog', 'writing', 'articles', 'posts'], a: `Manish's blog is coming soon. Meanwhile, you can see his answers on ${L.so}.` },
    { k: ['soft', 'communication', 'management', 'people', 'documentation', 'debugging', 'reviews'], a: `Soft skills on his resume: people management, excellent communication, mind-mapping, technical documentation and debugging. He has mentored a team of 3 and regularly conducts code reviews.` },
  ];
  const STOP = new Set('a an the is are was were do does did of in on at to for with and or what which who how why when me my his him he you your i can could would tell about please there any has have'.split(' '));
  const tokens = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));

  function localAnswer(q) {
    const t = tokens(q);
    if (!t.length || /^(hi|hello|hey|namaste|yo)\b/i.test(q.trim())) return `Hi! I can answer questions about Manish's experience, skills, projects, education and how to contact him. What would you like to know?`;
    if (/salary|rate|price|cost|charge|age|married|religion|politic/i.test(q)) return `That isn't in Manish's resume, so I can't say. Please ask him directly at ${L.email}.`;
    let best = null, score = 0;
    for (const e of KB) {
      let s = 0;
      for (const w of t) for (const k of e.k) { if (w === k) s += 2; else if (w.length > 3 && (k.startsWith(w) || w.startsWith(k))) s += 1; }
      if (s > score) { score = s; best = e; }
    }
    return score >= 2 ? best.a : `I'm not sure — that isn't covered in Manish's resume. Try asking about his experience, skills, projects or education, or contact him at ${L.email}.`;
  }

  /* ---------- state ---------- */
  const GREETING = `Hi, I'm Manish's AI assistant. Ask me anything about his experience, skills or projects.`;
  const SUGGESTIONS = ['What does Manish do?', 'What products is he building?', 'What is SnookBill?', 'What is MyRentLoop?', 'Biggest impact?', 'Tech stack?', 'Show me projects', 'Cross-platform experience?', 'Education?', 'How can I hire him?'];
  let history = [];
  const load = () => { try { history = JSON.parse(localStorage.getItem(STORE)) || []; } catch (e) { history = []; } };
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(history.slice(-40))); } catch (e) {} };

  function esc(s) { return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  // Only these link targets are ever rendered as clickable.
  const SAFE_URL = /^https:\/\/(www\.|app\.)?(github\.com|linkedin\.com|stackoverflow\.com|play\.google\.com|apps\.apple\.com|doctorhippo\.in|snookbill\.com|myrentloop\.com|wa\.me)(\/|$)/;
  const SAFE_HREF = (u) => SAFE_URL.test(u) || /^mailto:manish\.agrawal\.np@gmail\.com$/.test(u);

  // render model output: escape everything, then linkify allow-listed URLs/emails and **bold**
  function renderRemote(text) {
    let h = esc(text);
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/https:\/\/[^\s<)"']+/g, (u) => (SAFE_URL.test(u) ? `<a href="${u}">${u}</a>` : u));
    h = h.replace(/manish\.agrawal\.np@gmail\.com/g, '<a href="mailto:manish.agrawal.np@gmail.com">manish.agrawal.np@gmail.com</a>');
    return h;
  }

  // Rebuild markup from an inert document, keeping only text, <br>, <strong> and safe <a>.
  // Protects against anything unexpected in stored history or model output.
  function sanitizeInto(target, html) {
    const tpl = document.createElement('template'); // inert: no scripts, no image loads, no handlers
    tpl.innerHTML = html;
    const src = tpl.content;
    (function walk(from, to) {
      from.childNodes.forEach((n) => {
        if (n.nodeType === 3) { to.appendChild(document.createTextNode(n.nodeValue)); return; }
        if (n.nodeType !== 1) return;
        const tag = n.tagName;
        if (tag === 'A' && SAFE_HREF(n.getAttribute('href') || '')) {
          const a = document.createElement('a'); a.href = n.getAttribute('href');
          if (!a.href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
          walk(n, a); to.appendChild(a);
        } else if (tag === 'STRONG' || tag === 'B') { const s = document.createElement('strong'); walk(n, s); to.appendChild(s); }
        else if (tag === 'BR') to.appendChild(document.createElement('br'));
        else walk(n, to);
      });
    })(src, target);
  }

  function bubble(role, html, animate = true) {
    const d = document.createElement('div');
    d.className = `msg msg--${role === 'user' ? 'me' : 'bot'}`;
    if (!animate) d.classList.add('no-anim');
    if (role === 'user') d.textContent = html; else sanitizeInto(d, html);
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function renderAll() {
    log.innerHTML = '';
    bubble('bot', GREETING, false);
    history.forEach((m) => bubble(m.role, m.role === 'user' ? m.content : m.html, false));
    renderSuggestions();
  }
  function renderSuggestions() {
    sugg.innerHTML = '';
    const asked = new Set(history.filter((m) => m.role === 'user').map((m) => m.content));
    SUGGESTIONS.filter((s) => !asked.has(s)).slice(0, 5).forEach((s) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = s;
      b.addEventListener('click', () => ask(s)); sugg.appendChild(b);
    });
  }

  async function remoteAnswer(q) {
    const msgs = history.slice(-12).map((m) => ({ role: m.role, content: m.role === 'user' ? m.content : (m.text || '') }));
    msgs.push({ role: 'user', content: q });
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: msgs }), signal: ctrl.signal });
      if (!r.ok) throw new Error('bad status ' + r.status);
      const j = await r.json(); if (!j.reply) throw new Error('empty');
      return j.reply;
    } finally { clearTimeout(to); }
  }

  let busy = false;
  async function ask(q) {
    q = q.trim(); if (!q || busy) return;
    busy = true; input.value = '';
    history.push({ role: 'user', content: q }); bubble('user', q); save(); renderSuggestions();
    const typing = bubble('bot', ''); typing.classList.add('msg--typing');
    for (let i = 0; i < 3; i++) typing.appendChild(document.createElement('i'));
    let html, text;
    if (endpoint) {
      try { text = await remoteAnswer(q); html = renderRemote(text); }
      catch (e) { endpoint = ''; }
    }
    if (!html) {
      await new Promise((r) => setTimeout(r, 450 + Math.random() * 400));
      html = localAnswer(q); text = html.replace(/<[^>]+>/g, '');
    }
    typing.remove();
    history.push({ role: 'assistant', html, text }); bubble('assistant', html); save();
    busy = false; input.focus({ preventScroll: true });
  }

  /* ---------- open / close / reset ---------- */
  function open() {
    body.classList.add('ai-open'); panel.setAttribute('aria-hidden', 'false'); fab.setAttribute('aria-expanded', 'true');
    setTimeout(() => input.focus({ preventScroll: true }), 300);
  }
  function close() { body.classList.remove('ai-open'); panel.setAttribute('aria-hidden', 'true'); fab.setAttribute('aria-expanded', 'false'); fab.focus({ preventScroll: true }); }
  fab.addEventListener('click', open);
  $('[data-ai-close]').addEventListener('click', close);
  $('[data-ai-reset]').addEventListener('click', () => { history = []; save(); renderAll(); input.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && body.classList.contains('ai-open')) close(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  // keep wheel scrolling inside the chat log instead of the page (Lenis)
  log.setAttribute('data-lenis-prevent', '');

  load(); renderAll();
})();
