const STORAGE_KEY = 'leonida-ledger-earned-v1';
const SPOILER_KEY = 'leonida-ledger-hide-spoilers-v1';
const trophyFile = await fetch('data/trophies.json').then((response) => {
  if (!response.ok) throw new Error('Trophy data could not be loaded.');
  return response.json();
});
const trophies = trophyFile.trophies;
const params = new URLSearchParams(location.search);
const grades = ['platinum', 'gold', 'silver', 'bronze'];
const icons = { platinum: '✦', gold: '◆', silver: '◇', bronze: '●' };
const earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
if (params.get('demo') === 'progress') {
  [2, 3, 8, 16, 18, 35, 44].forEach((id) => earned.add(trophies.find((t) => t.id === id).name));
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}
const ui = {
  rows: document.querySelector('#rows'), grade: document.querySelector('#grade'), category: document.querySelector('#category'),
  status: document.querySelector('#status'), missable: document.querySelector('#missable'), search: document.querySelector('#search'),
  spoilers: document.querySelector('#spoilers'),
};
const phasePlan = [
  { title: '01 / Story playthrough', note: 'Clear the chapters and keep an eye on character strands.', ids: [2,3,4,5,6,7,8,9,10,11,12,13,22,23,24,26,27,25,48] },
  { title: '02 / Side activities', note: 'Build activity progress while the map is still fresh.', ids: [16,17,18,19,20,21,29,33,34,36,38,39,40,41,43,45,46,47,49,51] },
  { title: '03 / Collectibles & exploration', note: 'Sweep regions, sets, landmarks, and discovery counters.', ids: [28,30,31,35,37,42,44,50,55] },
  { title: '04 / Cleanup & misc', note: 'Use the in-game tracker to close remaining long goals.', ids: [1,14,15,32,52,53,54] },
];
function safeTime(t) {
  const match = t.time.match(/([\d.]+)\s*[–-]?\s*([\d.]+)?\s*h/i);
  if (match) return Number(match[2] || match[1]);
  if (/story playthrough/i.test(t.time)) return 30;
  if (/unknown/i.test(t.time)) return 1;
  const minutes = t.time.match(/([\d.]+)\s*[–-]?\s*([\d.]+)?\s*min/i);
  return minutes ? Number(minutes[2] || minutes[1]) / 60 : 0;
}
function updateProgress() {
  const count = earned.size;
  const percent = Math.round(count / trophies.length * 100);
  document.querySelector('#earned-count').textContent = count;
  document.querySelector('#percent').textContent = `${percent}%`;
  document.querySelector('#progress-fill').style.width = `${percent}%`;
  const bar = document.querySelector('#progress-bar');
  bar.setAttribute('aria-valuenow', String(count));
  document.querySelector('#grade-counts').innerHTML = grades.map((grade) => {
    const done = trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    const total = trophies.filter((t) => t.grade === grade).length;
    return `<span class="grade-count ${grade}"><i>${icons[grade]}</i> ${done}/${total} ${grade}</span>`;
  }).join('');
  const open = trophies.filter((t) => !earned.has(t.name) && t.id !== 1 && t.id !== 14);
  const remaining = open.reduce((sum, t) => sum + safeTime(t), 0) + (open.some((t) => t.time === 'story playthrough') ? 35 : 0);
  document.querySelector('#remaining-time').textContent = `Estimated time remaining: ~${Math.round(remaining)} h`;
}
function renderPhases() {
  const host = document.querySelector('#phases');
  host.replaceChildren();
  for (const phase of phasePlan) {
    const items = phase.ids.map((id) => trophies.find((t) => t.id === id)).filter(Boolean);
    const done = items.filter((t) => earned.has(t.name)).length;
    const card = document.createElement('article');
    card.className = 'phase-card';
    const heading = document.createElement('div');
    heading.className = 'phase-top';
    heading.innerHTML = `<div><h3>${phase.title}</h3><p>${phase.note}</p></div><span class="phase-count">${done}/${items.length}</span>`;
    const track = document.createElement('div');
    track.className = 'mini-track';
    track.innerHTML = `<span style="width:${items.length ? done / items.length * 100 : 0}%"></span>`;
    const names = document.createElement('p');
    names.className = 'phase-trophies';
    names.textContent = items.map((t) => t.name).join(' · ');
    card.append(heading, track, names);
    host.append(card);
  }
}
function render() {
  const query = ui.search.value.trim().toLowerCase();
  const visible = trophies.filter((t) => {
    const content = `${t.name} ${t.description} ${t.guide} ${t.source} ${t.category}`.toLowerCase();
    return (ui.grade.value === 'all' || t.grade === ui.grade.value)
      && (ui.category.value === 'all' || t.category === ui.category.value)
      && (ui.status.value === 'all' || (ui.status.value === 'earned') === earned.has(t.name))
      && (ui.missable.value === 'all' || (ui.missable.value === 'yes') === t.missable)
      && (!query || content.includes(query));
  });
  ui.rows.replaceChildren();
  document.querySelector('#empty').hidden = visible.length > 0;
  document.querySelector('#result-count').textContent = `${visible.length} ${visible.length === 1 ? 'trophy' : 'trophies'}`;
  for (const t of visible) {
    const card = document.createElement('article');
    card.className = `trophy-card ${earned.has(t.name) ? 'is-earned' : ''}`;
    card.dataset.id = String(t.id);
    const summary = document.createElement('div');
    summary.className = 'trophy-summary';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.className = 'earned-check'; checkbox.checked = earned.has(t.name);
    checkbox.setAttribute('aria-label', `${earned.has(t.name) ? 'Unmark' : 'Mark'} ${t.name} earned`);
    checkbox.addEventListener('click', (event) => event.stopPropagation());
    checkbox.addEventListener('change', () => {
      checkbox.checked ? earned.add(t.name) : earned.delete(t.name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
      updateProgress(); renderPhases(); render();
    });
    const gradeIcon = document.createElement('span');
    gradeIcon.className = `grade-icon ${t.grade}`; gradeIcon.textContent = icons[t.grade]; gradeIcon.setAttribute('aria-label', `${t.grade} trophy`);
    const info = document.createElement('div'); info.className = 'trophy-info';
    const name = document.createElement('h3'); name.textContent = t.name;
    const desc = document.createElement('p'); desc.className = t.spoiler ? 'description spoiler-text' : 'description'; desc.textContent = t.description;
    if (ui.spoilers.checked && t.spoiler) desc.classList.add('blurred');
    info.append(name, desc);
    const badges = document.createElement('div'); badges.className = 'badges';
    badges.innerHTML = `<span class="badge category">${t.category}</span><span class="badge ${t.confidence}">${t.confidence === 'confirmed' ? '✓ Confirmed' : '◌ Inferred'}</span>${t.missable ? '<span class="badge missable">Missable</span>' : ''}`;
    const estimate = document.createElement('span'); estimate.className = 'estimate'; estimate.textContent = `${t.difficulty}/5 · ${t.time}`;
    const toggle = document.createElement('button'); toggle.className = 'expand-button'; toggle.type = 'button'; toggle.textContent = '＋'; toggle.setAttribute('aria-label', `Show guide for ${t.name}`);
    summary.append(checkbox, gradeIcon, info, badges, estimate, toggle);
    const detail = document.createElement('div'); detail.className = 'trophy-detail';
    const guideHeading = document.createElement('h4'); guideHeading.textContent = 'FIELD GUIDE';
    const guide = document.createElement('p'); guide.className = 'guide-copy'; guide.textContent = t.guide;
    if (ui.spoilers.checked && t.spoiler) guide.classList.add('blurred');
    const reveal = document.createElement('button'); reveal.className = 'reveal-button'; reveal.type = 'button'; reveal.textContent = 'Reveal story detail';
    reveal.hidden = !(ui.spoilers.checked && t.spoiler);
    reveal.addEventListener('click', () => { guide.classList.remove('blurred'); desc.classList.remove('blurred'); reveal.hidden = true; });
    const source = document.createElement('p'); source.className = 'source-line';
    source.innerHTML = `<span class="badge ${t.confidence}">${t.confidence === 'confirmed' ? '✓ Confirmed' : '◌ Inferred'}</span><span>Basis: ${escapeHtml(t.source)}</span>`;
    detail.append(guideHeading, guide, reveal, source);
    toggle.addEventListener('click', () => {
      const open = card.classList.toggle('open');
      toggle.textContent = open ? '−' : '＋';
      toggle.setAttribute('aria-expanded', String(open));
    });
    summary.addEventListener('click', (event) => { if (event.target !== checkbox) toggle.click(); });
    summary.tabIndex = 0;
    summary.setAttribute('role', 'button');
    summary.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle.click(); } });
    card.append(summary, detail); ui.rows.append(card);
  }
}
function escapeHtml(text) { return text.replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function setFilterFromParam(key, control) { const value = params.get(key); if (value && [...control.options].some((option) => option.value === value)) control.value = value; }
setFilterFromParam('grade', ui.grade);
setFilterFromParam('category', ui.category);
if (params.has('search')) ui.search.value = params.get('search');
ui.spoilers.checked = params.get('spoilers') === 'off' ? false : localStorage.getItem(SPOILER_KEY) !== 'false';
ui.spoilers.addEventListener('change', () => { localStorage.setItem(SPOILER_KEY, String(ui.spoilers.checked)); render(); });
[ui.grade, ui.category, ui.status, ui.missable].forEach((control) => control.addEventListener('change', render));
ui.search.addEventListener('input', render);
document.querySelector('#export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ version: 1, earned: [...earned] }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'leonida-ledger-progress.json'; link.click(); URL.revokeObjectURL(link.href);
});
document.querySelector('#import').addEventListener('change', async (event) => {
  const file = event.target.files[0]; if (!file) return;
  try {
    const value = JSON.parse(await file.text());
    const names = Array.isArray(value) ? value : value.earned;
    if (!Array.isArray(names) || names.some((name) => typeof name !== 'string')) throw new Error('Choose a progress JSON exported by this guide.');
    const validNames = new Set(trophies.map((t) => t.name));
    earned.clear(); names.filter((name) => validNames.has(name)).forEach((name) => earned.add(name));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned])); updateProgress(); renderPhases(); render();
  } catch (error) { alert(error.message || 'Progress file could not be read.'); }
  event.target.value = '';
});
document.body.classList.add(`stage-${params.get('view') === 'roadmap' ? 'roadmap' : params.has('trophy') ? 'detail' : (params.get('grade') || params.has('search')) ? 'filters' : 'default'}`);
updateProgress(); renderPhases(); render();
if (params.has('trophy')) {
  const target = document.querySelector(`.trophy-card[data-id="${CSS.escape(params.get('trophy'))}"]`);
  if (target) { target.classList.add('open', 'selected-detail'); target.querySelector('.expand-button').textContent = '−'; }
}
