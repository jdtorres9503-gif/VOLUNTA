import { Router, Request, Response } from 'express';
import { db } from '../db';
import { CorporateTeamBooking } from '../../src/types';

export const corporateBookingsRouter = Router();

// GET /api/corporate-bookings
corporateBookingsRouter.get('/', (req: Request, res: Response) => {
  const { empresaName, projectId } = req.query;
  let list = db.getCorporateBookings();

  if (empresaName) {
    list = list.filter((b) => b.empresaName === empresaName);
  }

  if (projectId) {
    list = list.filter((b) => b.projectId === projectId);
  }

  return res.json({ count: list.length, data: list });
});

// POST /api/corporate-bookings
corporateBookingsRouter.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<CorporateTeamBooking>;

  if (!body.projectId || !body.teamSize) {
    return res.status(400).json({ error: 'Missing required fields (projectId, teamSize)' });
  }

  const project = db.getProjectById(body.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const newBooking: CorporateTeamBooking = {
    id: `corp_${Date.now()}`,
    projectId: project.id,
    projectTitle: project.title,
    ongOrganizationId: project.organizationId,
    empresaOrganizationId: body.empresaOrganizationId || 'org_emp_1',
    empresaName: body.empresaName || 'Empresa Aliada',
    contactPerson: body.contactPerson || 'Coordinador de Voluntariado',
    contactEmail: body.contactEmail || 'voluntariado@empresa.com',
    contactPhone: body.contactPhone || '+57 300 000 0000',
    teamSize: Number(body.teamSize),
    preferredDate: body.preferredDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'CONFIRMED',
    matchingGiftEnabled: Boolean(body.matchingGiftEnabled || body.matchingGiftPerHour),
    matchingGiftPerHour: body.matchingGiftPerHour,
    matchingGiftCurrency: body.matchingGiftCurrency || 'COP',
    notes: body.notes || 'Jornada de integración de equipo con impacto ODS verificado.',
    createdAt: new Date().toISOString(),
  };

  const created = db.createCorporateBooking(newBooking);
  return res.status(201).json(created);
});
