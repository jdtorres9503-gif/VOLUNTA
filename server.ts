import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/auth';
import { projectsRouter } from './server/routes/projects';
import { sponsorshipsRouter } from './server/routes/sponsorships';
import { deliverablesRouter } from './server/routes/deliverables';
import { corporateBookingsRouter } from './server/routes/corporateBookings';
import { complianceRouter } from './server/routes/compliance';
import { tokensRouter } from './server/routes/tokens';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Cybersecurity & ISO 27001 Headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=()'
    );
    next();
  });

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Healthcheck & System metadata
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Volunta ESG Full-Stack API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      entitiesCount: {
        users: db.getUsers().length,
        projects: db.getProjects().length,
        sponsorships: db.getSponsorships().length,
        deliverables: db.getDeliverables().length,
        auditBlocks: db.getAuditBlocks().length,
      },
    });
  });

  // REST API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/sponsorships', sponsorshipsRouter);
  app.use('/api/deliverables', deliverablesRouter);
  app.use('/api/corporate-bookings', corporateBookingsRouter);
  app.use('/api/compliance', complianceRouter);
  app.use('/api/tokens', tokensRouter);

  // Error handling middleware for API
  app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API Error]:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  // Serve Frontend SPA
  if (!isProd) {
    // Development mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Mounted Vite development middlewares on Express');
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Server] Serving production build from dist/');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Volunta Full-Stack Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal bootstrap error:', err);
  process.exit(1);
});
