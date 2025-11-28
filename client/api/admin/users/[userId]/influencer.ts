import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/db-helpers';
import { requireAdmin } from '../../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAdmin(async (authReq, authRes) => {
        try {
            const { userId } = authReq.query;
            const { isInfluencer } = authReq.body;

            if (!userId || typeof userId !== 'string') {
                return authRes.status(400).json({ message: 'User ID é obrigatório' });
            }

            if (typeof isInfluencer !== 'boolean') {
                return authRes.status(400).json({ message: 'isInfluencer deve ser um booleano' });
            }

            const updatedUser = await storage.updateUserInfluencerStatus(userId, isInfluencer);

            if (!updatedUser) {
                return authRes.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Remove password before returning
            const { password, ...userWithoutPassword } = updatedUser;
            return authRes.status(200).json(userWithoutPassword);
        } catch (error: any) {
            console.error('Update influencer status error:', error);
            return authRes.status(500).json({
                message: 'Erro ao atualizar status de influencer'
            });
        }
    })(req, res);
}
