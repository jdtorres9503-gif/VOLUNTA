export type Language = 'es' | 'en' | 'pt';

export interface Translations {
  // Navigation
  nav_landing: string;
  nav_dashboard: string;
  nav_explore: string;
  nav_switch_profile: string;
  nav_theme_light: string;
  nav_theme_dark: string;
  nav_enter_platform: string;
  nav_reset_data: string;

  // Roles
  role_super_admin: string;
  role_ong: string;
  role_empresa: string;
  role_voluntario: string;

  // Landing Hero
  hero_badge: string;
  hero_empresa_title: string;
  hero_empresa_sub: string;
  hero_empresa_cta1: string;
  hero_empresa_cta2: string;

  hero_ong_title: string;
  hero_ong_sub: string;
  hero_ong_cta1: string;
  hero_ong_cta2: string;

  hero_voluntario_title: string;
  hero_voluntario_sub: string;
  hero_voluntario_cta1: string;
  hero_voluntario_cta2: string;

  // Role selector tabs
  tab_for_companies: string;
  tab_for_ongs: string;
  tab_for_volunteers: string;

  // Value props
  prop_empresa_1_title: string;
  prop_empresa_1_desc: string;
  prop_empresa_2_title: string;
  prop_empresa_2_desc: string;
  prop_empresa_3_title: string;
  prop_empresa_3_desc: string;

  prop_ong_1_title: string;
  prop_ong_1_desc: string;
  prop_ong_2_title: string;
  prop_ong_2_desc: string;
  prop_ong_3_title: string;
  prop_ong_3_desc: string;

  prop_voluntario_1_title: string;
  prop_voluntario_1_desc: string;
  prop_voluntario_2_title: string;
  prop_voluntario_2_desc: string;
  prop_voluntario_3_title: string;
  prop_voluntario_3_desc: string;

  // Stats
  stat_funds_label: string;
  stat_funds_sub: string;
  stat_hours_label: string;
  stat_hours_sub: string;
  stat_ods_label: string;
  stat_ods_sub: string;
  stat_projects_label: string;
  stat_projects_sub: string;

  // Showcase
  showcase_title: string;
  showcase_sub: string;
  showcase_all: string;
  showcase_sponsor_btn: string;
  showcase_apply_btn: string;
  showcase_view_details: string;

  // How it works
  how_title: string;
  how_sub: string;
  how_step1_title: string;
  how_step1_desc: string;
  how_step2_title: string;
  how_step2_desc: string;
  how_step3_title: string;
  how_step3_desc: string;

  // CTA Banner
  cta_banner_title: string;
  cta_banner_sub: string;
  cta_banner_btn: string;

  // Footer
  footer_tagline: string;
  footer_rights: string;
  footer_privacy: string;
  footer_terms: string;
  footer_contact: string;
}

export const translations: Record<Language, Translations> = {
  es: {
    nav_landing: 'Inicio',
    nav_dashboard: 'Plataforma',
    nav_explore: 'Explorar Proyectos',
    nav_switch_profile: 'Cambiar Perfil',
    nav_theme_light: 'Modo Claro',
    nav_theme_dark: 'Modo Oscuro',
    nav_enter_platform: 'Ingresar a la Plataforma',
    nav_reset_data: 'Reiniciar demo',

    role_super_admin: 'Administrador Global',
    role_ong: 'Organización Social (ONG)',
    role_empresa: 'Empresa Aliada (RSE / ESG)',
    role_voluntario: 'Voluntario Activo',

    hero_badge: 'Ecosistema de Impacto Social Verificado',
    hero_empresa_title: 'Inversión Social Estratégica con Métricas ESG Verificables',
    hero_empresa_sub: 'Conectamos a tu compañía con proyectos auditados, reportes de sostenibilidad compatibles con GRI y jornadas de voluntariado corporativo con matching gifts.',
    hero_empresa_cta1: 'Entrar como Empresa Aliada',
    hero_empresa_cta2: 'Explorar Proyectos a Patrocinar',

    hero_ong_title: 'Financia tus Causas y Conecta con Voluntarios Calificados',
    hero_ong_sub: 'Publica iniciativas sociales y ambientales, recibe patrocinios empresariales transparentes y coordina cuadrillas de voluntarios corporativos e individuales.',
    hero_ong_cta1: 'Entrar como Organización Social',
    hero_ong_cta2: 'Publicar una Convocatoria',

    hero_voluntario_title: 'Transforma tu Tiempo y Talento en Huella Positiva',
    hero_voluntario_sub: 'Participa en proyectos presenciales o remotos, desarrolla competencias clave de liderazgo y recibe constancias de horas acreditadas bajo la guía ISO 26000.',
    hero_voluntario_cta1: 'Entrar como Voluntario',
    hero_voluntario_cta2: 'Ver Oportunidades Abiertas',

    tab_for_companies: 'Para Empresas (RSE)',
    tab_for_ongs: 'Para ONGs & Fundaciones',
    tab_for_volunteers: 'Para Voluntarios',

    prop_empresa_1_title: 'Reportes ESG y Métricas SROI',
    prop_empresa_1_desc: 'Genera informes ejecutivos de sostenibilidad con cálculo de retorno social de la inversión y reducción de CO₂.',
    prop_empresa_2_title: 'Voluntariado en Cuadrillas',
    prop_empresa_2_desc: 'Moviliza equipos de colaboradores en jornadas coordinadas en terreno con logística garantizada.',
    prop_empresa_3_title: 'Matching Gifts / Dollars for Doers',
    prop_empresa_3_desc: 'Multiplica el impacto donando fondos adicionales por cada hora que tus colaboradores aporten.',

    prop_ong_1_title: 'Patrocinios Directos Transparentes',
    prop_ong_1_desc: 'Recibe compromisos financieros formales en COP o USD directamente de corporaciones aliadas.',
    prop_ong_2_title: 'Gestión Integral de Postulaciones',
    prop_ong_2_desc: 'Revisa perfiles, acepta voluntarios, emite horas y certifica diplomas oficiales con un clic.',
    prop_ong_3_title: 'Alineación con los 17 ODS',
    prop_ong_3_desc: 'Posiciona tus iniciativas con indicadores cuantificables y validación institucional de alto estándar.',

    prop_voluntario_1_title: 'Diploma Oficial ISO 26000',
    prop_voluntario_1_desc: 'Obtén constancias verificadas con código QR y desglose de competencias blandas adquiridas.',
    prop_voluntario_2_title: 'Modalidades Flexibles',
    prop_voluntario_2_desc: 'Filtra oportunidades en terreno, 100% virtuales o híbridas según tu disponibilidad y ciudad.',
    prop_voluntario_3_title: 'Póliza de Seguro y Capacitación',
    prop_voluntario_3_desc: 'Participa con total tranquilidad gracias a inducciones previas y cobertura en actividades presenciales.',

    stat_funds_label: '+$120M COP',
    stat_funds_sub: 'Fondos de Inversión Social Comprometidos',
    stat_hours_label: '+3,850 hrs',
    stat_hours_sub: 'Horas de Voluntariado Certificadas',
    stat_ods_label: '17 ODS',
    stat_ods_sub: 'Objetivos de las Naciones Unidas',
    stat_projects_label: '100%',
    stat_projects_sub: 'Proyectos Verificados y Auditados',

    showcase_title: 'Iniciativas Destacadas en Marcha',
    showcase_sub: 'Descubre proyectos validados listos para recibir patrocinio o voluntarios en Colombia y la región.',
    showcase_all: 'Ver todas las causas',
    showcase_sponsor_btn: 'Patrocinar',
    showcase_apply_btn: 'Postularme',
    showcase_view_details: 'Ver detalles completos',

    how_title: '¿Cómo funciona Volunta?',
    how_sub: 'Un modelo tripartito donde organizaciones, empresas y personas colaboran sin intermediarios opacos.',
    how_step1_title: '1. Publicación y Validación',
    how_step1_desc: 'Las organizaciones sociales publican iniciativas alineadas a los ODS con metas transparentes.',
    how_step2_title: '2. Alianzas y Voluntariado',
    how_step2_desc: 'Las empresas financian causas y envían equipos de trabajo; los voluntarios donan su talento.',
    how_step3_title: '3. Medición y Certificación',
    how_step3_desc: 'Se auditan las horas en terreno, se generan reportes de impacto ESG y se emiten diplomas oficiales.',

    cta_banner_title: '¿Listo para amplificar tu impacto social?',
    cta_banner_sub: 'Únete a las empresas, fundaciones y personas que están liderando la transformación comunitaria y ambiental.',
    cta_banner_btn: 'Comenzar Ahora',

    footer_tagline: 'Plataforma para la articulación de inversión social, voluntariado corporativo y causas ciudadanas.',
    footer_rights: 'Todos los derechos reservados.',
    footer_privacy: 'Privacidad & Tratamiento de Datos',
    footer_terms: 'Términos de Servicio',
    footer_contact: 'Contacto & Soporte',
  },

  en: {
    nav_landing: 'Home',
    nav_dashboard: 'Platform',
    nav_explore: 'Explore Projects',
    nav_switch_profile: 'Switch Profile',
    nav_theme_light: 'Light Mode',
    nav_theme_dark: 'Dark Mode',
    nav_enter_platform: 'Enter Platform',
    nav_reset_data: 'Reset demo',

    role_super_admin: 'Global Administrator',
    role_ong: 'Nonprofit Organization (NGO)',
    role_empresa: 'Corporate Partner (CSR / ESG)',
    role_voluntario: 'Active Volunteer',

    hero_badge: 'Verified Social Impact Ecosystem',
    hero_empresa_title: 'Strategic Social Investment with Verifiable ESG Metrics',
    hero_empresa_sub: 'Connect your company with audited community projects, GRI-aligned sustainability reporting, and corporate team volunteering with matching gifts.',
    hero_empresa_cta1: 'Enter as Corporate Partner',
    hero_empresa_cta2: 'Explore Projects to Sponsor',

    hero_ong_title: 'Fund Your Causes & Engage Skilled Volunteers',
    hero_ong_sub: 'Publish social and environmental initiatives, receive transparent corporate sponsorships, and coordinate dedicated teams of volunteers.',
    hero_ong_cta1: 'Enter as Nonprofit',
    hero_ong_cta2: 'Post a New Project',

    hero_voluntario_title: 'Turn Your Time & Skills into Positive Impact',
    hero_voluntario_sub: 'Join on-site or remote volunteer missions, build key leadership competencies, and earn accredited hour certificates under ISO 2600 guide.',
    hero_voluntario_cta1: 'Enter as Volunteer',
    hero_voluntario_cta2: 'View Open Opportunities',

    tab_for_companies: 'For Companies (CSR)',
    tab_for_ongs: 'For NGOs & Foundations',
    tab_for_volunteers: 'For Volunteers',

    prop_empresa_1_title: 'ESG Reports & SROI Metrics',
    prop_empresa_1_desc: 'Generate executive sustainability reports with calculated social return on investment and CO₂ mitigation.',
    prop_empresa_2_title: 'Team Volunteering Squads',
    prop_empresa_2_desc: 'Mobilize employee groups in curated on-site field days with end-to-end coordinated logistics.',
    prop_empresa_3_title: 'Matching Gifts / Dollars for Doers',
    prop_empresa_3_desc: 'Multiply your impact by contributing matching funds for every volunteer hour your employees contribute.',

    prop_ong_1_title: 'Direct & Transparent Funding',
    prop_ong_1_desc: 'Receive formal sponsorship commitments in COP or USD directly from trusted corporate partners.',
    prop_ong_2_title: 'Streamlined Volunteer Management',
    prop_ong_2_desc: 'Review applicants, approve volunteers, log field hours, and issue official certificates with one click.',
    prop_ong_3_title: '17 UN SDGs Alignment',
    prop_ong_3_desc: 'Position your initiatives with clear measurable indicators and high-standard institutional validation.',

    prop_voluntario_1_title: 'Official ISO 26000 Diploma',
    prop_voluntario_1_desc: 'Earn QR-verified credentials detailing your verified hours and professional soft skills acquired.',
    prop_voluntario_2_title: 'Flexible Modalities',
    prop_voluntario_2_desc: 'Filter opportunities by on-site field work, 100% remote, or hybrid formats tailored to your schedule.',
    prop_voluntario_3_title: 'Volunteer Insurance & Training',
    prop_voluntario_3_desc: 'Participate with peace of mind thanks to prior induction briefings and field activity coverage.',

    stat_funds_label: '+$120M COP',
    stat_funds_sub: 'Committed Corporate Social Funds',
    stat_hours_label: '+3,850 hrs',
    stat_hours_sub: 'Certified Volunteer Field Hours',
    stat_ods_label: '17 SDGs',
    stat_ods_sub: 'UN Sustainable Development Goals',
    stat_projects_label: '100%',
    stat_projects_sub: 'Audited & Verified Initiatives',

    showcase_title: 'Featured High-Impact Projects',
    showcase_sub: 'Discover verified causes ready for corporate sponsorship or passionate volunteer hands.',
    showcase_all: 'View all causes',
    showcase_sponsor_btn: 'Sponsor',
    showcase_apply_btn: 'Apply Now',
    showcase_view_details: 'View full details',

    how_title: 'How Volunta Works',
    how_sub: 'A tri-sided ecosystem where non-profits, enterprises, and people collaborate transparently.',
    how_step1_title: '1. Publish & Verify',
    how_step1_desc: 'Non-profit organizations post SDG-aligned causes with transparent funding and volunteer goals.',
    how_step2_title: '2. Partner & Volunteer',
    how_step2_desc: 'Enterprises sponsor funds and dispatch squads; individual volunteers contribute skills.',
    how_step3_title: '3. Measure & Certify',
    how_step3_desc: 'Field hours are authenticated, ESG impact reports are compiled, and verified diplomas are issued.',

    cta_banner_title: 'Ready to amplify your social footprint?',
    cta_banner_sub: 'Join forward-thinking companies, non-profits, and volunteers transforming communities and ecosystems.',
    cta_banner_btn: 'Get Started Today',

    footer_tagline: 'Platform uniting social investments, corporate volunteering, and civic action.',
    footer_rights: 'All rights reserved.',
    footer_privacy: 'Privacy & Data Policy',
    footer_terms: 'Terms of Service',
    footer_contact: 'Contact & Support',
  },

  pt: {
    nav_landing: 'Início',
    nav_dashboard: 'Plataforma',
    nav_explore: 'Explorar Projetos',
    nav_switch_profile: 'Alternar Perfil',
    nav_theme_light: 'Modo Claro',
    nav_theme_dark: 'Modo Escuro',
    nav_enter_platform: 'Acessar Plataforma',
    nav_reset_data: 'Reiniciar demo',

    role_super_admin: 'Administrador Global',
    role_ong: 'Organização Social (ONG)',
    role_empresa: 'Empresa Parceira (RSE / ESG)',
    role_voluntario: 'Voluntário Ativo',

    hero_badge: 'Ecossistema de Impacto Social Verificado',
    hero_empresa_title: 'Investimento Social Estratégico com Métricas ESG Verificáveis',
    hero_empresa_sub: 'Conectamos sua empresa a projetos auditados, relatórios de sustentabilidade compatíveis com GRI e jornadas de voluntariado corporativo com matching gifts.',
    hero_empresa_cta1: 'Entrar como Empresa',
    hero_empresa_cta2: 'Explorar Projetos para Apoiar',

    hero_ong_title: 'Financie suas Causas e Conecte-se com Voluntários Qualificados',
    hero_ong_sub: 'Publique iniciativas socioambientais, receba patrocínios corporativos transparentes e coordene equipes de voluntários dedicados.',
    hero_ong_cta1: 'Entrar como Organização',
    hero_ong_cta2: 'Publicar Novo Projeto',

    hero_voluntario_title: 'Transforme seu Tempo e Talento em Impacto Positivo',
    hero_voluntario_sub: 'Participe de missões presenciais ou remotas, desenvolva competências de liderança e receba certificados de horas creditadas sob a norma ISO 26000.',
    hero_voluntario_cta1: 'Entrar como Voluntário',
    hero_voluntario_cta2: 'Ver Vagas Abertas',

    tab_for_companies: 'Para Empresas (RSE)',
    tab_for_ongs: 'Para ONGs & Fundações',
    tab_for_volunteers: 'Para Voluntários',

    prop_empresa_1_title: 'Relatórios ESG e Métricas SROI',
    prop_empresa_1_desc: 'Gere relatórios executivos de sustentabilidade com cálculo de retorno social do investimento e redução de CO₂.',
    prop_empresa_2_title: 'Voluntariado em Equipes',
    prop_empresa_2_desc: 'Mobilize grupos de colaboradores em dias de ação de campo com logística totalmente coordenada.',
    prop_empresa_3_title: 'Matching Gifts / Dollars for Doers',
    prop_empresa_3_desc: 'Multiplique seu impacto doando recursos adicionais para cada hora voluntariada pelos colaboradores.',

    prop_ong_1_title: 'Financiamento Direto e Transparente',
    prop_ong_1_desc: 'Receba compromissos financeiros formais em COP ou USD diretamente de empresas parceiras.',
    prop_ong_2_title: 'Gestão Completa de Inscrições',
    prop_ong_2_desc: 'Analise candidatos, aprove voluntários, registre horas e emita certificados oficiais com um clique.',
    prop_ong_3_title: 'Alinhamento com os 17 ODS',
    prop_ong_3_desc: 'Posicione seus projetos com metas mensuráveis e alta credibilidade institucional.',

    prop_voluntario_1_title: 'Diploma Oficial ISO 26000',
    prop_voluntario_1_desc: 'Receba certificados com código QR e histórico de competências socioemocionais adquiridas.',
    prop_voluntario_2_title: 'Modalidades Flexíveis',
    prop_voluntario_2_desc: 'Filtre vagas presenciais, 100% remotas ou híbridas de acordo com sua disponibilidade.',
    prop_voluntario_3_title: 'Seguro de Voluntariado e Treinamento',
    prop_voluntario_3_desc: 'Participe com segurança graças a capacitações prévias e apólice de cobertura em campo.',

    stat_funds_label: '+$120M COP',
    stat_funds_sub: 'Recursos de Investimento Social Comprometidos',
    stat_hours_label: '+3.850 hrs',
    stat_hours_sub: 'Horas de Voluntariado Certificadas',
    stat_ods_label: '17 ODS',
    stat_ods_sub: 'Objetivos de Desenvolvimento Sustentável',
    stat_projects_label: '100%',
    stat_projects_sub: 'Projetos Verificados e Auditados',

    showcase_title: 'Iniciativas em Destaque',
    showcase_sub: 'Conheça causas auditadas prontas para receber apoio corporativo ou mãos voluntárias.',
    showcase_all: 'Ver todas as causas',
    showcase_sponsor_btn: 'Apoiar',
    showcase_apply_btn: 'Candidatar-se',
    showcase_view_details: 'Ver detalhes',

    how_title: 'Como Funciona a Volunta',
    how_sub: 'Um ecossistema colaborativo onde ONGs, empresas e pessoas se conectam com transparência.',
    how_step1_title: '1. Publicação e Validação',
    how_step1_desc: 'Organizações postam iniciativas alinhadas aos ODS com objetivos claros de financiamento e voluntariado.',
    how_step2_title: '2. Parcerias e Voluntariado',
    how_step2_desc: 'Empresas financiam causas e engajam colaboradores; voluntários dedicam tempo e talento.',
    how_step3_title: '3. Medição e Certificação',
    how_step3_desc: 'Horas em campo são verificadas, relatórios ESG são gerados e diplomas oficiais são emitidos.',

    cta_banner_title: 'Pronto para potencializar seu impacto social?',
    cta_banner_sub: 'Junte-se a empresas, fundações e voluntários que estão transformando comunidades e o meio ambiente.',
    cta_banner_btn: 'Começar Agora',

    footer_tagline: 'Plataforma para articulação de investimento social, voluntariado corporativo e causas cidadãs.',
    footer_rights: 'Todos os direitos reservados.',
    footer_privacy: 'Privacidade & Dados',
    footer_terms: 'Termos de Serviço',
    footer_contact: 'Contato & Suporte',
  },
};

const LANG_STORAGE_KEY = 'volunta_lang';

let currentLanguage: Language = 'es';

try {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved === 'es' || saved === 'en' || saved === 'pt') {
    currentLanguage = saved;
  }
} catch {
  // Ignore storage error
}

type LangListener = (lang: Language) => void;
const listeners: LangListener[] = [];

export const i18n = {
  getLanguage: (): Language => currentLanguage,
  setLanguage: (lang: Language) => {
    currentLanguage = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
    listeners.forEach((fn) => fn(lang));
  },
  t: (key: keyof Translations): string => {
    return translations[currentLanguage][key] || translations.es[key] || '';
  },
  subscribe: (fn: LangListener) => {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },
};
