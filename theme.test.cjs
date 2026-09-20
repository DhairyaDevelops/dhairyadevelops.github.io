// Dependency-free state tests, not browser rendering or contrast certification.
// Run: node --test theme.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'theme.js'), 'utf8');
const THEME_KEY = 'dhairya-portfolio-theme';

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, callback, options = {}) {
      const entries = listeners.get(type) || [];
      entries.push({ callback, once: Boolean(options.once) });
      listeners.set(type, entries);
    },
    dispatch(type, details = {}) {
      for (const entry of [...(listeners.get(type) || [])]) {
        if (entry.once) listeners.set(type, listeners.get(type).filter(item => item !== entry));
        entry.callback({ type, ...details });
      }
    },
    listenerCount(type) {
      return (listeners.get(type) || []).length;
    },
  };
}

function harness({ saved = null, readyState = 'complete', blockRead = false, blockWrite = false, blockStorageGetter = false, statusPresent = true } = {}) {
  const root = { dataset: { theme: 'dark' }, style: {} };
  const sheet = { media: '' };
  const themeMeta = { content: '#0e1316' };
  const schemeMeta = { content: 'dark' };
  const status = { textContent: '' };
  const brief = { value: 'A fictional draft that must survive theme changes.', hidden: false };
  const writes = [];
  const reads = [];
  const memory = new Map(saved === null ? [] : [[THEME_KEY, saved]]);
  const document = { ...eventTarget(), documentElement: root, readyState, activeElement: brief };
  let controlsPresent = readyState !== 'loading';
  let focusCalls = 0;
  const buttons = ['light', 'dark'].map(choice => {
    const attributes = new Map([['aria-pressed', choice === 'dark' ? 'true' : 'false']]);
    return {
      ...eventTarget(),
      dataset: { themeChoice: choice },
      setAttribute(name, value) { attributes.set(name, String(value)); },
      getAttribute(name) { return attributes.get(name) ?? null; },
      focus() { focusCalls++; document.activeElement = this; },
    };
  });
  document.getElementById = id => {
    if (id === 'dark-theme-sheet') return sheet;
    if (id === 'theme-status') return statusPresent && controlsPresent ? status : null;
    if (id === 'brief-output') return brief;
    return null;
  };
  document.querySelector = selector => {
    if (selector === 'meta[name="theme-color"]') return themeMeta;
    if (selector === 'meta[name="color-scheme"]') return schemeMeta;
    return null;
  };
  document.querySelectorAll = selector => selector === '[data-theme-choice]' && controlsPresent ? buttons : [];
  const storage = {
    getItem(key) {
      reads.push(key);
      if (blockRead) throw new Error('Storage reads blocked for this test.');
      return memory.get(key) ?? null;
    },
    setItem(key, value) {
      if (blockWrite) throw new Error('Storage writes blocked for this test.');
      writes.push([key, value]);
      memory.set(key, value);
    },
  };
  const window = eventTarget();
  const sandbox = { document, window };
  Object.defineProperty(sandbox, 'localStorage', {
    get() {
      if (blockStorageGetter) throw new Error('Access to storage blocked for this test.');
      return storage;
    },
  });
  vm.runInNewContext(source, sandbox, { filename: 'theme.js', timeout: 1000 });
  return {
    root, sheet, themeMeta, schemeMeta, status, brief, buttons, document, window, writes, reads, memory,
    get focusCalls() { return focusCalls; },
    activate(choice) {
      const button = buttons.find(item => item.dataset.themeChoice === choice);
      assert.ok(button, `Unknown test button: ${choice}`);
      // Native button activation focuses the control before its click handler.
      document.activeElement = button;
      button.dispatch('click');
      return button;
    },
    finishLoading() {
      controlsPresent = true;
      document.readyState = 'interactive';
      document.dispatch('DOMContentLoaded');
    },
    storageEvent(key, newValue) { window.dispatch('storage', { key, newValue }); },
  };
}

function assertTheme(view, expected) {
  assert.equal(view.root.dataset.theme, expected);
  assert.equal(view.root.style.colorScheme, expected);
  assert.equal(view.sheet.media, expected === 'dark' ? 'all' : 'not all');
  assert.equal(view.themeMeta.content, expected === 'dark' ? '#0e1316' : '#fcfdfb');
  assert.equal(view.schemeMeta.content, expected);
  for (const button of view.buttons) {
    assert.equal(button.getAttribute('aria-pressed'), String(button.dataset.themeChoice === expected));
  }
  assert.equal(view.buttons.filter(button => button.getAttribute('aria-pressed') === 'true').length, 1);
}

test('missing saved preference defaults to dark without storing anything', () => {
  const view = harness();
  assertTheme(view, 'dark');
  assert.deepEqual(view.reads, [THEME_KEY]);
  assert.deepEqual(view.writes, []);
});

test('invalid saved values fall back to dark', () => {
  for (const saved of ['', 'LIGHT', 'light ', 'system', '__proto__', '<script>']) {
    assertTheme(harness({ saved }), 'dark');
  }
});

test('saved light synchronizes root stylesheet metadata and pressed state', () => {
  const view = harness({ saved: 'light' });
  assertTheme(view, 'light');
  assert.deepEqual(view.writes, []);
});

test('both controls update the theme and persist only the theme preference', () => {
  const view = harness();
  view.activate('light');
  assertTheme(view, 'light');
  assert.match(view.status.textContent, /Light theme active.*Preference saved/);
  view.activate('dark');
  assertTheme(view, 'dark');
  assert.match(view.status.textContent, /Dark theme active.*Preference saved/);
  assert.deepEqual(view.writes, [[THEME_KEY, 'light'], [THEME_KEY, 'dark']]);
  assert.equal(view.memory.get(THEME_KEY), 'dark');
});

test('blocked storage reads retain a working dark default and usable controls', () => {
  const view = harness({ saved: 'light', blockRead: true });
  assertTheme(view, 'dark');
  view.activate('light');
  assertTheme(view, 'light');
  assert.deepEqual(view.writes, [[THEME_KEY, 'light']]);
});

test('blocked storage writes do not prevent switching or falsely claim persistence', () => {
  const view = harness({ blockWrite: true });
  view.activate('light');
  assertTheme(view, 'light');
  assert.match(view.status.textContent, /cannot remember the preference/);
  assert.doesNotMatch(view.status.textContent, /Preference saved/);
  assert.deepEqual(view.writes, []);
});

test('a throwing storage getter is caught during initialization and activation', () => {
  const view = harness({ blockStorageGetter: true });
  assertTheme(view, 'dark');
  assert.doesNotThrow(() => view.activate('light'));
  assertTheme(view, 'light');
  assert.match(view.status.textContent, /cannot remember the preference/);
});

test('cross-tab changes synchronize without writing back or moving focus', () => {
  const view = harness();
  const originalFocus = view.document.activeElement;
  view.storageEvent(THEME_KEY, 'light');
  assertTheme(view, 'light');
  view.storageEvent(THEME_KEY, 'dark');
  assertTheme(view, 'dark');
  assert.deepEqual(view.writes, []);
  assert.equal(view.document.activeElement, originalFocus);
  assert.equal(view.focusCalls, 0);
});

test('cross-tab removal clearing and invalid values restore the dark default', () => {
  for (const [key, value] of [[THEME_KEY, null], [null, null], [THEME_KEY, 'invalid']]) {
    const view = harness({ saved: 'light' });
    view.storageEvent(key, value);
    assertTheme(view, 'dark');
    assert.deepEqual(view.writes, []);
  }
});

test('storage events for unrelated keys do not change the theme', () => {
  const view = harness({ saved: 'light' });
  view.storageEvent('unrelated-app-key', 'dark');
  assertTheme(view, 'light');
  assert.deepEqual(view.writes, []);
});

test('theme changes preserve activated button focus and existing draft state', () => {
  const view = harness();
  const originalDraft = { ...view.brief };
  const lightButton = view.activate('light');
  assert.equal(view.document.activeElement, lightButton);
  assert.equal(view.focusCalls, 0);
  assert.deepEqual(view.brief, originalDraft);
});

test('head execution applies saved theme before controls exist then sets them up once', () => {
  const view = harness({ saved: 'light', readyState: 'loading' });
  assert.equal(view.root.dataset.theme, 'light');
  assert.equal(view.sheet.media, 'not all');
  assert.equal(view.themeMeta.content, '#fcfdfb');
  assert.equal(view.document.listenerCount('DOMContentLoaded'), 1);
  assert.ok(view.buttons.every(button => button.listenerCount('click') === 0));
  view.finishLoading();
  assertTheme(view, 'light');
  assert.ok(view.buttons.every(button => button.listenerCount('click') === 1));
  assert.equal(view.document.listenerCount('DOMContentLoaded'), 0);
  view.document.dispatch('DOMContentLoaded');
  view.activate('dark');
  assert.deepEqual(view.writes, [[THEME_KEY, 'dark']]);
});

test('a cross-tab change during loading survives deferred control setup', () => {
  const view = harness({ readyState: 'loading' });
  view.storageEvent(THEME_KEY, 'light');
  view.finishLoading();
  assertTheme(view, 'light');
  assert.deepEqual(view.writes, []);
});

test('controls also initialize for interactive documents and tolerate a missing status', () => {
  const view = harness({ readyState: 'interactive', statusPresent: false });
  assert.equal(view.document.listenerCount('DOMContentLoaded'), 0);
  assert.doesNotThrow(() => view.activate('light'));
  assertTheme(view, 'light');
});
