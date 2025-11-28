// src/components/context/ThemeContext.tsx
import { createContext, useContext, useState, FC, ReactNode, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Gets the initial theme from localStorage or system preference.
 */
const getInitialTheme = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    // 1. Check for a saved preference in localStorage
    const storedPrefs = window.localStorage.getItem('color-theme');
    if (typeof storedPrefs === 'string') {
      return storedPrefs === 'dark';
    }

    // 2. If no preference, check the user's OS preference
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return true;
    }
  }
  // 3. Default to dark mode if all else fails
  return true;
};

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Use the function to set the initial state
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  // This effect hook syncs the React state with the DOM and localStorage
  useEffect(() => {
    const root = document.documentElement; // This is the <html> tag

    if (isDarkMode) {
      root.classList.add('dark');
      window.localStorage.setItem('color-theme', 'dark');
    } else {
      root.classList.remove('dark');
      window.localStorage.setItem('color-theme', 'light');
    }
  }, [isDarkMode]);

  // This function just needs to toggle the state; the effect will do the rest.
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};