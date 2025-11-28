import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const teams = await storage.getAllTeams();
        return res.status(200).json(teams);
    } catch (error: any) {
        console.error('Get teams error:', error);
        return res.status(500).json({ message: 'Erro ao buscar times' });
    }
}
