import {
  Project,
  SponsorshipIntent,
  User,
  CorporateTeamBooking,
  ProBonoDeliverable,
  CryptographicAuditBlock,
  JurisdictionCountry,
} from '../types';

const API_BASE = '/api';

class VoluntaApiClient {
  private token: string | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem('volunta_auth_token');
    } catch {
      this.token = null;
    }
  }

  public setToken(token: string) {
    this.token = token;
    try {
      localStorage.setItem('volunta_auth_token', token);
    } catch {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Health
  public async getHealth() {
    return this.request<{ status: string; version: string; entitiesCount: any }>('/health');
  }

  // Auth
  public async login(email?: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    this.setToken(res.token);
    return res;
  }

  public async switchRole(role: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<{ user: User; authenticated: boolean }> {
    return this.request<{ user: User; authenticated: boolean }>('/auth/me');
  }

  // Projects
  public async getProjects(params?: { country?: string; category?: string; ods?: string | number; search?: string }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.country) query.set('country', params.country);
    if (params?.category) query.set('category', params.category);
    if (params?.ods) query.set('ods', String(params.ods));
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    const res = await this.request<{ count: number; data: Project[] }>(`/projects${qs ? `?${qs}` : ''}`);
    return res.data;
  }

  public async getProjectById(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  public async createProject(project: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  // Sponsorships
  public async getSponsorships(params?: { organizationId?: string; currency?: string }): Promise<SponsorshipIntent[]> {
    const query = new URLSearchParams();
    if (params?.organizationId) query.set('organizationId', params.organizationId);
    if (params?.currency) query.set('currency', params.currency);

    const qs = query.toString();
    const res = await this.request<{ count: number; data: SponsorshipIntent[] }>(`/sponsorships${qs ? `?${qs}` : ''}`);
    return res.data;
  }

  public async createSponsorship(data: Partial<SponsorshipIntent>): Promise<SponsorshipIntent> {
    return this.request<SponsorshipIntent>('/sponsorships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async requestTaxCertificate(sponsorshipId: string): Promise<any> {
    return this.request<any>(`/sponsorships/${sponsorshipId}/certificate`, {
      method: 'POST',
    });
  }

  // Deliverables
  public async getDeliverables(params?: { status?: string; volunteerId?: string; projectId?: string }): Promise<ProBonoDeliverable[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.volunteerId) query.set('volunteerId', params.volunteerId);
    if (params?.projectId) query.set('projectId', params.projectId);

    const qs = query.toString();
    const res = await this.request<{ count: number; data: ProBonoDeliverable[] }>(`/deliverables${qs ? `?${qs}` : ''}`);
    return res.data;
  }

  public async createDeliverable(data: Partial<ProBonoDeliverable>): Promise<ProBonoDeliverable> {
    return this.request<ProBonoDeliverable>('/deliverables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async approveDeliverable(id: string, country: JurisdictionCountry = 'CO'): Promise<any> {
    return this.request<any>(`/deliverables/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ country }),
    });
  }

  // Corporate Bookings
  public async getCorporateBookings(params?: { companyName?: string; projectId?: string }): Promise<CorporateTeamBooking[]> {
    const query = new URLSearchParams();
    if (params?.companyName) query.set('companyName', params.companyName);
    if (params?.projectId) query.set('projectId', params.projectId);

    const qs = query.toString();
    const res = await this.request<{ count: number; data: CorporateTeamBooking[] }>(`/corporate-bookings${qs ? `?${qs}` : ''}`);
    return res.data;
  }

  public async createCorporateBooking(data: Partial<CorporateTeamBooking>): Promise<CorporateTeamBooking> {
    return this.request<CorporateTeamBooking>('/corporate-bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Compliance
  public async getComplianceMetrics(country: JurisdictionCountry | 'ALL' = 'ALL') {
    return this.request<{ country: string; currency: string; metrics: any; standards: any }>(
      `/compliance/metrics?country=${country}`
    );
  }

  public async getAuditBlocks(): Promise<CryptographicAuditBlock[]> {
    const res = await this.request<{ count: number; data: CryptographicAuditBlock[] }>('/compliance/audit-blocks');
    return res.data;
  }
}

export const apiClient = new VoluntaApiClient();
