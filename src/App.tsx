import React, { useEffect, useState } from 'react';
import { dataStore } from './lib/dataStore';
import { AuditLogEntry, Organization, Project, SponsorshipIntent, User, VolunteerApplication, UserRole } from './types';
import { INITIAL_USERS } from './lib/mockData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SuperAdminView } from './components/SuperAdminView';
import { OngView } from './components/OngView';
import { EmpresaView } from './components/EmpresaView';
import { VoluntarioView } from './components/VoluntarioView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { PrivacyRightsModal } from './components/PrivacyRightsModal';
import { PdrTechnicalViewerModal } from './components/PdrTechnicalViewerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { i18n, Language } from './lib/i18n';
import { themeStore, Theme } from './lib/theme';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'LANDING' | 'APP'>('LANDING');
  const [currentUser, setCurrentUser] = useState<User>(dataStore.getCurrentUser());
  const [organizations, setOrganizations] = useState<Organization[]>(dataStore.getOrganizations());
  const [projects, setProjects] = useState<Project[]>(dataStore.getProjectsForCurrentContext());
  const [sponsorships, setSponsorships] = useState<SponsorshipIntent[]>(dataStore.getSponsorshipsForCurrentContext());
  const [applications, setApplications] = useState<VolunteerApplication[]>(dataStore.getApplicationsForCurrentContext());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Modals
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [isGlobalPrivacyOpen, setIsGlobalPrivacyOpen] = useState<boolean>(false);
  const [isPdrModalOpen, setIsPdrModalOpen] = useState<boolean>(false);
  const [empresaInitialTab, setEmpresaInitialTab] = useState<'MARKETPLACE' | 'MY_SPONSORSHIPS' | 'CORPORATE_VOLUNTEERING' | 'PRO_BONO_COMPLIANCE'>('MARKETPLACE');

  // i18n & Theme reactivity
  const [, setLangState] = useState<Language>(i18n.getLanguage());
  const [, setThemeState] = useState<Theme>(themeStore.getTheme());

  useEffect(() => {
    const unsubLang = i18n.subscribe((lang) => setLangState(lang));
    const unsubTheme = themeStore.subscribe((theme) => setThemeState(theme));

    const updateState = () => {
      const user = dataStore.getCurrentUser();
      setCurrentUser(user);
      setOrganizations(dataStore.getOrganizations());
      setProjects(dataStore.getProjectsForCurrentContext());
      setSponsorships(dataStore.getSponsorshipsForCurrentContext());
      setApplications(dataStore.getApplicationsForCurrentContext());
      setAuditLogs(dataStore.getAuditLogs());
    };

    updateState();
    const unsubscribeStore = dataStore.subscribe(() => {
      updateState();
    });

    return () => {
      unsubLang();
      unsubTheme();
      unsubscribeStore();
    };
  }, [currentUser.id]);

  const handleSwitchUser = (newUser: User) => {
    dataStore.setCurrentUser(newUser);
    // Notify full-stack backend
    fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newUser.role }),
    }).catch(() => {});
  };

  const handleEnterPlatform = (
    targetRole?: UserRole,
    initialTab?: 'MARKETPLACE' | 'MY_SPONSORSHIPS' | 'CORPORATE_VOLUNTEERING' | 'PRO_BONO_COMPLIANCE'
  ) => {
    if (targetRole && currentUser.role !== targetRole) {
      const targetUser = INITIAL_USERS.find((u) => u.role === targetRole);
      if (targetUser) {
        dataStore.setCurrentUser(targetUser);
      }
    }
    if (initialTab) {
      setEmpresaInitialTab(initialTab);
    }
    setActiveView('APP');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetData = () => {
    dataStore.resetToFactory();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950 selection:text-emerald-900 dark:selection:text-emerald-300 transition-colors duration-200">
      {/* Top Clean Navigation Header */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigateView={(view) => setActiveView(view)}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        onOpenPdr={() => setIsPdrModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'LANDING' ? (
          <LandingPage
            projects={projects}
            currentUser={currentUser}
            onEnterPlatform={handleEnterPlatform}
            onOpenProjectDetail={(p) => setSelectedProjectForDetail(p)}
          />
        ) : (
          <div className="animate-in fade-in duration-200">
            {currentUser.role === 'SUPER_ADMIN' && (
              <SuperAdminView
                organizations={organizations}
                projects={projects}
                auditLogs={auditLogs}
                onOpenProjectDetail={(p) => setSelectedProjectForDetail(p)}
              />
            )}

            {currentUser.role === 'ONG_ADMIN' && (
              <OngView
                currentUser={currentUser}
                projects={projects}
                sponsorships={sponsorships}
                applications={applications}
                onOpenProjectDetail={(p) => setSelectedProjectForDetail(p)}
              />
            )}

            {currentUser.role === 'EMPRESA_RSE' && (
              <EmpresaView
                currentUser={currentUser}
                projects={projects}
                sponsorships={sponsorships}
                onOpenProjectDetail={(p) => setSelectedProjectForDetail(p)}
                initialTab={empresaInitialTab}
              />
            )}

            {currentUser.role === 'VOLUNTEER' && (
              <VoluntarioView
                currentUser={currentUser}
                projects={projects}
                applications={applications}
                onOpenProjectDetail={(p) => setSelectedProjectForDetail(p)}
              />
            )}
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      {selectedProjectForDetail && (
        <ProjectDetailModal
          project={selectedProjectForDetail}
          currentUser={currentUser}
          onClose={() => setSelectedProjectForDetail(null)}
          onActionTrigger={(action, project) => {
            setSelectedProjectForDetail(null);
            if (action === 'SPONSOR') {
              handleEnterPlatform('EMPRESA_RSE');
            } else if (action === 'VOLUNTEER') {
              handleEnterPlatform('VOLUNTEER');
            }
          }}
        />
      )}

      {/* Clean, Modern Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 mt-16 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  Volunta<span className="text-emerald-600">.</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {i18n.t('footer_tagline')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
              <button
                onClick={() => setActiveView('LANDING')}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
              >
                {i18n.t('nav_landing')}
              </button>
              <button
                onClick={() => setActiveView('APP')}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
              >
                {i18n.t('nav_dashboard')}
              </button>
              <button
                onClick={() => setIsGlobalPrivacyOpen(true)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left"
              >
                {i18n.t('footer_privacy')}
              </button>
              <button
                onClick={() => setIsPdrModalOpen(true)}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer text-left flex items-center gap-1"
              >
                <span>PDR Técnico</span>
              </button>
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">
                {i18n.t('footer_terms')}
              </span>
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">
                {i18n.t('footer_contact')}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <div>
              © {new Date().getFullYear()} Volunta. {i18n.t('footer_rights')}
            </div>

            <div className="flex items-center gap-1.5">
              <span>Impacto social y ambiental articulado con transparencia</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </div>
          </div>
        </div>
      </footer>

      {/* Global Privacy & ARCO Rights Modal */}
      <PrivacyRightsModal
        isOpen={isGlobalPrivacyOpen}
        onClose={() => setIsGlobalPrivacyOpen(false)}
        currentUser={currentUser}
      />

      {/* Technical PDR Review & Architecture Modal */}
      <PdrTechnicalViewerModal
        isOpen={isPdrModalOpen}
        onClose={() => setIsPdrModalOpen(false)}
      />

      {/* Connectivity & Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
