/**
 * Theme Context
 * 
 * Provides team-based theming throughout the app.
 * Automatically detects user's team and applies the corresponding color palette.
 */

import { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTeamTheme, getThemeCSSVariables, type TeamTheme } from '@/lib/theme-by-team';

interface ThemeContextType {
  theme: TeamTheme;
  teamId: string | null;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const teamId = user?.teamId || null;
  const theme = useMemo(() => getTeamTheme(teamId), [teamId]);
  const cssVariables = useMemo(() => getThemeCSSVariables(theme), [theme]);

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Cleanup on unmount
    return () => {
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVariables]);

  return (
    <ThemeContext.Provider value={{ theme, teamId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

