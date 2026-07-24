/**
 * Tipos globais do VessieMCP
 */

// === MCP Types ===

export interface MCPTool {
  name: string;
  description: string;
  category: string;
  permissions: string[];
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  version: string;
  rateLimit?: {
    max: number;
    windowMs: number;
  };
  timeout?: number;
  cacheable?: boolean;
  cacheTTL?: number;
  handler: (args: Record<string, unknown>) => Promise<MCPToolResult>;
}

export interface MCPToolResult {
  content: Array<{
    type: string;
    text?: string;
    data?: unknown;
  }>;
  isError?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  template?: string;
  category: string;
  permissions: string[];
  handler: (uri: string) => Promise<MCPResourceResult>;
}

export interface MCPResourceResult {
  contents: Array<{
    uri: string;
    text?: string;
    blob?: string;
    mimeType?: string;
  }>;
  metadata?: Record<string, unknown>;
}

export interface MCPPrompt {
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  arguments: MCPPromptArgument[];
  template: string;
  variables: string[];
  handler: (args: Record<string, unknown>) => Promise<MCPPromptResult>;
}

export interface MCPPromptArgument {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

export interface MCPPromptResult {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  metadata?: Record<string, unknown>;
}

// === Plugin Types ===

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  main: string;
  dependencies: Record<string, string>;
  peerDependencies?: Record<string, string>;
  permissions: string[];
  tools: string[];
  resources: string[];
  prompts: string[];
  events: string[];
  config?: Record<string, unknown>;
}

export interface PluginContext {
  config: Record<string, unknown>;
  logger: Logger;
  events: EventBus;
  cache: CacheInterface;
  database: DatabaseInterface;
  registerTool: (tool: MCPTool) => void;
  registerResource: (resource: MCPResource) => void;
  registerPrompt: (prompt: MCPPrompt) => void;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, handler: (data: unknown) => void) => void;
}

export interface Plugin {
  manifest: PluginManifest;
  initialize: (context: PluginContext) => Promise<void>;
  shutdown: () => Promise<void>;
}

// === Auth Types ===

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
  permissions: string[];
  tenantId?: string;
  isActive: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthCredentials {
  type: 'api-key' | 'jwt' | 'oauth2' | 'bearer';
  value: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
}

// === Event Types ===

export interface EventPayload {
  [key: string]: unknown;
}

export type EventHandler = (payload: EventPayload) => void | Promise<void>;

export interface EventSubscription {
  event: string;
  handler: EventHandler;
  id: string;
}

// === Cache Types ===

export interface CacheOptions {
  ttl?: number;
  namespace?: string;
  tags?: string[];
}

export interface CacheEntry {
  key: string;
  value: unknown;
  expiresAt?: Date;
  tags?: string[];
}

// === Database Types ===

export interface DatabaseConfig {
  url: string;
  poolMin: number;
  poolMax: number;
}

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  durationMs: number;
}

// === Logger Types ===

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  tenantId?: string;
  [key: string]: unknown;
}

export interface Logger {
  trace(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext, error?: Error): void;
  fatal(message: string, context?: LogContext, error?: Error): void;
  child(context: LogContext): Logger;
}

// === Server Types ===

export type TransportType = 'stdio' | 'http' | 'websocket' | 'sse';

export interface ServerConfig {
  name: string;
  version: string;
  transport: TransportType;
  port?: number;
  host?: string;
  stdio?: boolean;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    durationMs?: number;
  }>;
}

// === Tool Execution Types ===

export interface ToolExecutionContext {
  tool: MCPTool;
  args: Record<string, unknown>;
  user?: AuthUser;
  sessionId?: string;
  requestId: string;
  startTime: number;
}

export interface ToolExecutionResult {
  result: MCPToolResult;
  durationMs: number;
  cached: boolean;
  metadata?: Record<string, unknown>;
}

// === Error Types ===

export class VessieError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'VessieError';
  }
}

export class ToolError extends VessieError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TOOL_ERROR', 500, details);
    this.name = 'ToolError';
  }
}

export class ValidationError extends VessieError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends VessieError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends VessieError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'FORBIDDEN', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends VessieError {
  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class PluginError extends VessieError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PLUGIN_ERROR', 500, details);
    this.name = 'PluginError';
  }
}

// === Cache Interface ===

export interface CacheInterface {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(namespace?: string): Promise<void>;
  getStats(): Promise<CacheStats>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memoryUsage: number;
  hitRate: number;
}

// === Database Interface ===

export interface DatabaseInterface {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  transaction<T>(fn: (tx: DatabaseInterface) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

// === Event Bus Interface ===

export interface EventBus {
  emit(event: string, payload?: EventPayload): void;
  on(event: string, handler: EventHandler): string;
  off(event: string, subscriptionId: string): void;
  once(event: string, handler: EventHandler): string;
  removeAllListeners(event?: string): void;
  getEventNames(): string[];
}
</arg_value></tool_call>