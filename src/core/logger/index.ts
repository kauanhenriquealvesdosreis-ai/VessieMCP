import { createLogger as createPinoLogger, Logger as PinoLogger, LoggerOptions } from 'pino';
import { config } from '../config';
import type { LogLevel, LogContext, Logger } from '../types';

class VessieLogger implements Logger {
  private logger: PinoLogger;
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
    const options: LoggerOptions = {
      level: config.get('LOG_LEVEL'),
      base: {
        pid: process.pid,
        hostname: require('os').hostname(),
      },
      timestamp: require('pino').stdTimeFunctions.isoTime,
      transport: config.isDevelopment()
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
            },
          }
        : {
            target: 'pino/file',
            options: {
              destination: `${config.get('LOG_DIR')}/app.log`,
              mkdir: true,
            },
          },
    };
    this.logger = createPinoLogger(options);
  }

  private formatMessage(message: string, context?: LogContext): [string, LogContext] {
    const mergedContext = { ...this.context, ...context };
    return [message, mergedContext];
  }

  trace(message: string, context?: LogContext): void {
    const [msg, ctx] = this.formatMessage(message, context);
    this.logger.trace(ctx, msg);
  }

  debug(message: string, context?: LogContext): void {
    const [msg, ctx] = this.formatMessage(message, context);
    this.logger.debug(ctx, msg);
  }

  info(message: string, context?: LogContext): void {
    const [msg, ctx] = this.formatMessage(message, context);
    this.logger.info(ctx, msg);
  }

  warn(message: string, context?: LogContext): void {
    const [msg, ctx] = this.formatMessage(message, context);
    this.logger.warn(ctx, msg);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const [msg, ctx] = this.formatMessage(message, context);
    if (error) {
      this.logger.error({ ...ctx, err: error, stack: error.stack }, msg);
    } else {
      this.logger.error(ctx, msg);
    }
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    const [msg, ctx] = this.formatMessage(message, context);
    if (error) {
      this.logger.fatal({ ...ctx, err: error, stack: error.stack }, msg);
    } else {
      this.logger.fatal(ctx, msg);
    }
  }

  child(context: LogContext): Logger {
    return new VessieLogger({ ...this.context, ...context });
  }
}

export function createLogger(context?: LogContext): Logger {
  return new VessieLogger(context);
}

export const logger = createLogger();
export { VessieLogger };
</arg_value></tool_call>