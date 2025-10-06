
// constants.ts
import { Mission, Badge, TeamMission } from './types';
import { StarIcon, TrophyIcon, UserIcon, SalesIcon, MessageIcon } from './components/Icons';

export const AVAILABLE_NFT_REWARDS = [
    { id: 'nft-1', name: 'Troféu de Ouro Atacadão', imageUrl: '/nft1.png' },
    { id: 'nft-2', name: 'Selo Cliente VIP', imageUrl: '/nft2.png' },
];

export const BADGES: Badge[] = [
    { id: 'badge-1', name: 'Vendedor Mestre', description: 'Atingiu a meta de vendas do mês', icon: TrophyIcon },
    { id: 'badge-2', name: 'Cliente Feliz', description: 'Recebeu 5 avaliações 5 estrelas', icon: StarIcon },
    { id: 'badge-3', name: 'Primeira Venda', description: 'Concluiu a primeira venda na plataforma', icon: SalesIcon },
    { id: 'badge-4', name: 'Mestre do CRM', description: 'Atualizou 50 perfis de clientes', icon: UserIcon },
    { id: 'badge-5', name: 'Comunicador', description: 'Resolveu 10 tickets de suporte', icon: MessageIcon },
];

export const TEAM_MISSIONS: TeamMission[] = [
    { id: 'team-mission-1', title: 'Meta de Vendas da Equipe', description: 'Atingir R$ 100.000 em vendas combinadas', points: 500 },
    { id: 'team-mission-2', title: 'Zerar Fila de Suporte', description: 'Resolver todos os tickets de suporte abertos', points: 300 },
];