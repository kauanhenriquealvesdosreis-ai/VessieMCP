import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenvConfig();

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'testing', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().optional(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  JWT_SECRET: z.string().default('dev-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().default('dev-encryption-key-32chars!!'),
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  LOG_DIR: z.string().default('./logs'),
  LOG_MAX_SIZE: z.string().default('20m'),
  LOG_MAX_FILES: z.string().default('14d'),
  CACHE_TTL: z.coerce.number().default(3600),
  CACHE_MAX_SIZE: z.coerce.number().default(1000),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  CHROMA_URL: z.string().default('http://localhost:8000'),
  QDRANT_URL: z.string().default('http://localhost:6333'),
  TELEMETRY_ENABLED: z.coerce.boolean().default(true),
  OTEL_EXPORTER_JAEGER_ENDPOINT: z.string().default('http://localhost:14268/api/traces'),
  PROMETHEUS_PORT: z.coerce.number().default(9090),
  PLUGINS_DIR: z.string().default('./plugins'),
  PLUGIN_AUTO_LOAD: z.coerce.boolean().default(true),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  MCP_SERVER_NAME: z.string().default('vessie-mcp'),
  MCP_SERVER_VERSION: z.string().default('2.0.0'),
  MCP_TRANSPORT: z.enum(['stdio', 'http', 'websocket', 'sse']).default('stdio'),
  MCP_HTTP_PORT: z.coerce.number().default(3001),
  MCP_WS_PORT: z.coerce.number().default(3002),
});

type Config = z.infer<typeof ConfigSchema>;

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    const result = ConfigSchema.safeParse(process.env);
    if (!result.success) {
      console.error('Configuration validation errors:', result.error.flatten());
      throw new Error(`Configuration validation failed: ${result.error.message}`);
    }
    this.config = result.data;
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get<T extends keyof Config>(key: T): Config[T] {
    return this.config[key];
  }

  getAll(): Config {
    return this.config;
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isTesting(): boolean {
    return this.config.NODE_ENV === 'testing';
  }

  reload(): void {
    const result = ConfigSchema.safeParse(process.env);
    if (result.success) {
      this.config = result.data;
    }
  }
}

export const config = ConfigManager.getInstance();
export { ConfigManager };
export type { Config };
</arg_value></tool_call>