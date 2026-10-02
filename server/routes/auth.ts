import { Router, Request, Response } from 'express';
import { db } from '../db';
import crypto from 'node:crypto';
import { User, UserRole } from '../../src/types';

export const authRouter = Router();

// Simple zero-cost JWT-like signed token using HMAC SHA-256
const JWT_SECRET = process.env.JWT_SECRET || 'volunta_esg_super_secret_key_2026_mvp1';

function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 3600 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (parsed.exp && parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  if (!email && !role) {
    return res.status(400).json({ error: 'Email or role required' });
  }

  let user: User | undefined;
  if (email) {
    user = db.getUserByEmail(email);
  }
  if (!user && role) {
    user = db.getUsers().find((u: User) => u.role === role);
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found in system' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.json({
    user,
    token,
    message: 'Authentication successful',
  });
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const defaultUser = db.getUsers()[0];
    return res.json({ user: defaultUser, authenticated: false });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload || !payload.id) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = db.getUserById(payload.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user, authenticated: true });
});

// POST /api/auth/switch-role (1-click role switcher for live investor demos)
authRouter.post('/switch-role', (req: Request, res: Response) => {
  const { role } = req.body as { role: UserRole };
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const targetUser = db.getUsers().find((u: User) => u.role === role);
  if (!targetUser) {
    return res.status(404).json({ error: `No demo user found with role ${role}` });
  }

  const token = signToken({ id: targetUser.id, email: targetUser.email, role: targetUser.role });
  return res.json({
    user: targetUser,
    token,
    message: `Switched context to ${role}`,
  });
});
