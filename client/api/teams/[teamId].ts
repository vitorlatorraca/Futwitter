import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Get teamId from URL path
        // In Vercel, dynamic routes use [paramName].ts format
        // The parameter is available in req.query
        const { teamId } = req.query;

        if (!teamId || typeof teamId !== 'string') {
            return res.status(400).json({ message: 'Team ID é obrigatório' });
        }

        const team = await storage.getTeam(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Time não encontrado' });
        }

        const players = await storage.getPlayersByTeam(teamId);

        return res.status(200).json({ ...team, players });
    } catch (error: any) {
        console.error('Get team error:', error);
        return res.status(500).json({ message: 'Erro ao buscar time' });
    }
}
