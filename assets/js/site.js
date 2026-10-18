(function () {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const load = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const save = (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} };

  /* ---------- theme: auto, light, dark ---------- */
  const themeBtn = $('#themeBtn');
  let theme = load('theme') || 'auto';
  function effectiveTheme() {
    if (theme !== 'auto') return theme;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncGiscus() {
    const frame = $('iframe.giscus-frame');
    if (frame) frame.contentWindow.postMessage({ giscus: { setConfig: { theme: effectiveTheme() } } }, 'https://giscus.app');
  }
  function applyTheme() {
    if (theme === 'auto') delete root.dataset.theme; else root.dataset.theme = theme;
    if (themeBtn) themeBtn.textContent = '◐ ' + theme;
    syncGiscus();
  }
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const order = ['auto', 'light', 'dark'];
    theme = order[(order.indexOf(theme) + 1) % order.length];
    save('theme', theme === 'auto' ? null : theme);
    applyTheme();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncGiscus);
  /* giscus starts with the system theme: its first message says it is ready for a chosen one */
  const onGiscus = e => {
    if (e.origin !== 'https://giscus.app') return;
    removeEventListener('message', onGiscus);
    if (theme !== 'auto') syncGiscus();
  };
  addEventListener('message', onGiscus);
  applyTheme();

  /* ---------- old tag links: /tags/#claude-code -> /tags/claude-code/ ---------- */
  /* a hash such as #50% is not valid percent-encoding: decoding it must not stop the rest of the script */
  const hashId = (() => { try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return ''; } })();
  const oldTag = hashId && $('.tag-cloud li[id="' + CSS.escape(hashId) + '"] > a');
  if (oldTag) location.replace(oldTag.href);

  /* ---------- 404: show the missing path ---------- */
  const missing = $('#missingPath');
  if (missing) missing.textContent = location.pathname;

  /* ---------- code blocks: copy and callouts ---------- */
  let calloutBlocks = 0;
  $$('.code').forEach(fig => {
    const btn = $('.copy', fig);
    /* the visible code is the clean code: callout numbers are drawn by CSS, and the minifier keeps whitespace in <pre> */
    const src = $('pre code', fig);
    if (btn && src) btn.addEventListener('click', () => {
      const done = t => { btn.textContent = t; setTimeout(() => { btn.textContent = 'copy'; }, 1400); };
      /* only the code part of each line, so line numbers (linenos) are never copied */
      const lines = $$('.cl', fig);
      const text = (lines.length ? lines.map(l => l.textContent).join('') : src.textContent).replace(/\n$/, '');
      const select = () => {
        const r = document.createRange(); r.selectNodeContents(src);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r); done('selected');
      };
      /* the clipboard API only exists over HTTPS: elsewhere, select the code so it can be copied by hand */
      if (!navigator.clipboard) { select(); return; }
      navigator.clipboard.writeText(text).then(() => done('copied'), select);
    });
    const list = fig.nextElementSibling;
    if (!list || !list.classList.contains('callouts')) return;
    const items = $$(':scope > li', list);
    /* each badge in the code links to its explanation in the list below, which flashes on arrival */
    const block = ++calloutBlocks;
    items.forEach((li, i) => { li.id = `callout-${block}-${i + 1}`; });
    $$('.co', fig).forEach(co => {
      const li = items[co.dataset.n - 1];
      if (!li) return;
      const a = document.createElement('a');
      a.className = 'co';
      a.dataset.n = co.dataset.n;
      a.href = '#' + li.id;
      a.setAttribute('aria-label', 'Explanation ' + co.dataset.n);
      a.addEventListener('click', () => {
        li.classList.remove('flash');
        void li.offsetWidth;
        li.classList.add('flash');
      });
      co.replaceWith(a);
    });
    const link = (n, on) => {
      $$('.co[data-n="' + n + '"]', fig).forEach(el => el.classList.toggle('hl', on));
      if (items[n - 1]) items[n - 1].classList.toggle('hl', on);
    };
    items.forEach((li, i) => {
      li.addEventListener('mouseenter', () => link(i + 1, true));
      li.addEventListener('mouseleave', () => link(i + 1, false));
    });
    $$('.co', fig).forEach(co => {
      co.addEventListener('mouseenter', () => link(+co.dataset.n, true));
      co.addEventListener('mouseleave', () => link(+co.dataset.n, false));
    });
  });

  /* ---------- post: contents, status line, reading progress ---------- */
  const prose = $('#prose');
  const heads = prose ? $$('h2[id]', prose) : [];
  const label = h => h.textContent.replace(/^#+/, '').trim();
  const sheet = $('#sheet');
  const tocBtn = $('#sbToc');
  /* the contents are built by Hugo (layouts/_partials/toc.html); picking a section closes the sheet on narrow screens */
  if (heads.length) {
    $$('a', sheet).forEach(a => a.addEventListener('click', () => setSheet(false)));
  } else if (tocBtn) {
    tocBtn.hidden = true;
  }
  function setSheet(open) {
    if (!sheet) return;
    sheet.hidden = !open;
    if (tocBtn) tocBtn.setAttribute('aria-expanded', String(open));
  }
  function toggleContents() {
    if (!heads.length) return;
    if (matchMedia('(min-width: 1180px)').matches) $('#shell').classList.toggle('toc-off');
    else setSheet(sheet.hidden);
  }
  /* the status line button does what t does: the side pane on wide screens, the sheet on narrow ones */
  if (tocBtn) tocBtn.addEventListener('click', toggleContents);

  let current = -1;
  const sbSec = $('#sbSec');
  const sbPct = $('#sbPct');
  const tocLinks = $$('.toc a'), tocFills = $$('.toc .fill'), tocPcts = $$('.toc .pct');
  let lastIdx = null, lastPct = null, queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }
  function update() {
    const y = innerHeight * 0.28;
    let idx = -1;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < y) idx = i; });
    current = idx;
    const r = prose.getBoundingClientRect();
    const total = prose.offsetHeight - innerHeight * 0.6;
    const pct = Math.max(0, Math.min(100, Math.round((-r.top + innerHeight * 0.2) / Math.max(1, total) * 100)));
    if (pct !== lastPct) {
      lastPct = pct;
      if (sbPct) sbPct.textContent = pct + '%';
      tocFills.forEach(f => { f.style.width = pct + '%'; });
      tocPcts.forEach(p => { p.textContent = pct + '%'; });
    }
    if (idx !== lastIdx) {
      lastIdx = idx;
      if (sbSec) sbSec.textContent = idx >= 0 ? label(heads[idx]) : 'Introduction';
      tocLinks.forEach(a => { const i = +a.dataset.i; a.classList.toggle('on', i === idx); a.classList.toggle('read', i < idx); });
    }
  }
  if (prose) {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();
  }

  /* ---------- search: Pagefind index built after Hugo, loaded only on the search page ---------- */
  const searchInput = $('#searchInput');
  if (searchInput) {
    const status = $('#searchStatus');
    const list = $('#searchResults');
    let pagefind = null;
    const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    async function run() {
      const q = searchInput.value.trim();
      const url = new URL(location.href);
      if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
      if (!q) { list.innerHTML = ''; status.textContent = ''; return; }
      try { pagefind = pagefind || await import('/pagefind/pagefind.js'); }
      catch (e) { status.textContent = 'The search index is missing. Build it with the steps in the README.'; return; }
      /* drop the answer when the box changed while it was on its way */
      const stale = () => searchInput.value.trim() !== q;
      if (stale()) return;
      const search = await pagefind.debouncedSearch(q);
      if (search === null || stale()) return;
      const data = await Promise.all(search.results.slice(0, 20).map(r => r.data()));
      if (stale()) return;
      status.textContent = data.length ? data.length + ' post' + (data.length === 1 ? '' : 's') + ' match' + (data.length === 1 ? 'es' : '') : 'No post matches.';
      list.innerHTML = data.map(d => '<li class="row"><time datetime="' + esc(d.meta.date || '') + '">' + esc(d.meta.date || '') + '</time><div>' +
        '<a class="t" href="' + esc(d.url) + '">' + esc(d.meta.title || d.url) + '</a><p>' + d.excerpt + '</p></div></li>').join('');
    }
    searchInput.addEventListener('input', run);
    searchInput.closest('form').addEventListener('submit', e => { e.preventDefault(); run(); });
    searchInput.value = new URL(location.href).searchParams.get('q') || '';
    searchInput.focus();
    if (searchInput.value) run();
  }

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
    const t = e.target;
    if (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName)) return;
    if (e.key === 'Escape') { setSheet(false); return; }
    if (e.key === '/') { e.preventDefault(); if (searchInput) searchInput.focus(); else location.href = '/search/'; return; }
    if (!heads.length) return;
    if (e.key === 't') { toggleContents(); return; }
    /* ← and → move between sections, unless they would select text or scroll a code block or table sideways */
    if (e.shiftKey || t.closest('pre, .table-wrap')) return;
    if (e.key === 'ArrowRight' && current < heads.length - 1) { e.preventDefault(); heads[current + 1].scrollIntoView({ block: 'start' }); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (current > 0) heads[current - 1].scrollIntoView({ block: 'start' }); else scrollTo({ top: 0 }); }
  });
})();
