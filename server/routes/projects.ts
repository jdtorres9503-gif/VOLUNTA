import { Router, Request, Response } from 'express';
import { db } from '../db';
import { Project, ProjectCategory } from '../../src/types';

export const projectsRouter = Router();

// GET /api/projects
projectsRouter.get('/', (req: Request, res: Response) => {
  const { country, category, ods, search } = req.query;
  let projects = db.getProjects();

  if (country && country !== 'ALL') {
    const c = String(country).toUpperCase();
    projects = projects.filter((p) => {
      if (c === 'CO') return p.country?.toLowerCase().includes('colombia') || p.country === 'CO';
      if (c === 'CL') return p.country?.toLowerCase().includes('chile') || p.country === 'CL';
      if (c === 'BR') return p.country?.toLowerCase().includes('brasil') || p.country?.toLowerCase().includes('brazil') || p.country === 'BR';
      return true;
    });
  }

  if (category && category !== 'ALL') {
    projects = projects.filter((p) => p.category === category);
  }

  if (ods && ods !== 'ALL') {
    const odsNum = parseInt(String(ods), 10);
    if (!isNaN(odsNum)) {
      projects = projects.filter((p) => p.odsNumber === odsNum);
    }
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.organizationName.toLowerCase().includes(q)
    );
  }

  res.json({ count: projects.length, data: projects });
});

// GET /api/projects/:id
projectsRouter.get('/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json(project);
});

// POST /api/projects
projectsRouter.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Project>;
  if (!body.title || !body.organizationId) {
    return res.status(400).json({ error: 'Missing required fields (title, organizationId)' });
  }

  const category: ProjectCategory = body.category || 'AMBIENTAL';

  const newProject: Project = {
    id: `prj_${Date.now()}`,
    organizationId: body.organizationId,
    organizationName: body.organizationName || 'Organización Aliada',
    title: body.title,
    summary: body.summary || '',
    description: body.description || body.summary || '',
    imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    category,
    status: 'PUBLISHED',
    city: body.city || 'Bogotá',
    country: body.country || 'Colombia',
    isRemote: body.isRemote || false,
    modality: body.modality || 'PRESENCIAL',
    dedication: body.dedication || 'PUNTUAL',
    startDate: body.startDate || new Date().toISOString().split('T')[0],
    endDate: body.endDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    odsNumber: body.odsNumber || 13,
    fundingGoals: body.fundingGoals || [
      {
        currency: 'COP',
        targetAmount: 25000000,
        committedAmount: 0,
        description: 'Fondo de implementación directa',
      },
    ],
    volunteerRoles: body.volunteerRoles || [],
    isoStandards: body.isoStandards || ['ISO_14001_AMBIENTAL', 'ISO_26000_RSE'],
    createdAt: new Date().toISOString(),
    insuranceProvided: true,
    trainingProvided: true,
    impactMetrics: body.impactMetrics || {
      targetValue: 1000,
      unit: 'Beneficiarios',
      co2KgMitigated: 500,
      beneficiariesDirect: 500,
      sroiEstimatedRate: 95000,
      sroiRatio: 3.2,
      socialValueGenerated: 'Impacto Comunitario Certificado',
    },
    ...body,
  };

  const created = db.createProject(newProject);
  return res.status(201).json(created);
});
