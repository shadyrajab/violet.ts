import apm from 'elastic-apm-node';
import { envs } from '../config';

const APM_ENABLED = envs.APM_ENABLED === 'true';

if (APM_ENABLED) {
  apm.start({
    serviceName: envs.APM_SERVICE_NAME || 'violet-discord-bot',
    serverUrl: envs.APM_SERVER_URL || 'http://localhost:8200',
    environment: envs.NODE_ENV || 'production',
    active: true,
    captureBody: 'all',
    captureHeaders: true,
    logLevel: 'info',
    metricsInterval: '30s',
    transactionSampleRate: 1.0
  });
}

export { apm, APM_ENABLED };
