import { Router, Request, Response } from 'express';
import { db } from '../db';
import { SponsorshipIntent, CurrencyCode } from '../../src/types';

export const sponsorshipsRouter = Router();

// GET /api/sponsorships
sponsorshipsRouter.get('/', (req: Request, res: Response) => {
  const { organizationId, currency } = req.query;
  let list = db.getSponsorships();

  if (organizationId) {
    list = list.filter((s) => s.empresaOrganizationId === organizationId || s.ongOrganizationId === organizationId);
  }

  if (currency) {
    list = list.filter((s) => s.currency === currency);
  }

  return res.json({ count: list.length, data: list });
});

// POST /api/sponsorships
sponsorshipsRouter.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<SponsorshipIntent>;

  if (!body.projectId || !body.amount) {
    return res.status(400).json({ error: 'Missing required fields (projectId, amount)' });
  }

  const project = db.getProjectById(body.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const currency: CurrencyCode = body.currency || project.fundingGoals?.[0]?.currency || 'COP';

  const newSponsorship: SponsorshipIntent = {
    id: `spon_${Date.now()}`,
    projectId: project.id,
    projectTitle: project.title,
    ongOrganizationId: project.organizationId,
    empresaOrganizationId: body.empresaOrganizationId || 'org_emp_1',
    empresaName: body.empresaName || 'Empresa Patrocinadora',
    amount: Number(body.amount),
    currency,
    status: 'INTENT_REGISTERED',
    contactPerson: body.contactPerson || 'Responsable RSE',
    contactEmail: body.contactEmail || 'rse@empresa.com',
    contactPhone: body.contactPhone || '+57 300 000 0000',
    notes: body.notes || 'Compromiso RSE de impacto comunitario y mitigación ambiental.',
    createdAt: new Date().toISOString(),
  };

  const saved = db.createSponsorship(newSponsorship);
  return res.status(201).json(saved);
});

// POST /api/sponsorships/:id/certificate
sponsorshipsRouter.post('/:id/certificate', (req: Request, res: Response) => {
  const sponsorship = db.getSponsorships().find((s) => s.id === req.params.id);
  if (!sponsorship) {
    return res.status(404).json({ error: 'Sponsorship not found' });
  }

  const certId = `CERT-ESG-${sponsorship.currency}-${Date.now()}`;
  const certificateData = {
    certificateId: certId,
    sponsorshipId: sponsorship.id,
    empresaName: sponsorship.empresaName,
    projectTitle: sponsorship.projectTitle,
    amount: sponsorship.amount,
    currency: sponsorship.currency,
    issuedAt: new Date().toISOString(),
    legalReference:
      sponsorship.currency === 'COP'
        ? 'Estatuto Tributario Art. 125-2 & Ley 1819/2016'
        : sponsorship.currency === 'CLP'
        ? 'Ley 19.885 de Donaciones & Ley 21.440'
        : sponsorship.currency === 'BRL'
        ? 'Lei 9.249/1995 de Incentivos Fiscais'
        : 'International Verified Philanthropic Contribution',
    status: 'ISSUED',
  };

  db.appendAuditBlock(
    'SPONSORSHIP_LOCKED',
    sponsorship.projectId,
    sponsorship.empresaName,
    sponsorship.currency === 'CLP' ? 'CL' : sponsorship.currency === 'BRL' ? 'BR' : 'CO',
    certificateData
  );

  return res.json({
    message: 'Certificado tributario emitido y timbrado con éxito',
    certificate: certificateData,
  });
});
