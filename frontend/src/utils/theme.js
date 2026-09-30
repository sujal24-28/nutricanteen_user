import { StatusBar, Style } from '@capacitor/status-bar';

export const THEME_STORAGE_KEY = 'canteen_theme';

export const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch (e) {}
  return document.documentElement.classList.contains('dark');
};

export const applyAppTheme = async (isDark) => {
  const root = document.documentElement;
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  if (isDark) {
    root.classList.add('dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } catch (e) {}
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#0C140E');
    }
  } else {
    root.classList.remove('dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    } catch (e) {}
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#F6F9F7');
    }
  }

  // Synchronize Native Android/iOS Status Bar appearance
  try {
    if (isDark) {
      // Dark mode: Dark background, light/white status bar icons
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0C140E' });
    } else {
      // Light mode: Light background (#F6F9F7), dark status bar icons (time, battery, etc.)
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#F6F9F7' });
    }
  } catch (err) {
    // Graceful fallback for desktop browser where native StatusBar plugin is absent
  }
};
