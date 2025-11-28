import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireAuth } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAuth(async (authReq, authRes) => {
        try {
            const { name, email } = authReq.body;
            const auth = authReq.auth!;

            const updatedUser = await storage.updateUser(auth.userId, { name, email });

            if (!updatedUser) {
                return authRes.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Return user data (without password)
            return authRes.status(200).json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                teamId: updatedUser.teamId,
                userType: updatedUser.userType,
                isInfluencer: updatedUser.isInfluencer,
                avatarUrl: updatedUser.avatarUrl,
            });
        } catch (error: any) {
            console.error('Update profile error:', error);
            return authRes.status(500).json({ message: 'Erro ao atualizar perfil' });
        }
    })(req, res);
}
