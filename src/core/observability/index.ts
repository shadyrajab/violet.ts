import { apm, APM_ENABLED } from '../apm';

export class Observability {
  static startTransaction(name: string, type: string = 'request') {
    if (!APM_ENABLED) return null;
    return apm.startTransaction(name, type);
  }

  static startSpan(name: string, type?: string, subtype?: string, action?: string) {
    if (!APM_ENABLED) return null;
    return apm.startSpan(name, type ?? null, subtype ?? null, action ?? null);
  }

  static captureError(error: Error | string, context?: Record<string, unknown>) {
    if (!APM_ENABLED) return;
    apm.captureError(error, context);
  }

  static setTransactionName(name: string) {
    if (!APM_ENABLED) return;
    const transaction = apm.currentTransaction;
    if (transaction) {
      transaction.name = name;
    }
  }

  static addLabels(labels: Record<string, string | number | boolean>) {
    if (!APM_ENABLED) return;
    const transaction = apm.currentTransaction;
    if (transaction) {
      transaction.addLabels(labels);
    }
  }

  static setUser(user: { id: string; username?: string; email?: string }) {
    if (!APM_ENABLED) return;
    apm.setUserContext(user);
  }

  static getTraceIds(): { traceId?: string; transactionId?: string } {
    if (!APM_ENABLED) return {};

    const transaction = apm.currentTransaction;
    if (!transaction) return {};

    return {
      traceId: transaction.traceparent,
      transactionId: transaction.ids['transaction.id']
    };
  }

  static async executeWithSpan<T>(
    name: string,
    fn: () => Promise<T>,
    type?: string,
    subtype?: string,
    action?: string
  ): Promise<T> {
    const span = this.startSpan(name, type, subtype, action);
    try {
      const result = await fn();
      if (span) span.end();
      return result;
    } catch (error) {
      if (span) {
        span.end();
      }
      throw error;
    }
  }

  static executeWithSpanSync<T>(
    name: string,
    fn: () => T,
    type?: string,
    subtype?: string,
    action?: string
  ): T {
    const span = this.startSpan(name, type, subtype, action);
    try {
      const result = fn();
      if (span) span.end();
      return result;
    } catch (error) {
      if (span) {
        span.end();
      }
      throw error;
    }
  }
}

export { APM_ENABLED };
