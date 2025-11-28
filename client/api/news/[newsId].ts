import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireJournalistOrInfluencer } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireJournalistOrInfluencer(async (authReq, authRes) => {
        try {
            const { newsId } = authReq.query;

            if (!newsId || typeof newsId !== 'string') {
                return authRes.status(400).json({ message: 'News ID é obrigatório' });
            }

            await storage.deleteNews(newsId);
            return authRes.status(200).json({ message: 'Notícia excluída com sucesso' });
        } catch (error: any) {
            console.error('Delete news error:', error);
            return authRes.status(500).json({ message: 'Erro ao excluir notícia' });
        }
    })(req, res);
}
