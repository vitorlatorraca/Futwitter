/**
 * Team Theme System
 * 
 * Dynamic color palettes based on Brazilian football teams.
 * Each team has primary, secondary, accent, and neon colors.
 */

export interface TeamTheme {
  id: string;
  name: string;
  colors: {
    primary: string;       // Main team color
    secondary: string;     // Secondary color
    accent: string;        // Accent/highlight color
    neon: string;          // Neon glow color for effects
    text: string;          // Text color on primary bg
    textMuted: string;     // Muted text
    background: string;    // Background color
    backgroundAlt: string; // Alternative background
    border: string;        // Border color
  };
}

// Default neutral brutalist theme (black & white)
export const DEFAULT_THEME: TeamTheme = {
  id: 'default',
  name: 'Neutral',
  colors: {
    primary: '#000000',
    secondary: '#1a1a1a',
    accent: '#ffffff',
    neon: '#ffffff',
    text: '#ffffff',
    textMuted: '#888888',
    background: '#0a0a0a',
    backgroundAlt: '#111111',
    border: '#333333',
  },
};

// Brazilian teams color palettes (2025 official colors)
export const TEAM_THEMES: Record<string, TeamTheme> = {
  'flamengo': {
    id: 'flamengo',
    name: 'Flamengo',
    colors: {
      primary: '#D20614',
      secondary: '#000000',
      accent: '#FFD700',
      neon: '#FF3333',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#1a0000',
      border: '#D20614',
    },
  },
  'palmeiras': {
    id: 'palmeiras',
    name: 'Palmeiras',
    colors: {
      primary: '#006437',
      secondary: '#00A84F',
      accent: '#FFD700',
      neon: '#00FF7F',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#001a0d',
      border: '#006437',
    },
  },
  'corinthians': {
    id: 'corinthians',
    name: 'Corinthians',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#ffffff',
      neon: '#FF0000',
      text: '#ffffff',
      textMuted: '#999999',
      background: '#0a0a0a',
      backgroundAlt: '#111111',
      border: '#ffffff',
    },
  },
  'sao-paulo': {
    id: 'sao-paulo',
    name: 'São Paulo',
    colors: {
      primary: '#EC1C24',
      secondary: '#000000',
      accent: '#ffffff',
      neon: '#FF69B4',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#1a0000',
      border: '#EC1C24',
    },
  },
  'gremio': {
    id: 'gremio',
    name: 'Grêmio',
    colors: {
      primary: '#0047AB',
      secondary: '#000000',
      accent: '#ffffff',
      neon: '#00FFFF',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#000a1a',
      border: '#0047AB',
    },
  },
  'internacional': {
    id: 'internacional',
    name: 'Internacional',
    colors: {
      primary: '#D81920',
      secondary: '#ffffff',
      accent: '#FFD700',
      neon: '#FF4444',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#1a0000',
      border: '#D81920',
    },
  },
  'atletico-mineiro': {
    id: 'atletico-mineiro',
    name: 'Atlético Mineiro',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#ffffff',
      neon: '#FFD700',
      text: '#ffffff',
      textMuted: '#999999',
      background: '#0a0a0a',
      backgroundAlt: '#111111',
      border: '#ffffff',
    },
  },
  'fluminense': {
    id: 'fluminense',
    name: 'Fluminense',
    colors: {
      primary: '#7A1437',
      secondary: '#006241',
      accent: '#ffffff',
      neon: '#FF1493',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#1a0a10',
      border: '#7A1437',
    },
  },
  'botafogo': {
    id: 'botafogo',
    name: 'Botafogo',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#ffffff',
      neon: '#FFD700',
      text: '#ffffff',
      textMuted: '#999999',
      background: '#0a0a0a',
      backgroundAlt: '#111111',
      border: '#ffffff',
    },
  },
  'santos': {
    id: 'santos',
    name: 'Santos',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#ffffff',
      neon: '#C0C0C0',
      text: '#ffffff',
      textMuted: '#999999',
      background: '#0a0a0a',
      backgroundAlt: '#111111',
      border: '#ffffff',
    },
  },
  'vasco': {
    id: 'vasco',
    name: 'Vasco da Gama',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#ffffff',
      neon: '#FF0000',
      text: '#ffffff',
      textMuted: '#999999',
      background: '#0a0a0a',
      backgroundAlt: '#111111',
      border: '#ffffff',
    },
  },
  'cruzeiro': {
    id: 'cruzeiro',
    name: 'Cruzeiro',
    colors: {
      primary: '#003A70',
      secondary: '#000000',
      accent: '#ffffff',
      neon: '#1E90FF',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#000a1a',
      border: '#003A70',
    },
  },
  'athletico-paranaense': {
    id: 'athletico-paranaense',
    name: 'Athletico Paranaense',
    colors: {
      primary: '#E30613',
      secondary: '#000000',
      accent: '#ffffff',
      neon: '#FF3333',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#1a0000',
      border: '#E30613',
    },
  },
  'bahia': {
    id: 'bahia',
    name: 'Bahia',
    colors: {
      primary: '#005CA9',
      secondary: '#E30613',
      accent: '#ffffff',
      neon: '#00BFFF',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#000a1a',
      border: '#005CA9',
    },
  },
  'fortaleza': {
    id: 'fortaleza',
    name: 'Fortaleza',
    colors: {
      primary: '#E30613',
      secondary: '#003A70',
      accent: '#ffffff',
      neon: '#FF4444',
      text: '#ffffff',
      textMuted: '#cccccc',
      background: '#0a0a0a',
      backgroundAlt: '#1a0000',
      border: '#E30613',
    },
  },
};

/**
 * Get theme by team ID
 */
export function getTeamTheme(teamId: string | null | undefined): TeamTheme {
  if (!teamId) return DEFAULT_THEME;
  return TEAM_THEMES[teamId] || DEFAULT_THEME;
}

/**
 * Generate CSS custom properties from theme
 */
export function getThemeCSSVariables(theme: TeamTheme): Record<string, string> {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-neon': theme.colors.neon,
    '--theme-text': theme.colors.text,
    '--theme-text-muted': theme.colors.textMuted,
    '--theme-background': theme.colors.background,
    '--theme-background-alt': theme.colors.backgroundAlt,
    '--theme-border': theme.colors.border,
  };
}

