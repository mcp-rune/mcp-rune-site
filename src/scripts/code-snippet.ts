// Wires every CodeSnippet on the page: tab clicks, language preference
// persistence (localStorage), broadcast across siblings, copy button.
// Loaded once per page via the docs layout.

const STORAGE_KEY = 'mcp-rune:lang';
type Lang = 'ts' | 'js';

function isLang(v: string | null): v is Lang {
  return v === 'ts' || v === 'js';
}

function setLang(snippets: NodeListOf<HTMLElement>, lang: Lang): void {
  for (const cs of snippets) {
    cs.dataset.active = lang;
    const ext = cs.querySelector<HTMLElement>('[data-cs-ext]');
    if (ext) ext.textContent = '.' + lang;
    cs.querySelectorAll<HTMLButtonElement>('[data-cs-tab]').forEach((btn) => {
      btn.setAttribute('aria-selected', btn.dataset.csTab === lang ? 'true' : 'false');
    });
  }
}

function init(): void {
  const snippets = document.querySelectorAll<HTMLElement>('[data-code-snippet]');
  if (snippets.length === 0) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (isLang(stored)) setLang(snippets, stored);

  for (const cs of snippets) {
    cs.querySelectorAll<HTMLButtonElement>('[data-cs-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.csTab;
        if (!isLang(next ?? null)) return;
        setLang(snippets, next as Lang);
        localStorage.setItem(STORAGE_KEY, next!);
      });
    });

    const copyBtn = cs.querySelector<HTMLButtonElement>('[data-cs-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const active = cs.dataset.active as Lang | undefined;
        const pane = cs.querySelector<HTMLElement>(`[data-cs-pane="${active ?? 'ts'}"]`);
        const text = pane?.innerText ?? '';
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = '✓ copied';
          copyBtn.classList.add('done');
          setTimeout(() => {
            copyBtn.textContent = 'copy';
            copyBtn.classList.remove('done');
          }, 1100);
        } catch {
          // clipboard rejected (insecure context, etc.) — fail silently
        }
      });
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
