import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireAuth } from '../_lib/auth-helpers';
import { insertInfluencerRequestSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAuth(async (authReq, authRes) => {
        try {
            const auth = authReq.auth!;
            const requestData = insertInfluencerRequestSchema.parse(authReq.body);

            // Check if request already exists
            const existingRequest = await storage.getInfluencerRequestByUserId(auth.userId);
            if (existingRequest) {
                if (existingRequest.status === 'PENDING') {
                    return authRes.status(400).json({
                        message: 'Você já possui uma solicitação pendente'
                    });
                }
                if (existingRequest.status === 'APPROVED') {
                    return authRes.status(400).json({ message: 'Você já é um influencer' });
                }
            }

            const request = await storage.createInfluencerRequest({
                ...requestData,
                userId: auth.userId,
            } as any);

            return authRes.status(201).json(request);
        } catch (error: any) {
            console.error('Create influencer request error:', error);
            if (error.issues) {
                return authRes.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.issues
                });
            }
            return authRes.status(400).json({
                message: error.message || 'Erro ao criar solicitação'
            });
        }
    })(req, res);
}
