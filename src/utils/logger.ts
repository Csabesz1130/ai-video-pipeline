export class Logger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, metadata?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    
    if (metadata) {
      return `${baseMessage} ${JSON.stringify(metadata)}`;
    }
    
    return baseMessage;
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    console.info(this.formatMessage('INFO', message, metadata));
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    console.error(this.formatMessage('ERROR', message, metadata));
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(this.formatMessage('WARN', message, metadata));
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, metadata));
    }
  }
} 