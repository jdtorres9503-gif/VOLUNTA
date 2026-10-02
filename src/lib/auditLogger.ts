import { AuditLogEntry, User, UserRole } from '../types';

export function generateTraceId(): string {
  return 'trc_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export class AuditLogger {
  private static logs: AuditLogEntry[] = [];
  private static subscribers: Array<(logs: AuditLogEntry[]) => void> = [];

  public static initialize(initialLogs: AuditLogEntry[]) {
    this.logs = [...initialLogs];
  }

  public static log(params: {
    user: User | { id: string; name: string; role: UserRole };
    action: string;
    resourceType: AuditLogEntry['resourceType'];
    resourceId: string;
    severity?: AuditLogEntry['severity'];
    details?: Record<string, unknown>;
  }): AuditLogEntry {
    const entry: AuditLogEntry = {
      traceId: generateTraceId(),
      timestamp: new Date().toISOString(),
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      severity: params.severity || 'INFO',
      details: params.details || {},
      ipAddress: '190.144.15.22 (Bogotá, CO)', // Safe client/edge simulated IP
    };

    this.logs.unshift(entry);

    // Keep memory bounded to latest 200 logs
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(0, 200);
    }

    // Notify listeners
    this.subscribers.forEach((fn) => fn([...this.logs]));

    // In a production server, this prints as structured JSON for Pino / Datadog
    console.log(`[AUDIT:${entry.severity}] ${entry.action}`, JSON.stringify(entry));

    return entry;
  }

  public static getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  public static subscribe(callback: (logs: AuditLogEntry[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((fn) => fn !== callback);
    };
  }
}
