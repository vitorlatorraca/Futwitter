import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthToken } from '../_lib/auth-helpers';
import { storage } from '../_lib/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const auth = verifyAuthToken(req);

        if (!auth) {
            return res.status(401).json({ message: 'Não autenticado' });
        }

        const user = await storage.getUser(auth.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Return user data (without password)
        return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            teamId: user.teamId,
            userType: user.userType,
            isInfluencer: user.isInfluencer,
            avatarUrl: user.avatarUrl,
        });
    } catch (error: any) {
        console.error('Get me error:', error);
        return res.status(500).json({
            message: error.message || 'Erro ao buscar usuário'
        });
    }
}
