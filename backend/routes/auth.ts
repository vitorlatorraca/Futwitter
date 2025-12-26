import type { Router } from "express";
import express from "express";
import { storage } from "../../server/storage";
import bcrypt from "bcrypt";
import { insertUserSchema } from "@shared/schema";
import { signToken } from "../../server/auth/jwt";
import { setAuthCookie, clearAuthCookie } from "../../server/auth/cookies";
import { requireAuth } from "../../server/auth/middleware";

export function createAuthRoutes(): Router {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      console.log('📝 REGISTER REQUEST - Body:', JSON.stringify(req.body, null, 2));
      console.log('📝 REGISTER REQUEST - Content-Type:', req.headers['content-type']);
      
      // Parse and validate the request body
      // Handle undefined teamId by converting it to null
      const bodyToParse = {
        ...req.body,
        teamId: req.body.teamId || null,
      };
      const parsed = insertUserSchema.parse(bodyToParse);
      const { name, email, password, teamId } = parsed;
      console.log('📝 REGISTER REQUEST - Parsed data:', { name, email, password: '***', teamId });

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('⚠️ REGISTER - Email já cadastrado:', email);
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Hash password
      console.log('🔐 REGISTER - Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      console.log('👤 REGISTER - Creating user...');
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        teamId: teamId || null,
        userType: 'FAN',
      });
      console.log('✅ REGISTER - User created:', { id: user.id, email: user.email });

      // Issue JWT token
      const token = signToken(user.id);
      setAuthCookie(res, token);
      console.log('🔑 REGISTER - JWT token issued:', { userId: user.id });

      // Award signup badge
      try {
        await storage.checkAndAwardBadges(user.id);
      } catch (badgeError: any) {
        console.warn('⚠️ REGISTER - Error awarding badges (non-critical):', badgeError.message);
      }

      // Return public user fields (no password)
      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        teamId: user.teamId, 
        userType: user.userType, 
        isInfluencer: user.isInfluencer, 
        avatarUrl: user.avatarUrl 
      });
    } catch (error: any) {
      console.error('❌ REGISTRATION ERROR:', error);
      console.error('❌ REGISTRATION ERROR - Name:', error.name);
      console.error('❌ REGISTRATION ERROR - Message:', error.message);
      console.error('❌ REGISTRATION ERROR - Stack:', error.stack);
      
      // Handle Zod validation errors
      if (error.issues && Array.isArray(error.issues)) {
        const validationErrors = error.issues.map((issue: any) => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        console.error('❌ REGISTRATION ERROR - Validation issues:', validationErrors);
        const firstError = validationErrors[0];
        return res.status(400).json({ 
          message: firstError?.message || 'Erro de validação',
          errors: validationErrors 
        });
      }
      
      // Infrastructure/DB errors should return 500
      if (error.message?.includes('relation') || error.message?.includes('does not exist') || error.message?.includes('connect')) {
        return res.status(500).json({ message: error.message || 'Erro ao criar conta' });
      }
      
      res.status(400).json({ message: error.message || 'Erro ao criar conta' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      console.log('🔐 LOGIN REQUEST - Body:', JSON.stringify({ ...req.body, password: '***' }, null, 2));
      console.log('🔐 LOGIN REQUEST - Content-Type:', req.headers['content-type']);
      console.log('🔐 LOGIN REQUEST - Origin:', req.headers.origin);
      console.log('🔐 LOGIN REQUEST - Cookie:', req.headers.cookie);
      
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('⚠️ LOGIN - Missing email or password');
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      // Validate email format
      if (typeof email !== 'string' || !email.includes('@')) {
        console.log('⚠️ LOGIN - Invalid email format');
        return res.status(400).json({ message: 'Formato de email inválido' });
      }

      // Validate password is a string
      if (typeof password !== 'string' || password.length === 0) {
        console.log('⚠️ LOGIN - Invalid password format');
        return res.status(400).json({ message: 'Senha é obrigatória' });
      }

      console.log('🔍 LOGIN - Looking for user with email:', email);
      
      let user;
      try {
        user = await storage.getUserByEmail(email);
      } catch (dbError: any) {
        console.error('❌ LOGIN - Database error when fetching user:', dbError);
        // Check for specific database errors
        if (dbError.message?.includes('relation') || dbError.message?.includes('does not exist')) {
          console.error('❌ LOGIN ERROR - Database schema issue detected!');
          return res.status(500).json({ 
            message: 'Erro de banco de dados. Verifique se as migrations foram executadas.',
            details: 'Execute: npm run db:push'
          });
        }
        throw dbError; // Re-throw to be caught by outer catch
      }
      
      if (!user) {
        console.log('❌ LOGIN - User not found:', email);
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      console.log('🔍 LOGIN - User found:', { id: user.id, email: user.email, hasPassword: !!user.password });
      
      if (!user.password) {
        console.error('❌ LOGIN - User has no password hash!');
        return res.status(500).json({ message: 'Erro interno: usuário sem senha cadastrada' });
      }

      console.log('🔐 LOGIN - Comparing passwords...');
      let isValidPassword = false;
      try {
        isValidPassword = await bcrypt.compare(password, user.password);
      } catch (bcryptError: any) {
        console.error('❌ LOGIN - Bcrypt comparison error:', bcryptError);
        return res.status(500).json({ message: 'Erro ao verificar senha' });
      }
      
      if (!isValidPassword) {
        console.log('❌ LOGIN - Invalid password for user:', email);
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      console.log('✅ LOGIN - Password valid, issuing JWT token...');
      
      // Issue JWT token
      const token = signToken(user.id);
      setAuthCookie(res, token);
      console.log('🔑 LOGIN - JWT token issued:', { userId: user.id });

      // Return public user fields (no password)
      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        teamId: user.teamId, 
        userType: user.userType, 
        isInfluencer: user.isInfluencer, 
        avatarUrl: user.avatarUrl 
      });
    } catch (error: any) {
      console.error('❌ LOGIN ERROR:', error);
      console.error('❌ LOGIN ERROR - Name:', error.name);
      console.error('❌ LOGIN ERROR - Message:', error.message);
      console.error('❌ LOGIN ERROR - Stack:', error.stack);
      
      // Check for specific database errors
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.error('❌ LOGIN ERROR - Database schema issue detected!');
        return res.status(500).json({ 
          message: 'Erro de banco de dados. Verifique se as migrations foram executadas.',
          details: 'Execute: npm run db:push'
        });
      }
      
      // Check for connection errors
      if (error.message?.includes('connect') || error.message?.includes('ECONNREFUSED')) {
        console.error('❌ LOGIN ERROR - Database connection issue detected!');
        return res.status(500).json({ 
          message: 'Erro de conexão com o banco de dados. Verifique a configuração.',
          details: 'Verifique se DATABASE_URL está correto no arquivo .env'
        });
      }
      
      res.status(500).json({ 
        message: error.message || 'Erro ao fazer login',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  });

  router.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ ok: true });
  });

  router.get('/me', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(String(req.user!.id));
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Return public user fields (no password)
      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        teamId: user.teamId, 
        userType: user.userType, 
        isInfluencer: user.isInfluencer, 
        avatarUrl: user.avatarUrl 
      });
    } catch (error: any) {
      console.error('Get me error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: error.message || 'Erro ao buscar usuário' });
    }
  });

  return router;
}

