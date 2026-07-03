function initAgentGuide(options) {
  const opts = Object.assign({ autoShow: false, homePath: '' }, options || {});
  const widget = document.getElementById('agentWidget');
  const panel = document.getElementById('agentPanel');
  const orb = document.getElementById('agentOrb');
  const closeBtn = document.getElementById('agentClose');
  const questionEl = document.getElementById('agentQuestion');
  const answerEl = document.getElementById('agentAnswer');
  const presetsEl = document.getElementById('agentPresets');
  const chipsEl = document.getElementById('agentChips');
  const nextBtn = document.getElementById('agentNext');
  if (!widget) return;

  const home = opts.homePath;
  const link = (hash) => home + hash;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CHAR_SPEED = reducedMotion ? 0 : 18;

  const agentFacts = [
    { category: 'work', text: 'McKenna is a UX Engineer — a UX designer who codes and a frontend developer who empathises.' },
    { category: 'work', text: 'She was a Product Designer at Bamboo HR, a SaaS HR company in Silicon Slopes, Utah.' },
    { category: 'work', text: 'She\'s open to work and remote friendly — building products people actually enjoy using.' },
    { category: 'work', text: '4 years building digital products across health, home, and services.' },
    { category: 'skills', text: 'She writes the markup she designs — Figma to production, no translation layer needed.' },
    { category: 'skills', text: 'Her skill tree covers visual design, UX research, front-end dev, design systems, and CSS animation.' },
    { category: 'skills', text: '100+ user research sessions completed — empathy maps, interviews, usability testing, and more.' },
    { category: 'skills', text: 'Tools include Figma, React, TypeScript, VS Code, Cursor, Claude, Webflow, and Spline.' },
    { category: 'fun', text: 'Off-screen: fly fishing, hiking, backpacking, pickleball, running, acrylic/oil painting, and good movies.' },
    { category: 'fun', text: '∞ browser tabs open at any given moment — it\'s a feature, not a bug.' },
    { category: 'contact', text: 'Email her at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mckennawilson1824@gmail.com" target="_blank" rel="noopener noreferrer">mckennawilson1824@gmail.com</a>.' },
    { category: 'contact', text: 'Connect on <a href="https://www.linkedin.com/in/mckenna-wilson-3404402a2" target="_blank" rel="noopener noreferrer">LinkedIn</a>.' },
    { category: 'contact', text: 'See her code on <a href="https://github.com/KennaWilson" target="_blank" rel="noopener noreferrer">GitHub</a>.' },
  ];

  const agentPresets = [
    {
      question: 'What does McKenna do?',
      answer: 'She\'s a UX Engineer — UX designer who codes. She builds products people actually enjoy using, from research through to production-ready UI.'
    },
    {
      question: 'Is she open to work?',
      answer: 'Yes — open to work and remote friendly. Head to the <a href="' + link('#contact') + '">contact section</a> to reach out via email or LinkedIn.'
    },
    {
      question: 'What\'s her background?',
      answer: 'Product Designer at Bamboo HR with 4+ years shipping digital products across health, home, and services.'
    },
    {
      question: 'What tools does she use?',
      answer: 'Figma, React, TypeScript, HTML/CSS, VS Code, Cursor, Claude, Webflow, Adobe CC, and more — check the Skill Tree in <a href="' + link('#skills') + '">section 01</a>.'
    },
    {
      question: 'How do I contact her?',
      answer: 'Email <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mckennawilson1824@gmail.com" target="_blank" rel="noopener noreferrer">mckennawilson1824@gmail.com</a>, connect on <a href="https://www.linkedin.com/in/mckenna-wilson-3404402a2" target="_blank" rel="noopener noreferrer">LinkedIn</a>, or browse her work in <a href="' + link('#projects') + '">Quest Log</a>.'
    },
  ];

  const chipLabels = { work: 'Work', skills: 'Skills', fun: 'Fun', contact: 'Contact', random: 'Random' };
  const factIndices = { work: 0, skills: 0, fun: 0, contact: 0, random: 0 };
  let activeCategory = 'work';
  let typeTimer = null;
  let firstOpen = true;

  function clearTypeTimer() {
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
  }

  function typewrite(el, html, speed, onDone) {
    clearTypeTimer();
    if (speed === 0) {
      el.innerHTML = html;
      if (onDone) onDone();
      return;
    }
    const segments = [];
    const re = /(<[^>]+>)|([^<]+)/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      if (m[1]) segments.push({ type: 'tag', content: m[1] });
      else segments.push({ type: 'text', content: m[2] });
    }
    let built = '';
    let si = 0, ci = 0;
    function tick() {
      if (si >= segments.length) { if (onDone) onDone(); return; }
      const seg = segments[si];
      if (seg.type === 'tag') {
        built += seg.content; si++; ci = 0;
        el.innerHTML = built + '<span class="agent-cursor">▌</span>';
        tick();
      } else {
        built += seg.content[ci];
        ci++;
        el.innerHTML = built + '<span class="agent-cursor">▌</span>';
        if (ci >= seg.content.length) { si++; ci = 0; }
        typeTimer = setTimeout(tick, speed);
      }
    }
    tick();
  }

  function clearPresetHighlight() {
    presetsEl.querySelectorAll('.agent-preset').forEach(b => b.classList.remove('active'));
  }

  function clearChipHighlight() {
    chipsEl.querySelectorAll('.agent-chip').forEach(b => b.classList.remove('active'));
  }

  function highlightChip(category) {
    const btn = chipsEl.querySelector('[data-category="' + category + '"]');
    if (btn) btn.classList.add('active');
  }

  function showAnswer(html, questionText) {
    questionEl.textContent = questionText || '';
    typewrite(answerEl, html, CHAR_SPEED);
  }

  function showFact(category, advance) {
    activeCategory = category;
    clearPresetHighlight();
    clearChipHighlight();
    highlightChip(category);

    if (category === 'random') {
      const fact = agentFacts[Math.floor(Math.random() * agentFacts.length)];
      showAnswer(fact.text);
      return;
    }

    const pool = agentFacts.filter(f => f.category === category);
    if (!pool.length) return;

    const idx = factIndices[category] || 0;
    showAnswer(pool[idx % pool.length].text);
    if (advance !== false) factIndices[category] = (idx + 1) % pool.length;
  }

  function showPreset(preset, btn) {
    clearChipHighlight();
    clearPresetHighlight();
    if (btn) btn.classList.add('active');
    showAnswer(preset.answer, 'YOU: ' + preset.question);
  }

  agentPresets.forEach(preset => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'agent-preset';
    btn.textContent = preset.question;
    btn.addEventListener('click', () => showPreset(preset, btn));
    presetsEl.appendChild(btn);
  });

  Object.keys(chipLabels).forEach(key => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'agent-chip';
    btn.dataset.category = key;
    btn.textContent = chipLabels[key];
    btn.addEventListener('click', () => showFact(key));
    chipsEl.appendChild(btn);
  });

  nextBtn.addEventListener('click', () => showFact(activeCategory));

  function openPanel() {
    widget.classList.add('open');
    orb.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    if (firstOpen) {
      firstOpen = false;
      showAnswer('Hi — I\'m your Player Guide. Ask a question below or browse facts by topic.');
    }
  }

  function closePanel() {
    widget.classList.remove('open');
    orb.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    orb.focus();
  }

  function togglePanel() {
    if (widget.classList.contains('open')) closePanel();
    else openPanel();
  }

  orb.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && widget.classList.contains('open')) closePanel();
  });

  document.addEventListener('click', e => {
    if (!widget.classList.contains('open')) return;
    if (!widget.contains(e.target)) closePanel();
  });

  panel.addEventListener('click', e => e.stopPropagation());

  window.showAgentGuide = function() {
    widget.classList.add('visible');
  };

  if (opts.autoShow) widget.classList.add('visible');
}
