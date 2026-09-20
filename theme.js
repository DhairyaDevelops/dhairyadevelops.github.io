// Runs before body rendering to avoid a wrong-theme flash.
// Only this non-sensitive preference is saved; project briefs never are.
(() => {
  const key = 'dhairya-portfolio-theme';
  const root = document.documentElement;
  const darkSheet = document.getElementById('dark-theme-sheet');
  const normalise = value => value === 'light' ? 'light' : 'dark';

  function apply(value) {
    const theme = normalise(value);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    darkSheet.media = theme === 'dark' ? 'all' : 'not all';
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0e1316' : '#fcfdfb';
    document.querySelector('meta[name="color-scheme"]').content = theme;
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
    return theme;
  }

  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Dark still works when storage is blocked. */ }
  apply(saved);

  function setupControls() {
    apply(root.dataset.theme);
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.addEventListener('click', () => {
        const theme = apply(button.dataset.themeChoice);
        let remembered = true;
        try { localStorage.setItem(key, theme); } catch { remembered = false; }
        const status = document.getElementById('theme-status');
        if (status) status.textContent = `${theme === 'dark' ? 'Dark' : 'Light'} theme active.${remembered ? ' Preference saved on this device.' : ' This browser cannot remember the preference.'}`;
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupControls, {once:true});
  else setupControls();

  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
})();
