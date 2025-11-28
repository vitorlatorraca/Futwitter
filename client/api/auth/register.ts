import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { insertUserSchema } from '../../shared/schema';
import { storage } from '../_lib/db-helpers';
import { generateAuthCookie } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const parsed = insertUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Invalid input',
                errors: parsed.error.errors
            });
        }

        const { name, email, password, teamId } = parsed.data;

        // Check if user already exists
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await storage.createUser({
            name,
            email,
            password: hashedPassword,
            teamId: teamId || null,
            userType: 'FAN',
        });

        // Award signup badge
        await storage.checkAndAwardBadges(user.id);

        // Generate auth cookie
        const authCookie = generateAuthCookie(user.id, user.userType);
        res.setHeader('Set-Cookie', authCookie);

        // Return user data (without password)
        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            teamId: user.teamId,
            userType: user.userType,
            isInfluencer: user.isInfluencer,
            avatarUrl: user.avatarUrl,
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: error.message || 'Erro ao criar conta'
        });
    }
}
