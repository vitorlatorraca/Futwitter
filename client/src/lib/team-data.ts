// Team logos mapping - using local SVG files
// Place logo files in: client/public/assets/teams/

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

// Local path prefix for team logos
const LOGO_PATH = '/assets/teams';

export const TEAMS_DATA: TeamData[] = [
  { 
    id: 'flamengo', 
    name: 'Flamengo', 
    shortName: 'FLA', 
    logoUrl: `${LOGO_PATH}/flamengo.svg`, 
    primaryColor: '#E31837', 
    secondaryColor: '#000000' 
  },
  { 
    id: 'palmeiras', 
    name: 'Palmeiras', 
    shortName: 'PAL', 
    logoUrl: `${LOGO_PATH}/palmeiras.svg`, 
    primaryColor: '#006437', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'corinthians', 
    name: 'Corinthians', 
    shortName: 'COR', 
    logoUrl: `${LOGO_PATH}/corinthians.svg`, 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'sao-paulo', 
    name: 'São Paulo', 
    shortName: 'SAO', 
    logoUrl: `${LOGO_PATH}/sao-paulo.svg`, 
    primaryColor: '#EC1C24', 
    secondaryColor: '#000000' 
  },
  { 
    id: 'gremio', 
    name: 'Grêmio', 
    shortName: 'GRE', 
    logoUrl: `${LOGO_PATH}/gremio.svg`, 
    primaryColor: '#0099CC', 
    secondaryColor: '#000000' 
  },
  { 
    id: 'internacional', 
    name: 'Internacional', 
    shortName: 'INT', 
    logoUrl: `${LOGO_PATH}/internacional.svg`, 
    primaryColor: '#D81920', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'atletico-mineiro', 
    name: 'Atlético Mineiro', 
    shortName: 'CAM', 
    logoUrl: `${LOGO_PATH}/atletico-mineiro.svg`, 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'fluminense', 
    name: 'Fluminense', 
    shortName: 'FLU', 
    logoUrl: `${LOGO_PATH}/fluminense.svg`, 
    primaryColor: '#7A1437', 
    secondaryColor: '#006241' 
  },
  { 
    id: 'botafogo', 
    name: 'Botafogo', 
    shortName: 'BOT', 
    logoUrl: `${LOGO_PATH}/botafogo.svg`, 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'santos', 
    name: 'Santos', 
    shortName: 'SAN', 
    logoUrl: `${LOGO_PATH}/santos.svg`, 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'vasco', 
    name: 'Vasco da Gama', 
    shortName: 'VAS', 
    logoUrl: `${LOGO_PATH}/vasco.svg`, 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'cruzeiro', 
    name: 'Cruzeiro', 
    shortName: 'CRU', 
    logoUrl: `${LOGO_PATH}/cruzeiro.svg`, 
    primaryColor: '#003A70', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'athletico-paranaense', 
    name: 'Athletico Paranaense', 
    shortName: 'CAP', 
    logoUrl: `${LOGO_PATH}/athletico-paranaense.svg`, 
    primaryColor: '#E30613', 
    secondaryColor: '#000000' 
  },
  { 
    id: 'bahia', 
    name: 'Bahia', 
    shortName: 'BAH', 
    logoUrl: `${LOGO_PATH}/bahia.svg`, 
    primaryColor: '#005CA9', 
    secondaryColor: '#E30613' 
  },
  { 
    id: 'fortaleza', 
    name: 'Fortaleza', 
    shortName: 'FOR', 
    logoUrl: `${LOGO_PATH}/fortaleza.svg`, 
    primaryColor: '#E30613', 
    secondaryColor: '#003A70' 
  },
  { 
    id: 'bragantino', 
    name: 'Bragantino', 
    shortName: 'RBB', 
    logoUrl: `${LOGO_PATH}/bragantino.svg`, 
    primaryColor: '#FFFFFF', 
    secondaryColor: '#E30613' 
  },
  { 
    id: 'cuiaba', 
    name: 'Cuiabá', 
    shortName: 'CUI', 
    logoUrl: `${LOGO_PATH}/cuiaba.svg`, 
    primaryColor: '#FFD700', 
    secondaryColor: '#006241' 
  },
  { 
    id: 'goias', 
    name: 'Goiás', 
    shortName: 'GOI', 
    logoUrl: `${LOGO_PATH}/goias.svg`, 
    primaryColor: '#006241', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'coritiba', 
    name: 'Coritiba', 
    shortName: 'CFC', 
    logoUrl: `${LOGO_PATH}/coritiba.svg`, 
    primaryColor: '#006241', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'america-mineiro', 
    name: 'América Mineiro', 
    shortName: 'AME', 
    logoUrl: `${LOGO_PATH}/america-mineiro.svg`, 
    primaryColor: '#006241', 
    secondaryColor: '#000000' 
  },
];
