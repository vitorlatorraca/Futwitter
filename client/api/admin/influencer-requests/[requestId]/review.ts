import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/db-helpers';
import { requireAdmin } from '../../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAdmin(async (authReq, authRes) => {
        try {
            const { requestId } = authReq.query;
            const { status } = authReq.body;
            const auth = authReq.auth!;

            if (!requestId || typeof requestId !== 'string') {
                return authRes.status(400).json({ message: 'Request ID é obrigatório' });
            }

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                return authRes.status(400).json({
                    message: 'Status inválido. Use APPROVED ou REJECTED'
                });
            }

            const updatedRequest = await storage.updateInfluencerRequestStatus(
                requestId,
                status,
                auth.userId
            );

            if (!updatedRequest) {
                return authRes.status(404).json({ message: 'Solicitação não encontrada' });
            }

            return authRes.status(200).json(updatedRequest);
        } catch (error: any) {
            console.error('Review influencer request error:', error);
            return authRes.status(500).json({ message: 'Erro ao revisar solicitação' });
        }
    })(req, res);
}
