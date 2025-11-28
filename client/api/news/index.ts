import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { verifyAuthToken, requireAuth, requireJournalistOrInfluencer } from '../_lib/auth-helpers';
import { insertNewsSchema } from '../../shared/schema';

async function handleGet(req: VercelRequest, res: VercelResponse) {
    try {
        const { teamId, filter, limit, offset } = req.query;

        let filterTeamId: string | undefined;

        if (filter === 'my-team') {
            const auth = verifyAuthToken(req);
            if (auth) {
                const user = await storage.getUser(auth.userId);
                filterTeamId = user?.teamId || undefined;
            }
        } else if (filter === 'all') {
            filterTeamId = undefined;
        } else if (teamId && typeof teamId === 'string') {
            filterTeamId = teamId;
        }

        const limitNum = parseInt((limit as string) || '50');
        const offsetNum = parseInt((offset as string) || '0');

        const newsItems = await storage.getAllNews(filterTeamId, limitNum, offsetNum);

        // Add user interaction info if logged in
        const auth = verifyAuthToken(req);
        if (auth) {
            for (const newsItem of newsItems) {
                const interaction = await storage.getUserNewsInteraction(auth.userId, newsItem.id);
                (newsItem as any).userInteraction = interaction?.interactionType || null;
            }
        }

        return res.status(200).json(newsItems);
    } catch (error: any) {
        console.error('Get news error:', error);
        return res.status(500).json({ message: 'Erro ao buscar notícias' });
    }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
    return requireJournalistOrInfluencer(async (authReq, authRes) => {
        try {
            const auth = authReq.auth!;
            const user = await storage.getUser(auth.userId);

            if (!user) {
                return authRes.status(404).json({ message: 'Usuário não encontrado' });
            }

            const newsData = insertNewsSchema.parse(authReq.body);

            // If influencer, ensure posting only for their team
            if (user.isInfluencer && user.userType !== 'JOURNALIST') {
                if (newsData.teamId !== user.teamId) {
                    return authRes.status(403).json({
                        message: 'Influencers só podem postar notícias para o seu próprio time'
                    });
                }

                const newsItem = await storage.createNews({
                    ...newsData,
                    userId: user.id,
                    teamId: user.teamId!,
                });

                return authRes.status(201).json(newsItem);
            }

            // If journalist, use journalistId
            const journalist = await storage.getJournalist(auth.userId);
            if (!journalist) {
                return authRes.status(404).json({ message: 'Jornalista não encontrado' });
            }

            const newsItem = await storage.createNews({
                ...newsData,
                journalistId: journalist.id,
            });

            return authRes.status(201).json(newsItem);
        } catch (error: any) {
            console.error('Create news error:', error);
            return authRes.status(400).json({
                message: error.message || 'Erro ao criar notícia'
            });
        }
    })(req, res);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        return handleGet(req, res);
    }

    if (req.method === 'POST') {
        return handlePost(req, res);
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
