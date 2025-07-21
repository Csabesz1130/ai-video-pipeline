#!/usr/bin/env ts-node

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../src/utils/logger';

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
  cve?: string;
}

interface SecurityReport {
  timestamp: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  issues: SecurityIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

class SecurityScanner {
  private logger: Logger;
  private issues: SecurityIssue[] = [];

  constructor() {
    this.logger = new Logger('SecurityScanner');
  }

  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
    const emoji = this.getSeverityEmoji(issue.severity);
    const location = issue.file ? ` (${issue.file}${issue.line ? `:${issue.line}` : ''})` : '';
    console.log(`${emoji} [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.title}${location}`);
    console.log(`   📝 ${issue.description}`);
    console.log(`   💡 ${issue.recommendation}`);
    if (issue.cve) {
      console.log(`   🔗 CVE: ${issue.cve}`);
    }
    console.log('');
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  private async scanEnvironmentVariables(): Promise<void> {
    console.log('🔍 Scanning Environment Variables...');

    // Check for sensitive data in environment variables
    const sensitivePatterns = [
      { pattern: /password/i, description: 'Password in environment variable name' },
      { pattern: /secret/i, description: 'Secret in environment variable name' },
      { pattern: /private.*key/i, description: 'Private key in environment variable name' },
      { pattern: /token/i, description: 'Token in environment variable name' }
    ];

    Object.keys(process.env).forEach(key => {
      sensitivePatterns.forEach(({ pattern, description }) => {
        if (pattern.test(key)) {
          const value = process.env[key] || '';
          if (value.length > 0) {
            this.addIssue({
              severity: 'medium',
              category: 'Sensitive Data',
              title: `Potentially sensitive environment variable: ${key}`,
              description,
              recommendation: 'Ensure this environment variable is properly protected and not logged'
            });
          }
        }
      });

      // Check for hardcoded values that look like secrets
      const value = process.env[key] || '';
      if (value.length > 20 && /^[A-Za-z0-9+/=]+$/.test(value)) {
        this.addIssue({
          severity: 'low',
          category: 'Sensitive Data',
          title: `Environment variable ${key} contains potential secret`,
          description: 'Long alphanumeric string that could be a secret',
          recommendation: 'Verify this is not a hardcoded secret'
        });
      }
    });

    // Check for missing security-related environment variables
    const securityEnvVars = [
      'NODE_ENV',
      'CORS_ORIGIN',
      'SESSION_SECRET',
      'JWT_SECRET'
    ];

    securityEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        this.addIssue({
          severity: 'medium',
          category: 'Configuration',
          title: `Missing security environment variable: ${envVar}`,
          description: 'Important security configuration is missing',
          recommendation: `Set ${envVar} environment variable for better security`
        });
      }
    });
  }

  private async scanDependencyVulnerabilities(): Promise<void> {
    console.log('📦 Scanning Dependencies for Vulnerabilities...');

    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditOutput);

      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([pkgName, vuln]: [string, any]) => {
          const severity = vuln.severity;
          const via = Array.isArray(vuln.via) ? vuln.via[0] : vuln.via;
          
          this.addIssue({
            severity: severity === 'moderate' ? 'medium' : severity,
            category: 'Dependency Vulnerability',
            title: `Vulnerable dependency: ${pkgName}`,
            description: via.title || `${pkgName} has known vulnerabilities`,
            recommendation: `Update ${pkgName} to a secure version`,
            cve: via.cve || undefined
          });
        });
      }
    } catch (error) {
      this.logger.warn('Could not run npm audit', { error });
      
      // Fallback: check for known vulnerable packages
      try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        const knownVulnerable = [
          { name: 'lodash', version: '<4.17.21', severity: 'high' as const },
          { name: 'axios', version: '<0.21.1', severity: 'medium' as const },
          { name: 'yargs-parser', version: '<13.1.2', severity: 'high' as const },
          { name: 'node-fetch', version: '<2.6.7', severity: 'high' as const }
        ];

        knownVulnerable.forEach(vuln => {
          if (allDeps[vuln.name]) {
            this.addIssue({
              severity: vuln.severity,
              category: 'Dependency Vulnerability',
              title: `Potentially vulnerable dependency: ${vuln.name}`,
              description: `${vuln.name} version ${vuln.version} has known vulnerabilities`,
              recommendation: `Update ${vuln.name} to the latest version`
            });
          }
        });
      } catch (err) {
        this.logger.error('Could not check dependencies', { err });
      }
    }
  }

  private async scanSourceCode(): Promise<void> {
    console.log('📄 Scanning Source Code for Security Issues...');

    const patterns = [
      {
        pattern: /(password|pwd|passwd)\s*[=:]\s*['""][^'""]+['""]|password\s*[=:]\s*\w+/gi,
        severity: 'high' as const,
        category: 'Hardcoded Credentials',
        title: 'Hardcoded password detected',
        description: 'Password appears to be hardcoded in source code',
        recommendation: 'Remove hardcoded password and use environment variables'
      },
      {
        pattern: /(api[_-]?key|apikey|secret[_-]?key)\s*[=:]\s*['""][^'""]{8,}['""]|secret\s*[=:]\s*\w{8,}/gi,
        severity: 'critical' as const,
        category: 'Hardcoded Credentials',
        title: 'Hardcoded API key or secret detected',
        description: 'API key or secret appears to be hardcoded',
        recommendation: 'Move secrets to environment variables or secure key management'
      },
      {
        pattern: /eval\s*\(/gi,
        severity: 'high' as const,
        category: 'Code Injection',
        title: 'Use of eval() detected',
        description: 'eval() can execute arbitrary code and is dangerous',
        recommendation: 'Avoid using eval() and find safer alternatives'
      },
      {
        pattern: /document\.write\s*\(/gi,
        severity: 'medium' as const,
        category: 'XSS Vulnerability',
        title: 'Use of document.write() detected',
        description: 'document.write() can lead to XSS vulnerabilities',
        recommendation: 'Use safer DOM manipulation methods'
      },
      {
        pattern: /innerHTML\s*[=]/gi,
        severity: 'medium' as const,
        category: 'XSS Vulnerability',
        title: 'Direct innerHTML assignment detected',
        description: 'Direct innerHTML assignment can lead to XSS if user input is involved',
        recommendation: 'Use textContent or properly sanitize content'
      },
      {
        pattern: /console\.(log|error|warn|info|debug)\s*\(/gi,
        severity: 'low' as const,
        category: 'Information Disclosure',
        title: 'Console logging detected',
        description: 'Console logs might leak sensitive information in production',
        recommendation: 'Remove or properly manage console logs in production'
      },
      {
        pattern: /TODO|FIXME|HACK|XXX/gi,
        severity: 'low' as const,
        category: 'Code Quality',
        title: 'TODO/FIXME comment detected',
        description: 'Unfinished code or temporary fixes detected',
        recommendation: 'Review and complete TODO items before production'
      }
    ];

    const scanFile = async (filePath: string): Promise<void> => {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');

        patterns.forEach(pattern => {
          let match;
          const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
          
          lines.forEach((line, lineNumber) => {
            while ((match = regex.exec(line)) !== null) {
              this.addIssue({
                severity: pattern.severity,
                category: pattern.category,
                title: pattern.title,
                description: pattern.description,
                file: filePath,
                line: lineNumber + 1,
                recommendation: pattern.recommendation
              });
            }
          });
        });
      } catch (error) {
        this.logger.warn(`Could not scan file: ${filePath}`, { error });
      }
    };

    const scanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory() && !['node_modules', '.git', 'dist'].includes(entry.name)) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
            await scanFile(fullPath);
          }
        }
      } catch (error) {
        this.logger.warn(`Could not scan directory: ${dirPath}`, { error });
      }
    };

    await scanDirectory('./src');
  }

  private async scanFilePermissions(): Promise<void> {
    console.log('🔐 Scanning File Permissions...');

    const checkFile = async (filePath: string, expectedPerms: number): Promise<void> => {
      try {
        const stats = await fs.stat(filePath);
        const perms = stats.mode & parseInt('777', 8);
        
        if (perms > expectedPerms) {
          this.addIssue({
            severity: 'medium',
            category: 'File Permissions',
            title: `Overly permissive file: ${filePath}`,
            description: `File has permissions ${perms.toString(8)}, expected max ${expectedPerms.toString(8)}`,
            file: filePath,
            recommendation: `Change file permissions: chmod ${expectedPerms.toString(8)} ${filePath}`
          });
        }
      } catch (error) {
        // File doesn't exist, ignore
      }
    };

    const sensitiveFiles = [
      { path: '.env', perms: 0o600 },
      { path: '.env.local', perms: 0o600 },
      { path: '.env.production', perms: 0o600 },
      { path: 'package.json', perms: 0o644 },
      { path: 'package-lock.json', perms: 0o644 }
    ];

    for (const { path: filePath, perms } of sensitiveFiles) {
      await checkFile(filePath, perms);
    }
  }

  private async scanNetworkSecurity(): Promise<void> {
    console.log('🌐 Scanning Network Security Configuration...');

    // Check for HTTP vs HTTPS usage in configuration
    const checkHttpsUsage = async (filePath: string): Promise<void> => {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        const httpUrls = content.match(/http:\/\/[^\s"']+/gi);
        if (httpUrls) {
          httpUrls.forEach(url => {
            if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
              this.addIssue({
                severity: 'medium',
                category: 'Network Security',
                title: 'HTTP URL detected',
                description: `Non-secure HTTP URL found: ${url}`,
                file: filePath,
                recommendation: 'Use HTTPS instead of HTTP for external URLs'
              });
            }
          });
        }
      } catch (error) {
        // Ignore if file doesn't exist
      }
    };

    const configFiles = ['src/config.ts', 'src/config/index.ts', '.env.example'];
    for (const file of configFiles) {
      await checkHttpsUsage(file);
    }

    // Check for CORS configuration
    try {
      const hasExpressConfig = await fs.access('src/api/server.ts').then(() => true).catch(() => false);
      if (hasExpressConfig) {
        const serverContent = await fs.readFile('src/api/server.ts', 'utf8');
        
        if (!serverContent.includes('cors') && !serverContent.includes('Access-Control')) {
          this.addIssue({
            severity: 'medium',
            category: 'Network Security',
            title: 'CORS not configured',
            description: 'No CORS configuration detected in server setup',
            file: 'src/api/server.ts',
            recommendation: 'Configure CORS properly to prevent cross-origin attacks'
          });
        }
      }
    } catch (error) {
      // Server file doesn't exist or couldn't be read
    }
  }

  private async scanAuthentication(): Promise<void> {
    console.log('🔑 Scanning Authentication & Authorization...');

    // Check for JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      if (jwtSecret.length < 32) {
        this.addIssue({
          severity: 'high',
          category: 'Authentication',
          title: 'Weak JWT secret',
          description: 'JWT secret is too short and may be vulnerable to brute force',
          recommendation: 'Use a JWT secret that is at least 32 characters long'
        });
      }
      
      if (/^[a-zA-Z0-9]+$/.test(jwtSecret) && jwtSecret.length < 64) {
        this.addIssue({
          severity: 'medium',
          category: 'Authentication',
          title: 'Simple JWT secret pattern',
          description: 'JWT secret uses simple alphanumeric pattern',
          recommendation: 'Use a more complex JWT secret with special characters'
        });
      }
    }

    // Check for session configuration
    const sessionSecret = process.env.SESSION_SECRET;
    if (sessionSecret && sessionSecret.length < 32) {
      this.addIssue({
        severity: 'high',
        category: 'Authentication',
        title: 'Weak session secret',
        description: 'Session secret is too short',
        recommendation: 'Use a session secret that is at least 32 characters long'
      });
    }
  }

  private async scanInputValidation(): Promise<void> {
    console.log('🔍 Scanning Input Validation...');

    // Check for express.json() usage without size limits
    try {
      const serverContent = await fs.readFile('src/api/server.ts', 'utf8');
      
      if (serverContent.includes('express.json()') && !serverContent.includes('limit:')) {
        this.addIssue({
          severity: 'medium',
          category: 'Input Validation',
          title: 'No request size limit configured',
          description: 'express.json() without size limit can lead to DoS attacks',
          file: 'src/api/server.ts',
          recommendation: 'Add size limit: express.json({ limit: "10mb" })'
        });
      }

      // Check for SQL injection vulnerabilities (even though this is NoSQL)
      if (serverContent.includes('query') && serverContent.includes('+')) {
        this.addIssue({
          severity: 'high',
          category: 'Input Validation',
          title: 'Potential SQL injection vulnerability',
          description: 'String concatenation in query detected',
          file: 'src/api/server.ts',
          recommendation: 'Use parameterized queries or prepared statements'
        });
      }
    } catch (error) {
      // Server file doesn't exist
    }
  }

  private calculateOverallRisk(): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = this.issues.filter(i => i.severity === 'critical').length;
    const highCount = this.issues.filter(i => i.severity === 'high').length;
    const mediumCount = this.issues.filter(i => i.severity === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0 || mediumCount > 5) return 'medium';
    return 'low';
  }

  private generateSecurityReport(): SecurityReport {
    const summary = {
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
      total: this.issues.length
    };

    const report: SecurityReport = {
      timestamp: new Date().toISOString(),
      overallRisk: this.calculateOverallRisk(),
      issues: this.issues,
      summary
    };

    console.log('\n🔒 Security Scan Report');
    console.log('='.repeat(50));
    
    console.log(`\n📊 Summary:`);
    console.log(`   🚨 Critical: ${summary.critical}`);
    console.log(`   🔴 High: ${summary.high}`);
    console.log(`   🟡 Medium: ${summary.medium}`);
    console.log(`   🟢 Low: ${summary.low}`);
    console.log(`   📊 Total Issues: ${summary.total}`);
    
    const riskEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🚨'
    };
    
    console.log(`\n🎯 Overall Risk Level: ${riskEmoji[report.overallRisk]} ${report.overallRisk.toUpperCase()}`);

    if (summary.critical > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND - IMMEDIATE ACTION REQUIRED');
    } else if (summary.high > 0) {
      console.log('\n🔴 High severity issues found - should be addressed soon');
    } else if (summary.medium > 0) {
      console.log('\n🟡 Medium severity issues found - should be reviewed');
    } else {
      console.log('\n🟢 No critical security issues found');
    }

    // Save detailed report
    const reportPath = `security-report-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed security report saved to: ${reportPath}`);

    return report;
  }

  public async run(): Promise<SecurityReport> {
    console.log('🔒 AI Video Pipeline Security Scanner');
    console.log('====================================\n');

    try {
      await this.scanEnvironmentVariables();
      await this.scanDependencyVulnerabilities();
      await this.scanSourceCode();
      await this.scanFilePermissions();
      await this.scanNetworkSecurity();
      await this.scanAuthentication();
      await this.scanInputValidation();

      const report = this.generateSecurityReport();
      
      // Exit with error code if critical or high severity issues found
      const hasHighRisk = report.summary.critical > 0 || report.summary.high > 0;
      process.exit(hasHighRisk ? 1 : 0);

    } catch (error) {
      console.error('❌ Security scan failed:', error);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.run();
}

export { SecurityScanner };