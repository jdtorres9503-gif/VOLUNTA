export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'volunta_theme';

let currentTheme: Theme = 'light';

try {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') {
    currentTheme = saved;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    currentTheme = 'dark';
  }
} catch {
  // Ignore
}

// Apply initially to html
if (typeof document !== 'undefined') {
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

type ThemeListener = (theme: Theme) => void;
const listeners: ThemeListener[] = [];

export const themeStore = {
  getTheme: (): Theme => currentTheme,
  setTheme: (theme: Theme) => {
    currentTheme = theme;
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
    listeners.forEach((fn) => fn(theme));
  },
  toggleTheme: () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    themeStore.setTheme(next);
  },
  subscribe: (fn: ThemeListener) => {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },
};
