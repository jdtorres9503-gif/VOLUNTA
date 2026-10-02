import React from 'react';
import {
  Award,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  QrCode,
  Building2,
} from 'lucide-react';
import { User, VolunteerApplication, Project } from '../types';

interface VolunteerDiplomaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  application: VolunteerApplication | null;
  project?: Project;
}

export const VolunteerDiplomaModal: React.FC<VolunteerDiplomaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  application,
  project,
}) => {
  if (!isOpen || !application) return null;

  const handlePrint = () => {
    window.print();
  };

  const hours = application.verifiedHours || application.hoursCommitted || 16;
  const certificateId = `VOL-CERT-${application.id.toUpperCase()}-${new Date().getFullYear()}`;
  const volunteerDisplayName = currentUser?.name || application.volunteerName;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 print:max-h-none print:shadow-none print:border-none print:m-0">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Diploma Oficial de Voluntariado • ISO 26000
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate Border Frame */}
        <div className="border-4 border-double border-emerald-700/40 p-6 md:p-8 rounded-xl text-center space-y-5 bg-radial from-white via-emerald-50/10 to-slate-50/20">
          {/* Header Seal */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-2 border-emerald-600 shadow-sm">
              <Award className="w-7 h-7" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
              Certificación de Aporte Ciudadano & Horas de Impacto Social
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 tracking-tight">
              DIPLOMA DE RECONOCIMIENTO
            </h2>
            <div className="text-xs text-slate-500 font-sans">
              Otorgado bajo los lineamientos de la Guía ISO 26000 de Responsabilidad Social
            </div>
          </div>

          <div className="text-sm text-slate-600">
            Se hace constar con orgullo y agradecimiento que:
          </div>

          {/* Recipient Name */}
          <div className="py-2 border-b-2 border-slate-300 max-w-md mx-auto">
            <span className="text-xl md:text-2xl font-bold font-serif text-slate-900">
              {application.volunteerName}
            </span>
          </div>

          {/* Statement */}
          <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Ha participado con excelencia y compromiso en calidad de voluntario en el rol de{' '}
            <strong className="text-slate-900 font-semibold">{application.roleTitle}</strong> dentro del proyecto{' '}
            <strong className="text-emerald-800 font-semibold">"{application.projectTitle}"</strong>, completando un total acreditado de:
          </p>

          {/* Big Hours Badge */}
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <Clock className="w-5 h-5 text-emerald-700" />
            <span className="text-2xl font-bold font-mono text-emerald-950">{hours} HORAS</span>
            <span className="text-xs font-semibold text-emerald-800">VERIFICADAS EN TERRENO</span>
          </div>

          {/* Competencies developed (Voluntare pattern) */}
          {project?.volunteerRoles[0]?.competenciesDeveloped && (
            <div className="pt-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Competencias blandas fortalecidas:</span>{' '}
              {project.volunteerRoles[0].competenciesDeveloped.join(' • ')}
            </div>
          )}

          {/* Signatures & QR Section */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 shrink-0">
                <QrCode className="w-8 h-8 text-slate-700" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-slate-500">CÓDIGO DE VALIDACIÓN</div>
                <div className="text-[11px] font-mono font-bold text-slate-800">{certificateId}</div>
                <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verificable en red Volunta
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="font-serif italic text-sm text-slate-800">Coordinación de Voluntariado</div>
              <div className="text-xs font-bold text-slate-900">{project?.organizationName || 'ONG Responsable'}</div>
              <div className="text-[10px] text-slate-500">Fecha: {new Date().toLocaleDateString('es-CO')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
