import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { storage } from '../_lib/db-helpers';
import { generateAuthCookie } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }

        const user = await storage.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Generate auth cookie
        const authCookie = generateAuthCookie(user.id, user.userType);
        res.setHeader('Set-Cookie', authCookie);

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
        console.error('Login error:', error);
        return res.status(500).json({
            message: error.message || 'Erro ao fazer login'
        });
    }
}
