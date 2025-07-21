#!/usr/bin/env ts-node

import { AdvancedDebugger } from './debug';
import { PerformanceProfiler } from './performance-profiler';
import { SecurityScanner } from './security-scanner';
import { ProductionMonitor } from './monitor';
import { Logger } from '../src/utils/logger';
import * as fs from 'fs/promises';

interface DashboardConfig {
  includePerformance: boolean;
  includeSecurity: boolean;
  includeHealth: boolean;
  generateHtml: boolean;
  saveReports: boolean;
}

interface ComprehensiveReport {
  timestamp: string;
  duration: number;
  overallScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  health?: {
    score: number;
    issues: any[];
  };
  performance?: {
    score: number;
    metrics: any[];
    benchmarks: any[];
  };
  security?: {
    riskLevel: string;
    issues: any[];
    summary: any;
  };
  recommendations: string[];
  nextSteps: string[];
}

class DebugDashboard {
  private logger: Logger;
  private config: DashboardConfig;
  private startTime: number;

  constructor(config: Partial<DashboardConfig> = {}) {
    this.logger = new Logger('Dashboard');
    this.config = {
      includePerformance: true,
      includeSecurity: true,
      includeHealth: true,
      generateHtml: true,
      saveReports: true,
      ...config
    };
    this.startTime = Date.now();
  }

  private async runHealthCheck(): Promise<any> {
    if (!this.config.includeHealth) return null;

    console.log('🔍 Running Comprehensive Health Check...');
    
    try {
      // Capture debugger output
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => logs.push(args.join(' '));
      
      const debugger = new AdvancedDebugger();
      await debugger.run();
      
      console.log = originalLog;
      
      // Extract results
      const results = (debugger as any).results || [];
      const passed = results.filter((r: any) => r.status === 'pass').length;
      const warnings = results.filter((r: any) => r.status === 'warn').length;
      const failed = results.filter((r: any) => r.status === 'fail').length;
      const healthScore = Math.round((passed / results.length) * 100);
      
      return {
        score: healthScore,
        issues: results.filter((r: any) => r.status !== 'pass'),
        passed,
        warnings,
        failed,
        total: results.length
      };
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return { score: 0, issues: [{ message: `Health check failed: ${error}` }] };
    }
  }

  private async runPerformanceProfile(): Promise<any> {
    if (!this.config.includePerformance) return null;

    console.log('⚡ Running Performance Analysis...');
    
    try {
      // Capture profiler output
      const originalLog = console.log;
      const originalExit = process.exit;
      
      console.log = () => {}; // Suppress output
      process.exit = (() => {}) as any; // Prevent exit
      
      const profiler = new PerformanceProfiler();
      await profiler.run();
      
      console.log = originalLog;
      process.exit = originalExit;
      
      // Extract results
      const metrics = (profiler as any).metrics || [];
      const benchmarks = (profiler as any).benchmarks || [];
      const goodMetrics = metrics.filter((m: any) => m.status === 'good').length;
      const perfScore = Math.round((goodMetrics / metrics.length) * 100);
      
      return {
        score: perfScore,
        metrics: metrics.filter((m: any) => m.status !== 'good'),
        benchmarks,
        total: metrics.length,
        good: goodMetrics
      };
    } catch (error) {
      this.logger.error('Performance profiling failed', { error });
      return { score: 0, metrics: [{ message: `Performance check failed: ${error}` }] };
    }
  }

  private async runSecurityScan(): Promise<any> {
    if (!this.config.includeSecurity) return null;

    console.log('🔒 Running Security Analysis...');
    
    try {
      // Capture security scanner output
      const originalLog = console.log;
      const originalExit = process.exit;
      
      console.log = () => {}; // Suppress output
      process.exit = (() => {}) as any; // Prevent exit
      
      const scanner = new SecurityScanner();
      const report = await scanner.run();
      
      console.log = originalLog;
      process.exit = originalExit;
      
      return {
        riskLevel: report.overallRisk,
        issues: report.issues,
        summary: report.summary
      };
    } catch (error) {
      this.logger.error('Security scan failed', { error });
      return { 
        riskLevel: 'critical', 
        issues: [{ severity: 'critical', title: `Security scan failed: ${error}` }],
        summary: { critical: 1, high: 0, medium: 0, low: 0, total: 1 }
      };
    }
  }

  private calculateOverallScore(health: any, performance: any, security: any): number {
    let totalScore = 0;
    let components = 0;

    if (health) {
      totalScore += health.score;
      components++;
    }

    if (performance) {
      totalScore += performance.score;
      components++;
    }

    if (security) {
      // Convert security risk to score
      const securityScore = security.riskLevel === 'low' ? 90 :
                           security.riskLevel === 'medium' ? 70 :
                           security.riskLevel === 'high' ? 40 : 10;
      totalScore += securityScore;
      components++;
    }

    return components > 0 ? Math.round(totalScore / components) : 0;
  }

  private getStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  private generateRecommendations(health: any, performance: any, security: any): string[] {
    const recommendations: string[] = [];

    // Health recommendations
    if (health && health.score < 80) {
      recommendations.push('Address health check failures before deployment');
      if (health.failed > 0) {
        recommendations.push('Fix critical infrastructure issues identified in health check');
      }
    }

    // Performance recommendations
    if (performance && performance.score < 70) {
      recommendations.push('Optimize application performance before production');
      const criticalMetrics = performance.metrics.filter((m: any) => m.status === 'critical');
      if (criticalMetrics.length > 0) {
        recommendations.push('Address critical performance bottlenecks immediately');
      }
    }

    // Security recommendations
    if (security) {
      if (security.riskLevel === 'critical' || security.summary.critical > 0) {
        recommendations.push('URGENT: Address critical security vulnerabilities immediately');
      } else if (security.riskLevel === 'high' || security.summary.high > 0) {
        recommendations.push('Address high-priority security issues before deployment');
      }
      
      if (security.summary.medium > 5) {
        recommendations.push('Review and address medium-priority security issues');
      }
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('System is in good health - continue monitoring');
      recommendations.push('Consider setting up automated monitoring for production');
    }

    return recommendations;
  }

  private generateNextSteps(health: any, performance: any, security: any, overallScore: number): string[] {
    const steps: string[] = [];

    if (overallScore < 60) {
      steps.push('1. Address all critical and high-priority issues before proceeding');
      steps.push('2. Re-run debugging dashboard to verify fixes');
      steps.push('3. Consider staging environment testing');
    } else if (overallScore < 80) {
      steps.push('1. Review and prioritize medium-priority issues');
      steps.push('2. Implement monitoring and alerting');
      steps.push('3. Schedule regular health checks');
    } else {
      steps.push('1. Set up production monitoring');
      steps.push('2. Implement automated health checks');
      steps.push('3. Schedule periodic security scans');
    }

    steps.push('4. Review generated reports for detailed action items');
    steps.push('5. Document any configuration changes made');

    return steps;
  }

  private async generateHtmlReport(report: ComprehensiveReport): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Video Pipeline Debug Dashboard</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f5f5f5; 
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;
            text-align: center;
        }
        .score-circle {
            width: 120px; height: 120px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; font-weight: bold; margin: 20px auto;
            color: white;
        }
        .excellent { background: #4CAF50; }
        .good { background: #2196F3; }
        .fair { background: #FF9800; }
        .poor { background: #F44336; }
        .critical { background: #B71C1C; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .cards { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px; margin-bottom: 30px;
        }
        .card { 
            background: white; border-radius: 10px; padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .card h3 { margin-top: 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .status-bar {
            width: 100%; height: 20px; background: #eee; border-radius: 10px;
            overflow: hidden; margin: 10px 0;
        }
        .status-fill {
            height: 100%; border-radius: 10px; transition: width 0.3s ease;
        }
        .issue { 
            margin: 10px 0; padding: 15px; border-radius: 5px;
            border-left: 4px solid;
        }
        .issue.critical { background: #ffebee; border-color: #f44336; }
        .issue.high { background: #fff3e0; border-color: #ff9800; }
        .issue.medium { background: #f3e5f5; border-color: #9c27b0; }
        .issue.low { background: #e8f5e8; border-color: #4caf50; }
        .recommendations { background: #e3f2fd; border-radius: 10px; padding: 20px; }
        .recommendations h3 { color: #1976d2; }
        .recommendations ol { padding-left: 20px; }
        .recommendations li { margin: 10px 0; }
        .footer { 
            text-align: center; color: #666; margin-top: 30px;
            font-size: 14px;
        }
        .metric { 
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 0; border-bottom: 1px solid #eee;
        }
        .metric:last-child { border-bottom: none; }
        .metric-value { font-weight: bold; }
        .benchmark { 
            background: #f8f9fa; padding: 10px; margin: 5px 0;
            border-radius: 5px; font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 AI Video Pipeline Debug Dashboard</h1>
            <p>Comprehensive System Analysis Report</p>
            <p><small>Generated: ${new Date(report.timestamp).toLocaleString()}</small></p>
            <div class="score-circle ${report.status}">
                ${report.overallScore}%
            </div>
            <p>Overall System Health: <strong>${report.status.toUpperCase()}</strong></p>
        </div>

        <div class="cards">
            ${report.health ? `
            <div class="card">
                <h3>🏥 Health Check</h3>
                <div class="status-bar">
                    <div class="status-fill" style="width: ${report.health.score}%; background: ${report.health.score > 80 ? '#4CAF50' : report.health.score > 60 ? '#FF9800' : '#F44336'}"></div>
                </div>
                <p><strong>Score: ${report.health.score}%</strong></p>
                <div class="metric">
                    <span>Issues Found:</span>
                    <span class="metric-value">${report.health.issues.length}</span>
                </div>
                ${report.health.issues.slice(0, 3).map((issue: any) => `
                    <div class="issue ${issue.status || 'medium'}">
                        <strong>${issue.component || 'System'}:</strong> ${issue.message}
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${report.performance ? `
            <div class="card">
                <h3>⚡ Performance</h3>
                <div class="status-bar">
                    <div class="status-fill" style="width: ${report.performance.score}%; background: ${report.performance.score > 80 ? '#4CAF50' : report.performance.score > 60 ? '#FF9800' : '#F44336'}"></div>
                </div>
                <p><strong>Score: ${report.performance.score}%</strong></p>
                <div class="metric">
                    <span>Issues Found:</span>
                    <span class="metric-value">${report.performance.metrics.length}</span>
                </div>
                ${report.performance.benchmarks.slice(0, 2).map((bench: any) => `
                    <div class="benchmark">
                        <strong>${bench.operation}:</strong><br>
                        ${Math.round(bench.throughput).toLocaleString()} ops/sec
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${report.security ? `
            <div class="card">
                <h3>🔒 Security</h3>
                <div class="status-bar">
                    <div class="status-fill" style="width: ${report.security.riskLevel === 'low' ? '90' : report.security.riskLevel === 'medium' ? '70' : report.security.riskLevel === 'high' ? '40' : '10'}%; background: ${report.security.riskLevel === 'low' ? '#4CAF50' : report.security.riskLevel === 'medium' ? '#FF9800' : '#F44336'}"></div>
                </div>
                <p><strong>Risk Level: ${report.security.riskLevel.toUpperCase()}</strong></p>
                <div class="metric">
                    <span>🚨 Critical:</span>
                    <span class="metric-value">${report.security.summary.critical}</span>
                </div>
                <div class="metric">
                    <span>🔴 High:</span>
                    <span class="metric-value">${report.security.summary.high}</span>
                </div>
                <div class="metric">
                    <span>🟡 Medium:</span>
                    <span class="metric-value">${report.security.summary.medium}</span>
                </div>
                ${report.security.issues.slice(0, 3).map((issue: any) => `
                    <div class="issue ${issue.severity}">
                        <strong>${issue.category}:</strong> ${issue.title}
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>

        <div class="recommendations">
            <h3>💡 Recommendations</h3>
            <ol>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ol>
        </div>

        <div class="recommendations">
            <h3>📋 Next Steps</h3>
            <ol>
                ${report.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>

        <div class="footer">
            <p>Debug completed in ${report.duration}ms | AI Video Pipeline Debug Dashboard v1.0</p>
            <p>For detailed analysis, review the individual JSON reports generated alongside this dashboard.</p>
        </div>
    </div>
</body>
</html>`;

    const htmlPath = `debug-dashboard-${Date.now()}.html`;
    await fs.writeFile(htmlPath, html);
    return htmlPath;
  }

  private printSummary(report: ComprehensiveReport): void {
    const statusEmoji = {
      excellent: '🟢',
      good: '🔵', 
      fair: '🟡',
      poor: '🟠',
      critical: '🚨'
    };

    console.log('\n' + '='.repeat(60));
    console.log('🔍 AI VIDEO PIPELINE DEBUG DASHBOARD SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n${statusEmoji[report.status]} Overall Status: ${report.status.toUpperCase()} (${report.overallScore}%)`);
    console.log(`⏱️  Analysis Duration: ${report.duration}ms`);
    console.log(`📅 Timestamp: ${new Date(report.timestamp).toLocaleString()}`);

    if (report.health) {
      console.log(`\n🏥 Health Check: ${report.health.score}% (${report.health.issues.length} issues)`);
    }

    if (report.performance) {
      console.log(`⚡ Performance: ${report.performance.score}% (${report.performance.metrics.length} issues)`);
    }

    if (report.security) {
      console.log(`🔒 Security: ${report.security.riskLevel.toUpperCase()} risk (${report.security.summary.total} issues)`);
    }

    console.log('\n💡 Key Recommendations:');
    report.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });

    console.log('\n📋 Immediate Next Steps:');
    report.nextSteps.slice(0, 3).forEach((step, i) => {
      console.log(`   ${step}`);
    });

    if (report.status === 'critical' || report.status === 'poor') {
      console.log('\n🚨 ATTENTION: Critical issues detected. Address immediately before deployment.');
    } else if (report.status === 'fair') {
      console.log('\n⚠️  WARNING: Several issues detected. Review and address before production.');
    } else {
      console.log('\n✅ GOOD: System is in acceptable condition for deployment.');
    }

    console.log('\n' + '='.repeat(60));
  }

  public async run(): Promise<ComprehensiveReport> {
    console.log('🚀 Starting Comprehensive System Analysis...\n');

    const [health, performance, security] = await Promise.all([
      this.runHealthCheck(),
      this.runPerformanceProfile(),
      this.runSecurityScan()
    ]);

    const overallScore = this.calculateOverallScore(health, performance, security);
    const status = this.getStatus(overallScore);
    const recommendations = this.generateRecommendations(health, performance, security);
    const nextSteps = this.generateNextSteps(health, performance, security, overallScore);

    const report: ComprehensiveReport = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      overallScore,
      status,
      health,
      performance,
      security,
      recommendations,
      nextSteps
    };

    // Generate outputs
    if (this.config.saveReports) {
      const reportPath = `comprehensive-report-${Date.now()}.json`;
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Comprehensive report saved: ${reportPath}`);
    }

    if (this.config.generateHtml) {
      const htmlPath = await this.generateHtmlReport(report);
      console.log(`🌐 HTML dashboard generated: ${htmlPath}`);
    }

    this.printSummary(report);

    return report;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const config: Partial<DashboardConfig> = {};
  
  // Parse CLI arguments
  if (args.includes('--no-performance')) config.includePerformance = false;
  if (args.includes('--no-security')) config.includeSecurity = false;
  if (args.includes('--no-health')) config.includeHealth = false;
  if (args.includes('--no-html')) config.generateHtml = false;
  if (args.includes('--no-save')) config.saveReports = false;

  const dashboard = new DebugDashboard(config);
  
  dashboard.run().then(report => {
    const exitCode = report.status === 'critical' || report.status === 'poor' ? 1 : 0;
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Dashboard failed:', error);
    process.exit(1);
  });
}

export { DebugDashboard };