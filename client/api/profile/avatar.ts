import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/db-helpers';
import { requireAuth } from '../_lib/auth-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return requireAuth(async (authReq, authRes) => {
        try {
            const { avatarUrl } = authReq.body;
            const auth = authReq.auth!;

            if (avatarUrl !== '' && (!avatarUrl || typeof avatarUrl !== 'string')) {
                return authRes.status(400).json({ message: 'URL do avatar é obrigatória' });
            }

            // Validate URL format (base64 data URL or http/https URL)
            if (avatarUrl !== '') {
                const isBase64 = avatarUrl.startsWith('data:image/');
                const isHttpUrl = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://');

                if (!isBase64 && !isHttpUrl) {
                    return authRes.status(400).json({ message: 'Formato de URL inválido' });
                }

                // Validate base64 image size (max 2MB)
                if (isBase64) {
                    const base64Data = avatarUrl.split(',')[1];
                    const sizeInBytes = (base64Data.length * 3) / 4;
                    const sizeInMB = sizeInBytes / (1024 * 1024);

                    if (sizeInMB > 2) {
                        return authRes.status(400).json({
                            message: 'Imagem muito grande. Tamanho máximo: 2MB'
                        });
                    }
                }
            }

            const updatedUser = await storage.updateUser(auth.userId, { avatarUrl });

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
            console.error('Update avatar error:', error);
            return authRes.status(500).json({ message: 'Erro ao atualizar avatar' });
        }
    })(req, res);
}
