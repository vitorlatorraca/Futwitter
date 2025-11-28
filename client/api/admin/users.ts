import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireAdmin } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAdmin(async (authReq, authRes) => {
        try {
            const allUsers = await storage.getAllUsers();
            // Remove passwords before returning
            const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
            return authRes.status(200).json(usersWithoutPasswords);
        } catch (error: any) {
            console.error('Get all users error:', error);
            return authRes.status(500).json({ message: 'Erro ao buscar usuários' });
        }
    })(req, res);
}
