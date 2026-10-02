import { Router, Request, Response } from 'express';
import { db } from '../db';
import { ProBonoDeliverable, JurisdictionCountry } from '../../src/types';

export const deliverablesRouter = Router();

// GET /api/deliverables
deliverablesRouter.get('/', (req: Request, res: Response) => {
  const { status, volunteerUserId, projectId } = req.query;
  let list = db.getDeliverables();

  if (status) {
    list = list.filter((d) => d.status === status);
  }

  if (volunteerUserId) {
    list = list.filter((d) => d.volunteerUserId === volunteerUserId);
  }

  if (projectId) {
    list = list.filter((d) => d.projectId === projectId);
  }

  return res.json({ count: list.length, data: list });
});

// POST /api/deliverables
deliverablesRouter.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<ProBonoDeliverable>;
  if (!body.title || !body.projectId || !body.hoursWorked) {
    return res.status(400).json({ error: 'Missing required fields (title, projectId, hoursWorked)' });
  }

  const project = db.getProjectById(body.projectId);

  const newDeliverable: ProBonoDeliverable = {
    id: `deliv_${Date.now()}`,
    projectId: body.projectId,
    projectTitle: project?.title || body.projectTitle || 'Proyecto Social',
    ongOrganizationId: project?.organizationId || 'org_ong_1',
    volunteerUserId: body.volunteerUserId || 'usr_vol_1',
    volunteerName: body.volunteerName || 'Voluntario Pro-Bono',
    volunteerPseudonym: body.volunteerPseudonym || 'VOL-CO-409',
    professionalCategory: body.professionalCategory || 'TECH',
    title: body.title,
    description: body.description || '',
    evidenceUrl: body.evidenceUrl || 'https://drive.google.com/audit/evidence.pdf',
    hoursWorked: Number(body.hoursWorked),
    hourlyBenchmarkRate: 0,
    currency: 'COP',
    country: body.country || 'CO',
    economicValuation: 0,
    status: 'SUBMITTED',
    beneficiariesImpacted: Number(body.beneficiariesImpacted) || 1,
    submittedAt: new Date().toISOString(),
    sha256VerificationHash: 'PENDING_VALIDATION',
  };

  const created = db.createDeliverable(newDeliverable);
  return res.status(201).json(created);
});

// PATCH /api/deliverables/:id/approve
deliverablesRouter.patch('/:id/approve', (req: Request, res: Response) => {
  const country = (req.body.country || 'CO') as JurisdictionCountry;
  const approved = db.approveDeliverable(req.params.id, country);

  if (!approved) {
    return res.status(404).json({ error: 'Deliverable not found' });
  }

  return res.json({
    message: 'Entregable aprobado, valorizado in-kind y sellado en la cadena de bloques SHA-256',
    data: approved,
  });
});
