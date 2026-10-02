import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Building2,
  HeartHandshake,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  LayoutDashboard,
  Compass,
  Check,
  FileCode2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { User } from '../types';
import { INITIAL_USERS } from '../lib/mockData';
import { i18n, Language } from '../lib/i18n';
import { themeStore, Theme } from '../lib/theme';

interface NavbarProps {
  currentUser: User;
  activeView: 'LANDING' | 'APP';
  onNavigateView: (view: 'LANDING' | 'APP') => void;
  onSwitchUser: (user: User) => void;
  onResetData: () => void;
  onOpenPdr?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigateView,
  onSwitchUser,
  onResetData,
  onOpenPdr,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(i18n.getLanguage());
  const [currentTheme, setCurrentTheme] = useState<Theme>(themeStore.getTheme());

  useEffect(() => {
    const unsubLang = i18n.subscribe((lang) => setCurrentLang(lang));
    const unsubTheme = themeStore.subscribe((theme) => setCurrentTheme(theme));
    return () => {
      unsubLang();
      unsubTheme();
    };
  }, []);

  const handleLanguageChange = (lang: Language) => {
    i18n.setLanguage(lang);
    setLangDropdownOpen(false);
  };

  const getRoleDisplay = (role: User['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          label: i18n.t('role_super_admin'),
          color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
          icon: ShieldCheck,
        };
      case 'ONG_ADMIN':
        return {
          label: i18n.t('role_ong'),
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
          icon: HeartHandshake,
        };
      case 'EMPRESA_RSE':
        return {
          label: i18n.t('role_empresa'),
          color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
          icon: Building2,
        };
      case 'VOLUNTEER':
        return {
          label: i18n.t('role_voluntario'),
          color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
          icon: UserCheck,
        };
    }
  };

  const roleInfo = getRoleDisplay(currentUser.role);
  const RoleIcon = roleInfo.icon;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & View Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigateView('LANDING')}
              className="flex items-center gap-2.5 cursor-pointer text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  Volunta<span className="text-emerald-600">.</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Social Impact Marketplace
                </p>
              </div>
            </button>

            {/* Main Navigation Tabs (Landing vs Platform) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => onNavigateView('LANDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeView === 'LANDING'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{i18n.t('nav_landing')}</span>
              </button>

              <button
                onClick={() => onNavigateView('APP')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeView === 'APP'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{i18n.t('nav_dashboard')}</span>
              </button>
            </nav>
          </div>

          {/* Right actions: Language, Theme & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PDR Technical Review Button */}
            {onOpenPdr && (
              <button
                onClick={onOpenPdr}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer shadow-xs"
                title="Abrir Product Design Review (PDR) Técnico - Arquitectura & Demostración"
              >
                <FileCode2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>PDR Técnico</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors cursor-pointer shadow-xs"
                title="Cambiar idioma / Switch language"
              >
                <span className="text-sm">
                  {languages.find((l) => l.code === currentLang)?.flag}
                </span>
                <span className="hidden sm:inline uppercase font-bold text-[11px]">
                  {currentLang}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors cursor-pointer text-left ${
                        currentLang === l.code
                          ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {currentLang === l.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => themeStore.toggleTheme()}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors cursor-pointer shadow-xs"
              title={currentTheme === 'dark' ? i18n.t('nav_theme_light') : i18n.t('nav_theme_dark')}
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* PWA / Native Store Install Button */}
            <PWAInstallButton />

            {/* Enter Platform CTA (when on Landing) */}
            {activeView === 'LANDING' && (
              <button
                onClick={() => onNavigateView('APP')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <span>{i18n.t('nav_enter_platform')}</span>
              </button>
            )}

            {/* Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 shadow-xs transition-all cursor-pointer text-left"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {roleInfo.label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/80">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.organizationName || currentUser.email}
                    </div>
                    <div className="mt-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleInfo.color}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 py-1">
                      {i18n.t('nav_switch_profile')}
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto mt-1">
                      {INITIAL_USERS.map((user) => {
                        const uBadge = getRoleDisplay(user.role);
                        const isSelected = user.id === currentUser.id;

                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSwitchUser(user);
                              setProfileDropdownOpen(false);
                              onNavigateView('APP');
                            }}
                            className={`w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer ${
                              isSelected ? 'bg-emerald-50/80 dark:bg-emerald-950/40' : ''
                            }`}
                          >
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {user.name}
                                </span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"></span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {uBadge.label}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700/80 pt-2 px-3 space-y-1">
                    {onOpenPdr && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenPdr();
                        }}
                        className="w-full px-2.5 py-1.5 text-left flex items-center gap-2 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      >
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>PDR Técnico & Arquitectura</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (window.confirm('¿Deseas reiniciar los datos de demostración a su estado inicial?')) {
                          onResetData();
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-left flex items-center gap-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>{i18n.t('nav_reset_data')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
