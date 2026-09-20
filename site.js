import { offers, qaCases, getOffer, scoreExample, filterIssues, createBrief } from './services.mjs';

const menu = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');

function closeMenu(restoreFocus = false) {
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.querySelector('span').textContent = '+';
  if (restoreFocus) menu.focus();
}

menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('span').textContent = open ? '−' : '+';
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (!navigation.contains(event.target) && !menu.contains(event.target)) closeMenu();
});
navigation.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  closeMenu();
  const href = link.getAttribute('href');
  if (href?.startsWith('#')) {
    const target = document.querySelector(href);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());

const byId = (id) => document.getElementById(id);
let selectedService = 'qa';
let responseVersion = 'draft';
let clipboardAttempt = 0;
const form = byId('brief-form');

function invalidateBrief() {
  clipboardAttempt++;
  byId('brief-result').hidden = true;
  byId('brief-output').value = '';
  byId('brief-status').textContent = '';
}

function selectService(key) {
  selectedService = Object.hasOwn(offers, key) ? key : 'qa';
  const offer = getOffer(selectedService);
  document.querySelectorAll('[data-service]').forEach(button => {
    const selected = button.dataset.service === selectedService;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('selected', selected);
  });
  byId('offer-title').textContent = offer.title;
  byId('offer-problem').textContent = offer.problem;
  byId('offer-outputs').replaceChildren(...offer.output.map(item => {
    const li = document.createElement('li'); li.textContent = item; return li;
  }));
  byId('offer-inputs').textContent = offer.inputs;
  byId('offer-boundary').textContent = offer.boundary;
  byId('offer-gig').href = offer.gig;
  byId('brief-gig').href = offer.gig;
  byId('offer-proof').href = offer.proof;
  byId('offer-proof').textContent = offer.proofLabel + ' ↗';
  byId('brief-service').textContent = offer.name;
  byId('brief-context').placeholder = {
    qa: 'For example: Review our support bot against a public refund policy.',
    web: 'For example: Build one workshop page using our approved copy and images.',
    seo: 'For example: Review the public service pages on our small business site.'
  }[selectedService];
  byId('brief-scope').replaceChildren(...offer.scope.map(label => {
    const option = document.createElement('option'); option.textContent = label; return option;
  }));
  for (const type of Object.keys(offers)) byId('sample-' + type).hidden = type !== selectedService;
  byId('offer-announcement').textContent = offer.name + ' selected. Deliverables, sample and brief options updated.';
  invalidateBrief();
}

function renderReview() {
  const caseKey = byId('qa-scenario').value;
  const reviewCase = Object.hasOwn(qaCases, caseKey) ? qaCases[caseKey] : qaCases.refund;
  const example = reviewCase[responseVersion];
  const result = scoreExample(example);
  byId('qa-reference').textContent = reviewCase.reference;
  byId('qa-prompt').textContent = 'User asks: ' + reviewCase.prompt;
  byId('qa-response').textContent = example.response;
  byId('qa-score').textContent = result.score + ' / 5';
  document.querySelector('.rubric-note').textContent = `Authored scores: accuracy ${example.scores[0]}/5 (50%) · instruction adherence ${example.scores[1]}/5 (30%) · clarity ${example.scores[2]}/5 (20%). A critical failure overrides the average.`;
  byId('qa-flag').textContent = example.critical ? 'Flagged' : 'Not flagged';
  byId('qa-verdict').textContent = result.verdict;
  byId('qa-verdict').classList.toggle('meets', !example.critical);
  byId('qa-finding').textContent = example.finding;
  byId('qa-action').textContent = 'Next step: ' + example.action;
  document.querySelectorAll('[data-version]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.version === responseVersion)));
}

function renderIssues() {
  const issues = filterIssues(byId('seo-priority').value);
  byId('seo-count').textContent = `${issues.length} illustrative ${issues.length === 1 ? 'finding' : 'findings'}`;
  byId('seo-issues').replaceChildren(...issues.map(issue => {
    const details = document.createElement('details');
    details.className = 'issue-row';
    const summary = document.createElement('summary');
    const priority = document.createElement('span'); priority.className = 'issue-priority'; priority.textContent = issue.priority;
    const page = document.createElement('span'); page.textContent = issue.id + ' · ' + issue.page;
    summary.append(priority, page);
    const content = document.createElement('div');
    for (const [label, value] of [['Evidence', issue.evidence], ['Recommendation', issue.action], ['How to verify', issue.verify]]) {
      const p = document.createElement('p'); const strong = document.createElement('strong');
      strong.textContent = label + ': '; p.append(strong, document.createTextNode(value)); content.append(p);
    }
    details.append(summary, content); return details;
  }));
}

document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => selectService(button.dataset.service)));
document.querySelectorAll('[data-version]').forEach(button => button.addEventListener('click', () => { responseVersion = button.dataset.version; renderReview(); }));
byId('qa-scenario').addEventListener('change', () => { responseVersion = 'draft'; renderReview(); });
document.querySelectorAll('[data-web-view]').forEach(button => button.addEventListener('click', () => {
  const mobile = button.dataset.webView === 'mobile';
  const image = byId('website-capture');
  image.src = mobile ? './fieldnote-mobile.png' : './fieldnote.png';
  image.alt = `${mobile ? 'Mobile' : 'Desktop'} screenshot of the Fieldnote Studio portfolio demo`;
  image.classList.toggle('mobile-capture', mobile);
  // The container reserves space while the genuine screenshot loads.
  image.removeAttribute('height');
  document.querySelectorAll('[data-web-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
byId('seo-priority').addEventListener('change', renderIssues);
form.addEventListener('input', invalidateBrief);
form.addEventListener('change', invalidateBrief);
form.addEventListener('submit', event => {
  event.preventDefault();
  byId('brief-output').value = createBrief({service:selectedService,scope:byId('brief-scope').value,timing:byId('brief-timing').value,context:byId('brief-context').value});
  byId('brief-result').hidden = false;
  byId('brief-status').textContent = 'Draft ready. Nothing has been sent. Review it before sharing.';
  byId('brief-output').focus({preventScroll:true});
});
form.addEventListener('reset', () => {
  invalidateBrief();
  // Rebuild dynamic options after the browser resets form controls.
  queueMicrotask(() => {
    byId('brief-scope').selectedIndex = 0;
    byId('brief-status').textContent = 'Draft cleared. Nothing was sent.';
  });
});
byId('copy-brief').addEventListener('click', async () => {
  const value = byId('brief-output').value;
  if (!value) return;
  const attempt = ++clipboardAttempt;
  try {
    await navigator.clipboard.writeText(value);
    if (attempt === clipboardAttempt) byId('brief-status').textContent = 'Copied to your clipboard. Paste it into your own conversation when ready.';
  } catch {
    if (attempt !== clipboardAttempt) return;
    byId('brief-output').focus(); byId('brief-output').select();
    byId('brief-status').textContent = 'Automatic copy is unavailable. The draft is selected; copy it manually or download it.';
  }
});
byId('download-brief').addEventListener('click', () => {
  const value = byId('brief-output').value;
  if (!value) return;
  const url = URL.createObjectURL(new Blob([value], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href=url; link.download='project-enquiry.txt';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  byId('brief-status').textContent = 'Download requested. If your browser blocks it, copy the draft instead.';
});
selectService('qa'); renderReview(); renderIssues();
