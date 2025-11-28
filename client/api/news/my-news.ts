import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireJournalistOrInfluencer } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireJournalistOrInfluencer(async (authReq, authRes) => {
        try {
            const auth = authReq.auth!;
            const user = await storage.getUser(auth.userId);

            if (!user) {
                return authRes.status(404).json({ message: 'Usuário não encontrado' });
            }

            let newsItems: any[] = [];

            // If journalist, get news by journalistId
            if (user.userType === 'JOURNALIST') {
                const journalist = await storage.getJournalist(auth.userId);
                if (journalist) {
                    newsItems = await storage.getNewsByJournalist(journalist.id);
                }
            }

            // If influencer, get news by userId
            if (user.isInfluencer) {
                const influencerNews = await storage.getNewsByUser(auth.userId);
                newsItems = [...newsItems, ...influencerNews];
            }

            // Enrich with team data
            const enrichedNews = await Promise.all(
                newsItems.map(async (newsItem) => {
                    const team = await storage.getTeam(newsItem.teamId);
                    return { ...newsItem, team };
                })
            );

            return authRes.status(200).json(enrichedNews);
        } catch (error: any) {
            console.error('Get my news error:', error);
            return authRes.status(500).json({ message: 'Erro ao buscar suas notícias' });
        }
    })(req, res);
}
