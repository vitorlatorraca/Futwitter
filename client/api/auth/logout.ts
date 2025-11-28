import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearAuthCookie } from '../_lib/auth-helpers';

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Clear auth cookie
    const clearCookie = clearAuthCookie();
    res.setHeader('Set-Cookie', clearCookie);

    return res.status(200).json({ message: 'Logout realizado com sucesso' });
}
