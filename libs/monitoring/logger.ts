import * as Sentry from "@sentry/nextjs";

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

interface LogContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      environment: process.env.NODE_ENV,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    }

    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      Sentry.captureException(new Error(message), {
        // Sentry types for level don't include custom, cast as any
        level: level as any,
        extra: { ...data, context: this.context },
      });
    }

    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', `log_${level}`, {
        message,
        ...this.context,
      });
    }
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | any) {
    this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
      ...error,
    });
  }

  fatal(message: string, error?: Error | any) {
    this.log(LogLevel.FATAL, message, {
      error: error?.message,
      stack: error?.stack,
      ...error,
    });
  }
}

export const logger = new Logger();


