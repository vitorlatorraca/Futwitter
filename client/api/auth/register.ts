import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { insertUserSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const parsed = insertUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid input', errors: parsed.error });
        }

        const existingUser = await storage.getUserByUsername(parsed.data.email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const user = await storage.createUser(parsed.data);

        // Note: Session creation is complex in serverless without express-session middleware.
        // For now, we return the user. The frontend might need to adjust login flow to JWT if we abandon express-session completely.
        return res.status(201).json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
