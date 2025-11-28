// api/auth/register.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    return res.status(200).json({
        route: '/api/auth/register',
        method: req.method,
        status: 'ok from Vercel',
    });
}
