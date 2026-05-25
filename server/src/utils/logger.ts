// 日志工具
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class Logger implements LoggerService {
  log(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${context || 'App'}] INFO: ${message}`);
  }

  error(message: string, trace?: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${context || 'App'}] ERROR: ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${context || 'App'}] WARN: ${message}`);
  }

  debug(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [${context || 'App'}] DEBUG: ${message}`);
  }

  verbose(message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${context || 'App'}] VERBOSE: ${message}`);
  }
}
