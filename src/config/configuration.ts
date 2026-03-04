export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'crypto_bot',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
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
