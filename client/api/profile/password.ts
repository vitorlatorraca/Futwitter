import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { storage } from '../_lib/db-helpers';
import { requireAuth } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAuth(async (authReq, authRes) => {
        try {
            const { currentPassword, newPassword } = authReq.body;
            const auth = authReq.auth!;

            if (!currentPassword || !newPassword) {
                return authRes.status(400).json({
                    message: 'Senha atual e nova senha são obrigatórias'
                });
            }

            const user = await storage.getUser(auth.userId);
            if (!user) {
                return authRes.status(404).json({ message: 'Usuário não encontrado' });
            }

            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return authRes.status(401).json({ message: 'Senha atual incorreta' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await storage.updateUser(auth.userId, { password: hashedPassword });

            return authRes.status(200).json({ message: 'Senha alterada com sucesso' });
        } catch (error: any) {
            console.error('Change password error:', error);
            return authRes.status(500).json({ message: 'Erro ao alterar senha' });
        }
    })(req, res);
}
