export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'quickpay_theme_mode';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  // Default to dark mode for high-contrast emerald & gold aesthetic
  return 'dark';
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  if (theme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent('quickpay_theme_changed', { detail: { theme } }));
}

export function toggleTheme(): ThemeMode {
  const current = getStoredTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

// Auto-initialize theme on script evaluation
if (typeof window !== 'undefined') {
  const initial = getStoredTheme();
  applyTheme(initial);
}
