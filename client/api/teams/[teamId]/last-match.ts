import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/db-helpers';
import { verifyAuthToken } from '../../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { teamId } = req.query;

        if (!teamId || typeof teamId !== 'string') {
            return res.status(400).json({ message: 'Team ID é obrigatório' });
        }

        const lastMatch = await storage.getLastMatch(teamId);

        if (!lastMatch) {
            return res.status(200).json(null);
        }

        // Add user ratings if logged in
        const auth = verifyAuthToken(req);
        if (auth) {
            const playersWithUserRating = await Promise.all(
                lastMatch.players.map(async (player) => {
                    const userRating = await storage.getPlayerRatingForMatch(
                        player.id,
                        lastMatch.id,
                        auth.userId
                    );
                    return {
                        ...player,
                        userRating: userRating?.rating || null,
                    };
                })
            );
            return res.status(200).json({ ...lastMatch, players: playersWithUserRating });
        }

        return res.status(200).json(lastMatch);
    } catch (error: any) {
        console.error('Get last match error:', error);
        return res.status(500).json({ message: 'Erro ao buscar último jogo' });
    }
}
