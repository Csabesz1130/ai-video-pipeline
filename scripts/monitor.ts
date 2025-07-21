#!/usr/bin/env ts-node

import { AdvancedDebugger } from './debug';
import { Logger } from '../src/utils/logger';
import * as fs from 'fs/promises';

interface MonitorConfig {
  interval: number; // minutes
  alertThreshold: number; // health score below which to alert
  maxRetries: number;
  logFile: string;
  webhookUrl?: string;
}

interface HealthAlert {
  timestamp: string;
  healthScore: number;
  criticalIssues: string[];
  retryCount: number;
}

class ProductionMonitor {
  private logger: Logger;
  private config: MonitorConfig;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;

  constructor(config: Partial<MonitorConfig> = {}) {
    this.logger = new Logger('Monitor');
    this.config = {
      interval: 15, // Default: check every 15 minutes
      alertThreshold: 70, // Alert if health score < 70%
      maxRetries: 3,
      logFile: 'health-monitor.log',
      ...config
    };
  }

  private async logHealth(healthScore: number, issues: string[]): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      healthScore,
      issues,
      status: healthScore >= this.config.alertThreshold ? 'healthy' : 'unhealthy'
    };

    try {
      await fs.appendFile(
        this.config.logFile,
        JSON.stringify(logEntry) + '\n'
      );
    } catch (error) {
      this.logger.error('Failed to write health log', { error });
    }
  }

  private async sendAlert(alert: HealthAlert): Promise<void> {
    this.logger.warn('Health alert triggered', alert);

    // Console alert
    console.log('\n🚨 HEALTH ALERT 🚨');
    console.log(`Health Score: ${alert.healthScore}% (threshold: ${this.config.alertThreshold}%)`);
    console.log('Critical Issues:');
    alert.criticalIssues.forEach(issue => console.log(`  • ${issue}`));
    console.log(`Retry Count: ${alert.retryCount}/${this.config.maxRetries}`);
    console.log('='.repeat(50));

    // Webhook alert (if configured)
    if (this.config.webhookUrl) {
      try {
        const axios = require('axios');
        await axios.post(this.config.webhookUrl, {
          text: `🚨 AI Video Pipeline Health Alert\n` +
                `Health Score: ${alert.healthScore}%\n` +
                `Issues: ${alert.criticalIssues.join(', ')}\n` +
                `Time: ${alert.timestamp}`
        }, { timeout: 5000 });
        
        this.logger.info('Alert sent to webhook');
      } catch (error) {
        this.logger.error('Failed to send webhook alert', { error });
      }
    }
  }

  private async performHealthCheck(): Promise<{ score: number; issues: string[] }> {
    try {
      const debugger = new AdvancedDebugger();
      
      // Capture the results without running the full UI
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => logs.push(args.join(' '));
      
      await debugger.run();
      
      console.log = originalLog;
      
      // Parse results from the debugger
      const results = (debugger as any).results || [];
      const passed = results.filter((r: any) => r.status === 'pass').length;
      const failed = results.filter((r: any) => r.status === 'fail');
      const healthScore = Math.round((passed / results.length) * 100);
      const issues = failed.map((r: any) => `${r.component}: ${r.message}`);
      
      return { score: healthScore, issues };
      
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return { score: 0, issues: [`Health check failed: ${error}`] };
    }
  }

  private async checkHealth(): Promise<void> {
    this.logger.info('Running health check...');
    
    let retryCount = 0;
    let lastHealthScore = 0;
    let lastIssues: string[] = [];

    while (retryCount <= this.config.maxRetries) {
      const { score, issues } = await this.performHealthCheck();
      lastHealthScore = score;
      lastIssues = issues;

      await this.logHealth(score, issues);

      if (score >= this.config.alertThreshold) {
        this.logger.info(`Health check passed`, { score, issues: issues.length });
        return; // All good, exit retry loop
      }

      retryCount++;
      
      if (retryCount <= this.config.maxRetries) {
        this.logger.warn(`Health check failed (attempt ${retryCount}/${this.config.maxRetries})`, { score, issues });
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s before retry
      }
    }

    // All retries exhausted, send alert
    const alert: HealthAlert = {
      timestamp: new Date().toISOString(),
      healthScore: lastHealthScore,
      criticalIssues: lastIssues,
      retryCount: this.config.maxRetries
    };

    await this.sendAlert(alert);
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Monitor is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting production health monitor', {
      interval: this.config.interval,
      threshold: this.config.alertThreshold
    });

    // Run initial check
    await this.checkHealth();

    // Schedule periodic checks
    this.intervalId = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error) {
        this.logger.error('Scheduled health check failed', { error });
      }
    }, this.config.interval * 60 * 1000); // Convert minutes to milliseconds

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());

    this.logger.info('Health monitor started successfully');
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.logger.info('Health monitor stopped');
    process.exit(0);
  }

  public async getHealthHistory(): Promise<any[]> {
    try {
      const content = await fs.readFile(this.config.logFile, 'utf8');
      return content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      this.logger.error('Failed to read health history', { error });
      return [];
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';

  const config: Partial<MonitorConfig> = {};
  
  // Parse command line arguments
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    
    if (key && value) {
      switch (key) {
        case 'interval':
          config.interval = parseInt(value);
          break;
        case 'threshold':
          config.alertThreshold = parseInt(value);
          break;
        case 'webhook':
          config.webhookUrl = value;
          break;
        case 'logfile':
          config.logFile = value;
          break;
      }
    }
  }

  const monitor = new ProductionMonitor(config);

  switch (command) {
    case 'start':
      console.log('🔍 Starting AI Video Pipeline Health Monitor');
      console.log('=============================================');
      monitor.start().catch(error => {
        console.error('Failed to start monitor:', error);
        process.exit(1);
      });
      break;

    case 'check':
      console.log('🔍 Running single health check...');
      (async () => {
        const { score, issues } = await (monitor as any).performHealthCheck();
        console.log(`Health Score: ${score}%`);
        if (issues.length > 0) {
          console.log('Issues:');
          issues.forEach((issue: string) => console.log(`  • ${issue}`));
        }
        process.exit(score >= 70 ? 0 : 1);
      })();
      break;

    case 'history':
      console.log('📊 Health History');
      console.log('=================');
      monitor.getHealthHistory().then(history => {
        history.slice(0, 10).forEach(entry => {
          const time = new Date(entry.timestamp).toLocaleString();
          const status = entry.status === 'healthy' ? '✅' : '❌';
          console.log(`${status} ${time} - ${entry.healthScore}% (${entry.issues.length} issues)`);
        });
      });
      break;

    default:
      console.log('Usage: ts-node monitor.ts [command] [options]');
      console.log('Commands:');
      console.log('  start     - Start continuous monitoring');
      console.log('  check     - Run single health check');
      console.log('  history   - Show health history');
      console.log('Options:');
      console.log('  --interval [minutes]   - Check interval (default: 15)');
      console.log('  --threshold [percent]  - Alert threshold (default: 70)');
      console.log('  --webhook [url]        - Webhook for alerts');
      console.log('  --logfile [path]       - Log file path');
  }
}

export { ProductionMonitor };