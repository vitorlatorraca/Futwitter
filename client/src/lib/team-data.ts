// Team logos mapping - using generated images
import flamengoLogo from '@assets/generated_images/Flamengo_team_logo_ddf302f6.png';
import palmeirasLogo from '@assets/generated_images/Palmeiras_team_logo_40e5f4a7.png';
import corinthiansLogo from '@assets/generated_images/Corinthians_team_logo_216c224a.png';
import saoPauloLogo from '@assets/generated_images/São_Paulo_team_logo_cbd97cc0.png';
import gremioLogo from '@assets/generated_images/Grêmio_team_logo_0f1ffbac.png';
import internacionalLogo from '@assets/generated_images/Internacional_team_logo_888b014b.png';
import atleticoMineiroLogo from '@assets/generated_images/Atlético_Mineiro_logo_2d9987d8.png';
import fluminenseLogo from '@assets/generated_images/Fluminense_team_logo_8e3f74db.png';
import botafogoLogo from '@assets/generated_images/Botafogo_team_logo_f381ff20.png';
import santosLogo from '@assets/generated_images/Santos_FC_team_logo_4f1553d1.png';
import vascoLogo from '@assets/generated_images/Vasco_da_Gama_logo_3673fe2c.png';
import cruzeiroLogo from '@assets/generated_images/Cruzeiro_team_logo_cc72811d.png';
import athleticoLogo from '@assets/generated_images/Athletico_Paranaense_logo_1e936bab.png';
import bahiaLogo from '@assets/generated_images/Bahia_team_logo_89071852.png';
import fortalezaLogo from '@assets/generated_images/Fortaleza_team_logo_1f83dc09.png';
import bragantinoLogo from '@assets/generated_images/Bragantino_team_logo_3d901f97.png';
import cuiabaLogo from '@assets/generated_images/Cuiabá_team_logo_0c3c45a0.png';
import goiasLogo from '@assets/generated_images/Goiás_team_logo_79144849.png';
import coritibaLogo from '@assets/generated_images/Coritiba_team_logo_cade1639.png';

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export const TEAMS_DATA: TeamData[] = [
  { id: 'flamengo', name: 'Flamengo', shortName: 'FLA', logoUrl: flamengoLogo, primaryColor: '#E31837', secondaryColor: '#000000' },
  { id: 'palmeiras', name: 'Palmeiras', shortName: 'PAL', logoUrl: palmeirasLogo, primaryColor: '#006437', secondaryColor: '#FFFFFF' },
  { id: 'corinthians', name: 'Corinthians', shortName: 'COR', logoUrl: corinthiansLogo, primaryColor: '#000000', secondaryColor: '#FFFFFF' },
  { id: 'sao-paulo', name: 'São Paulo', shortName: 'SAO', logoUrl: saoPauloLogo, primaryColor: '#EC1C24', secondaryColor: '#000000' },
  { id: 'gremio', name: 'Grêmio', shortName: 'GRE', logoUrl: gremioLogo, primaryColor: '#0099CC', secondaryColor: '#000000' },
  { id: 'internacional', name: 'Internacional', shortName: 'INT', logoUrl: internacionalLogo, primaryColor: '#D81920', secondaryColor: '#FFFFFF' },
  { id: 'atletico-mineiro', name: 'Atlético Mineiro', shortName: 'CAM', logoUrl: atleticoMineiroLogo, primaryColor: '#000000', secondaryColor: '#FFFFFF' },
  { id: 'fluminense', name: 'Fluminense', shortName: 'FLU', logoUrl: fluminenseLogo, primaryColor: '#7A1437', secondaryColor: '#006241' },
  { id: 'botafogo', name: 'Botafogo', shortName: 'BOT', logoUrl: botafogoLogo, primaryColor: '#000000', secondaryColor: '#FFFFFF' },
  { id: 'santos', name: 'Santos', shortName: 'SAN', logoUrl: santosLogo, primaryColor: '#000000', secondaryColor: '#FFFFFF' },
  { id: 'vasco-da-gama', name: 'Vasco da Gama', shortName: 'VAS', logoUrl: vascoLogo, primaryColor: '#000000', secondaryColor: '#FFFFFF' },
  { id: 'cruzeiro', name: 'Cruzeiro', shortName: 'CRU', logoUrl: cruzeiroLogo, primaryColor: '#003A70', secondaryColor: '#FFFFFF' },
  { id: 'athletico-paranaense', name: 'Athletico Paranaense', shortName: 'CAP', logoUrl: athleticoLogo, primaryColor: '#E30613', secondaryColor: '#000000' },
  { id: 'bahia', name: 'Bahia', shortName: 'BAH', logoUrl: bahiaLogo, primaryColor: '#005CA9', secondaryColor: '#E30613' },
  { id: 'fortaleza', name: 'Fortaleza', shortName: 'FOR', logoUrl: fortalezaLogo, primaryColor: '#E30613', secondaryColor: '#003A70' },
  { id: 'bragantino', name: 'Bragantino', shortName: 'BRA', logoUrl: bragantinoLogo, primaryColor: '#FFFFFF', secondaryColor: '#E30613' },
  { id: 'cuiaba', name: 'Cuiabá', shortName: 'CUI', logoUrl: cuiabaLogo, primaryColor: '#FFD700', secondaryColor: '#006241' },
  { id: 'goias', name: 'Goiás', shortName: 'GOI', logoUrl: goiasLogo, primaryColor: '#006241', secondaryColor: '#FFFFFF' },
  { id: 'coritiba', name: 'Coritiba', shortName: 'CFC', logoUrl: coritibaLogo, primaryColor: '#006241', secondaryColor: '#FFFFFF' },
  { id: 'america-mineiro', name: 'América Mineiro', shortName: 'AME', logoUrl: flamengoLogo, primaryColor: '#006241', secondaryColor: '#000000' },
];
