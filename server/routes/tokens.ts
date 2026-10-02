import { Router, Request, Response } from 'express';
import { db } from '../db';
import crypto from 'node:crypto';
import { LegalAdhesionTerm, JurisdictionCountry } from '../../src/types';

export const tokensRouter = Router();

// GET /api/tokens/wallet/:userId
tokensRouter.get('/wallet/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const wallet = db.getTokenWallet(userId);
  const transactions = db.getTokenTransactions(userId);
  const badges = db.getSoulboundBadges(userId);
  const adhesionTerms = db.getAdhesionTerms(userId);

  return res.json({
    wallet,
    transactions,
    badges,
    adhesionSigned: adhesionTerms.length > 0,
    adhesionDetails: adhesionTerms[0] || null,
  });
});

// GET /api/tokens/perks
tokensRouter.get('/perks', (_req: Request, res: Response) => {
  const perks = db.getPerkRewards();
  return res.json({
    count: perks.length,
    data: perks,
    taxComplianceNotice: 'Todos los incentivos son beneficios en especie de economía circular y formación, exentos de renta laboral y de gravamen pecuniario.',
  });
});

// GET /api/tokens/badges/:userId
tokensRouter.get('/badges/:userId', (req: Request, res: Response) => {
  const badges = db.getSoulboundBadges(req.params.userId);
  return res.json({
    count: badges.length,
    data: badges,
    standard: 'ERC-5192 Soulbound Non-Transferable Tokens',
  });
});

// POST /api/tokens/mint (Acuñación por ONG o Sistema tras verificación de impacto)
tokensRouter.post('/mint', (req: Request, res: Response) => {
  const {
    userId,
    amount,
    type,
    reason,
    projectId,
    projectTitle,
    ongOrganizationId,
    ongName,
    odsNumber,
    hoursWorked,
    valuation,
  } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: 'userId y amount son requeridos para acuñar VIT' });
  }

  try {
    const result = db.mintImpactTokens({
      userId,
      amount: Number(amount),
      type: type || 'MINT_HOURS',
      reason: reason || 'Horas de impacto social certificadas por ONG aliada',
      projectId,
      projectTitle,
      ongOrganizationId,
      ongName,
      odsNumber,
      hoursWorked,
      valuation,
    });

    return res.status(201).json({
      message: 'Tokens de impacto acuñados y registrados en el libro mayor criptográfico',
      ...result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al acuñar tokens';
    return res.status(400).json({ error: msg });
  }
});

// POST /api/tokens/redeem (Canje de perks por parte del voluntario)
tokensRouter.post('/redeem', (req: Request, res: Response) => {
  const { userId, perkId } = req.body;
  if (!userId || !perkId) {
    return res.status(400).json({ error: 'userId y perkId son requeridos' });
  }

  try {
    const result = db.redeemPerk(userId, perkId);
    return res.json({
      message: 'Recompensa de impacto canjeada con éxito y timbrada sin efecto laboral.',
      ...result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al canjear recompensa';
    return res.status(400).json({ error: msg });
  }
});

// POST /api/tokens/adhesion (Firma legal de adhesión al voluntariado)
tokensRouter.post('/adhesion', (req: Request, res: Response) => {
  const { userId, country = 'CO', acceptTerms } = req.body;
  if (!userId || !acceptTerms) {
    return res.status(400).json({ error: 'Se requiere aceptación explícita del término de adhesión' });
  }

  const jurisdiction = (country as JurisdictionCountry) || 'CO';
  const lawReference =
    jurisdiction === 'CL'
      ? 'Ley 20.500 sobre Asociaciones y Participación Ciudadana (Chile)'
      : jurisdiction === 'BR'
      ? 'Lei 9.608 de 1998 e Decreto 9.906/2019 de Serviço Voluntário (Brasil)'
      : 'Ley 720 de 2001 y Decreto 4290 de 2005 de Voluntariado (Colombia)';

  const consentHash = crypto
    .createHash('sha256')
    .update(`${userId}:${jurisdiction}:${lawReference}:${Date.now()}`)
    .digest('hex');

  const term: LegalAdhesionTerm = {
    id: `adh_${userId}_${Date.now()}`,
    userId,
    country: jurisdiction,
    lawReference,
    signedAt: new Date().toISOString(),
    noLaborRelationshipClause: true,
    sha256ConsentHash: consentHash,
  };

  const saved = db.signAdhesionTerm(term);
  return res.status(201).json({
    message: 'Término de adhesión formalizado y blindado ante riesgos de desnaturalización laboral',
    data: saved,
  });
});

// GET /api/tokens/audit-overview (Dashboard de auditoría técnica y fiscal para Super Admin)
tokensRouter.get('/audit-overview', (_req: Request, res: Response) => {
  const summary = db.getTokenAuditSummary();
  return res.json({
    summary,
    legalStandardNotice: {
      colombia: 'Ley 720 de 2001 Art. 6 (No laboralidad estricta y certificaciones de mérito)',
      chile: 'Ley 20.500 (Voluntariado autónomo y no subordinado)',
      brasil: 'Lei 9.608/1998 Art. 1 (Termo de adesão e ausência de vínculo empregatício)',
      taxDiscountCorporate: 'Art. 125-2 ET (25% descuento de renta por donaciones de soporte)',
    },
  });
});
