const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
  app: {
    defaultUserId:
      process.env.APP_DEFAULT_USER_ID ||
      '00000000-0000-0000-0000-000000000001',
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10) || 5432,
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'crypto_bot',
    synchronize: parseBoolean(
      process.env.DATABASE_SYNCHRONIZE,
      process.env.NODE_ENV !== 'production',
    ),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10) || 6379,
  },
  polygon: {
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    polygonscanApiKey: process.env.POLYGONSCAN_API_KEY || '',
    covalentApiKey: process.env.COVALENT_API_KEY || '',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
});
