import 'dotenv/config';

export type Envs = {
  TOKEN: string;
  CLIENT_ID: string;

  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;

  NODE_ENV: string;
  LOG_LEVEL: string;

  APM_ENABLED: string;
  APM_SERVICE_NAME: string;
  APM_SERVER_URL: string;
};

export const envs = new Proxy<Envs>(process.env as unknown as Envs, {
  get(target: Envs, p: string | symbol) {
    return target[p as keyof Envs];
  },
});
