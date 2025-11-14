// Team logos mapping - using real team logos from CDN
// Using logodownload.org as a reliable source for team logos

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export const TEAMS_DATA: TeamData[] = [
  { 
    id: 'flamengo', 
    name: 'Flamengo', 
    shortName: 'FLA', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/flamengo-logo-escudo-1.png', 
    primaryColor: '#E31837', 
    secondaryColor: '#000000' 
  },
  { 
    id: 'palmeiras', 
    name: 'Palmeiras', 
    shortName: 'PAL', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/palmeiras-logo-escudo-1.png', 
    primaryColor: '#006437', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'corinthians', 
    name: 'Corinthians', 
    shortName: 'COR', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/corinthians-logo-escudo-1.png', 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'sao-paulo', 
    name: 'São Paulo', 
    shortName: 'SAO', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/sao-paulo-logo-escudo-1.png', 
    primaryColor: '#EC1C24', 
    secondaryColor: '#000000' 
  },
  { 
    id: 'gremio', 
    name: 'Grêmio', 
    shortName: 'GRE', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/gremio-logo-escudo-1.png', 
    primaryColor: '#0099CC', 
    secondaryColor: '#000000' 
  },
  { 
    id: 'internacional', 
    name: 'Internacional', 
    shortName: 'INT', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/internacional-logo-escudo-1.png', 
    primaryColor: '#D81920', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'atletico-mineiro', 
    name: 'Atlético Mineiro', 
    shortName: 'CAM', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/atletico-mineiro-logo-escudo-1.png', 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'fluminense', 
    name: 'Fluminense', 
    shortName: 'FLU', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/fluminense-logo-escudo-1.png', 
    primaryColor: '#7A1437', 
    secondaryColor: '#006241' 
  },
  { 
    id: 'botafogo', 
    name: 'Botafogo', 
    shortName: 'BOT', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/botafogo-logo-escudo-1.png', 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'santos', 
    name: 'Santos', 
    shortName: 'SAN', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/santos-logo-escudo-1.png', 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'vasco-da-gama', 
    name: 'Vasco da Gama', 
    shortName: 'VAS', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/vasco-da-gama-logo-escudo-1.png', 
    primaryColor: '#000000', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'cruzeiro', 
    name: 'Cruzeiro', 
    shortName: 'CRU', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/cruzeiro-logo-escudo-1.png', 
    primaryColor: '#003A70', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'athletico-paranaense', 
    name: 'Athletico Paranaense', 
    shortName: 'CAP', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/athletico-paranaense-logo-escudo-1.png', 
    primaryColor: '#E30613', 
    secondaryColor: '#000000' 
  },
  { 
    id: 'bahia', 
    name: 'Bahia', 
    shortName: 'BAH', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/bahia-logo-escudo-1.png', 
    primaryColor: '#005CA9', 
    secondaryColor: '#E30613' 
  },
  { 
    id: 'fortaleza', 
    name: 'Fortaleza', 
    shortName: 'FOR', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/fortaleza-logo-escudo-1.png', 
    primaryColor: '#E30613', 
    secondaryColor: '#003A70' 
  },
  { 
    id: 'bragantino', 
    name: 'Bragantino', 
    shortName: 'BRA', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/bragantino-logo-escudo-1.png', 
    primaryColor: '#FFFFFF', 
    secondaryColor: '#E30613' 
  },
  { 
    id: 'cuiaba', 
    name: 'Cuiabá', 
    shortName: 'CUI', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2021/05/cuiaba-logo-escudo-1.png', 
    primaryColor: '#FFD700', 
    secondaryColor: '#006241' 
  },
  { 
    id: 'goias', 
    name: 'Goiás', 
    shortName: 'GOI', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/goias-logo-escudo-1.png', 
    primaryColor: '#006241', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'coritiba', 
    name: 'Coritiba', 
    shortName: 'CFC', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/coritiba-logo-escudo-1.png', 
    primaryColor: '#006241', 
    secondaryColor: '#FFFFFF' 
  },
  { 
    id: 'america-mineiro', 
    name: 'América Mineiro', 
    shortName: 'AME', 
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/02/america-mineiro-logo-escudo-1.png', 
    primaryColor: '#006241', 
    secondaryColor: '#000000' 
  },
];
